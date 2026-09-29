import { create } from 'zustand';
import { Animal, Species, HealthStatus, AnimalPurpose, AnimalSex, FisheryDetails } from '../types/database';
import { api } from '../lib/api';
import { AnimalRepository } from '../lib/repositories/animal.repository';
import { getBreedAsset } from '../lib/breed_assets';

export type SpeciesFilter = 'all' | 'cow' | 'buffalo' | 'goat' | 'sheep' | 'fishery' | 'other';
export type StatusFilter = 'all' | 'healthy' | 'under_treatment' | 'sick' | 'quarantine';
export type ViewMode = 'grid' | 'table';

export interface CreateAnimalInput {
  animal_code: string;
  species: Species;
  breed?: string | null;
  dob?: string | null;
  sex: AnimalSex;
  weight_kg: number;
  weight?: number;
  purpose: AnimalPurpose;
  health_status?: HealthStatus;
  fishery_details?: FisheryDetails | null;
  image_url?: string | null;
  cloudinary_public_id?: string | null;
  notes?: string;
  qr_token?: string;
}

export interface LivestockState {
  animals: Animal[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Filters & View Mode
  speciesFilter: SpeciesFilter;
  statusFilter: StatusFilter;
  searchQuery: string;
  viewMode: ViewMode;

  // Actions
  fetchAnimals: (params?: { species?: string; status?: string; search?: string }) => Promise<void>;
  registerAnimal: (input: CreateAnimalInput) => Promise<Animal>;
  updateAnimal: (id: string, updates: Partial<Animal>) => Promise<Animal | null>;
  deleteAnimal: (id: string) => Promise<boolean>;

  setSpeciesFilter: (filter: SpeciesFilter) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useLivestockStore = create<LivestockState>((set, get) => ({
  animals: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  speciesFilter: 'all',
  statusFilter: 'all',
  searchQuery: '',
  viewMode: 'grid',

  fetchAnimals: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { speciesFilter, statusFilter, searchQuery } = get();
      const sp = params?.species ?? speciesFilter;
      const st = params?.status ?? statusFilter;
      const search = params?.search ?? searchQuery;

      const queryParams: Record<string, string> = {};
      if (sp && sp !== 'all') queryParams.species = sp;
      if (st && st !== 'all') queryParams.status = st;
      if (search && search.trim()) queryParams.search = search.trim();

      // 1. Try Common Backend API
      try {
        const res = await api.get<Animal[]>('animals', { params: queryParams });
        if (Array.isArray(res) && res.length > 0) {
          set({ animals: res, isLoading: false });
          return;
        }
      } catch (apiErr) {
        console.warn('Backend API /animals unavailable, attempting Repository fallback:', apiErr);
      }

      // 2. Repository / Supabase / Seed Fallback
      const repoAnimals = await AnimalRepository.getAnimals({
        species: sp as Species | 'all',
        status: st as HealthStatus | 'all',
        search,
      });

      set({ animals: repoAnimals, isLoading: false });
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Failed to load herd census', isLoading: false });
    }
  },

  registerAnimal: async (input: CreateAnimalInput): Promise<Animal> => {
    set({ isSubmitting: true, error: null });

    const generatedQrToken =
      input.qr_token ||
      `QR-${(input.species || 'ANIMAL').toUpperCase()}-${input.animal_code.toUpperCase().replace(/\s+/g, '-')}`;

    const optimisticAnimal: Animal = {
      id: `temp-${Date.now()}`,
      farm_id: 'farm-pb-01',
      animal_code: input.animal_code,
      species: input.species,
      breed: input.breed || (input.species === 'fishery' ? 'Rohu & Catla' : 'Indigenous'),
      dob: input.dob || new Date().toISOString().split('T')[0],
      sex: input.sex || (input.species === 'fishery' ? 'collective' : 'female'),
      weight: Number(input.weight_kg || input.weight || 0),
      weight_kg: Number(input.weight_kg || input.weight || 0),
      purpose: input.purpose,
      health_status: input.health_status || 'healthy',
      qr_token: generatedQrToken,
      image_url:
        input.image_url || getBreedAsset(input.species, input.breed || '').imageUrl,
      cloudinary_public_id: input.cloudinary_public_id || null,
      fishery_details: input.fishery_details || null,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI Update: Prepend animal immediately
    const prevAnimals = get().animals;
    set({ animals: [optimisticAnimal, ...prevAnimals] });

    try {
      let savedAnimal: Animal | null = null;

      // 1. Try Common Backend API POST
      try {
        const response = await api.post<Animal>('animals', {
          animal_code: input.animal_code,
          species: input.species,
          breed: input.breed,
          dob: input.dob,
          sex: input.sex,
          weight: optimisticAnimal.weight,
          weight_kg: optimisticAnimal.weight,
          purpose: input.purpose,
          health_status: input.health_status || 'healthy',
          fishery_details: input.fishery_details,
          image_url: input.image_url,
          cloudinary_public_id: input.cloudinary_public_id,
          notes: input.notes,
        });

        if (response && response.id) {
          savedAnimal = response;
        }
      } catch (postErr) {
        console.warn('Backend POST /animals fallback active:', postErr);
      }

      // 2. Repository fallback if API failed or unconfigured
      if (!savedAnimal) {
        savedAnimal = await AnimalRepository.createAnimal(optimisticAnimal);
      }

      // Reconcile optimistic item with confirmed backend ID
      set((state) => ({
        animals: state.animals.map((a) => (a.id === optimisticAnimal.id ? savedAnimal! : a)),
        isSubmitting: false,
      }));

      return savedAnimal;
    } catch (err: unknown) {
      const error = err as Error;
      // Revert optimistic addition on failure
      set({ animals: prevAnimals, isSubmitting: false, error: error.message });
      throw error;
    }
  },

  updateAnimal: async (id: string, updates: Partial<Animal>): Promise<Animal | null> => {
    const prevAnimals = get().animals;
    // Optimistic update
    set((state) => ({
      animals: state.animals.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));

    try {
      // 1. Try Backend PUT
      try {
        const response = await api.put<Animal>(`animals/${id}`, updates);
        if (response && response.id) {
          return response;
        }
      } catch (putErr) {
        console.warn('Backend PUT /animals fallback active:', putErr);
      }

      // 2. Repository fallback
      if (updates.health_status) {
        await AnimalRepository.updateAnimalStatus(id, updates.health_status);
      }

      const updated = get().animals.find((a) => a.id === id) || null;
      return updated;
    } catch (err: unknown) {
      const error = err as Error;
      // Revert on failure
      set({ animals: prevAnimals, error: error.message });
      return null;
    }
  },

  deleteAnimal: async (id: string): Promise<boolean> => {
    const prevAnimals = get().animals;
    // Optimistic removal
    set((state) => ({
      animals: state.animals.filter((a) => a.id !== id),
    }));

    try {
      try {
        await api.delete(`animals/${id}`);
      } catch {
        await AnimalRepository.deleteAnimal(id);
      }
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      set({ animals: prevAnimals, error: error.message });
      return false;
    }
  },

  setSpeciesFilter: (filter: SpeciesFilter) => set({ speciesFilter: filter }),
  setStatusFilter: (filter: StatusFilter) => set({ statusFilter: filter }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
}));
