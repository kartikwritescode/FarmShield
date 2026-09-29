'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Bug,
  Flame,
  Info,
} from 'lucide-react';
import { WeatherRiskData, WeatherService } from '../../lib/services/weather.service';

interface WeatherRiskCardProps {
  latitude?: number;
  longitude?: number;
  initialData?: WeatherRiskData;
}

export const WeatherRiskCard: React.FC<WeatherRiskCardProps> = ({
  latitude = 30.901,
  longitude = 75.8573,
  initialData,
}) => {
  const [data, setData] = useState<WeatherRiskData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);

  const fetchWeather = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const result = await WeatherService.getWeatherRisk(latitude, longitude, forceRefresh);
      setData(result);
    } catch {
      // Keep previous or fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchWeather();
    }
  }, [latitude, longitude]);

  if (!data && loading) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-teal-100 shadow-md flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin text-teal-700" />
          Connecting to Open-Meteo Satellite Feed...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getVectorRiskBadge = (level: string) => {
    switch (level) {
      case 'EXTREME':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'MODERATE':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      default:
        return 'bg-teal-50 text-teal-800 border-teal-300';
    }
  };

  const getThiBadge = (cat: string) => {
    switch (cat) {
      case 'Emergency':
      case 'Danger':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'Alert':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-teal-50 text-teal-800 border-teal-300';
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-teal-100/90 shadow-md shadow-teal-950/5 font-sans space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shadow-xs">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Weather & Epidemiological Risk Intelligence
              <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full font-bold border border-teal-200">
                LIVE OPEN-METEO
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time THI Heat Stress, Vector Proliferation & Disease Risk Forecast
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchWeather(true)}
          disabled={loading}
          title="Refresh Weather Forecast"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-700' : ''}`} />
        </button>
      </div>

      {/* 4 Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center space-y-1">
          <Thermometer className="w-4 h-4 text-teal-700 mx-auto" />
          <div className="text-base font-extrabold text-slate-900">{data.temperatureC.toFixed(1)}°C</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">Temperature</div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center space-y-1">
          <Droplets className="w-4 h-4 text-sky-600 mx-auto" />
          <div className="text-base font-extrabold text-slate-900">{data.humidityPct.toFixed(0)}%</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">Rel. Humidity</div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center space-y-1">
          <Cloud className="w-4 h-4 text-indigo-600 mx-auto" />
          <div className="text-base font-extrabold text-slate-900">{data.precipitationMm.toFixed(1)} mm</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">Precipitation</div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center space-y-1">
          <Wind className="w-4 h-4 text-slate-600 mx-auto" />
          <div className="text-base font-extrabold text-slate-900">{data.windSpeedKmh.toFixed(0)} km/h</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">Wind Velocity</div>
        </div>
      </div>

      {/* Dual Risk Gauges: THI Index & Vector Proliferation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* THI Gauge */}
        <div className={`p-4 rounded-xl border ${getThiBadge(data.heatStressCategory)} flex items-center justify-between`}>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Temperature-Humidity Index (THI)
            </span>
            <span className="text-sm font-extrabold block">
              {data.heatStressCategory} Stress Risk
            </span>
            <span className="text-[11px] opacity-80 block">
              {data.thi < 72 ? 'Optimal ruminant metabolic comfort' : 'Ruminant cooling & ventilation indicated'}
            </span>
          </div>
          <div className="text-2xl font-black font-mono">
            {data.thi.toFixed(1)}
          </div>
        </div>

        {/* Vector Multiplier Gauge */}
        <div className={`p-4 rounded-xl border ${getVectorRiskBadge(data.vectorRiskLevel)} flex items-center justify-between`}>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 flex items-center gap-1">
              <Bug className="w-3.5 h-3.5" />
              Vector Risk (Biting Flies & Ticks)
            </span>
            <span className="text-sm font-extrabold block">
              {data.vectorRiskLevel} Proliferation
            </span>
            <span className="text-[11px] opacity-80 block">
              Epidemic contagion rate: {data.epidemicMultiplier}x
            </span>
          </div>
          <div className="text-2xl font-black font-mono">
            {data.epidemicMultiplier}x
          </div>
        </div>
      </div>

      {/* Epidemiological Advisory Note (FMD / LSD / Mastitis) */}
      <div className="bg-teal-50/70 border border-teal-200/90 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
            DAHD Climate & Biosecurity Advisory (FMD & LSD Prevention)
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {data.climateAdvisory ||
              'Elevated humidity increases vector activity for biting flies (Stomoxys calcitrans) and Culicoides midges. Maintain dry bedding, inspect herds for Lumpy Skin Disease (LSD) dermal nodules, and verify Foot-and-Mouth (FMD) biosecurity footbaths.'}
          </p>
        </div>
      </div>
    </div>
  );
};
