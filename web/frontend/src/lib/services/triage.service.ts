/**
 * Clinical Triage Service
 * Ported directly from Flutter ClinicalTriageService (clinical_triage_service.dart)
 * Deterministic rule-based veterinary syndromic triage engine adhering to WOAH disease definitions
 */

export type TriageUrgency = 'urgent' | 'high' | 'moderate' | 'low';

export interface TriageAssessment {
  urgency: TriageUrgency;
  suspectedConditions: string[];
  rationalePoints: string[];
  recommendedActions: string[];
  requiresImmediateIsolation: boolean;
  alertFieldVeterinarian: boolean;
  vectorRiskMultiplier: number;
}

export interface SymptomDefinition {
  id: string;
  label: string;
  labelHi: string;
  category: 'emergency' | 'cutaneous_mucosal' | 'respiratory' | 'mammary' | 'digestive' | 'systemic';
  severityWeight: 'critical' | 'high' | 'moderate' | 'mild';
  description: string;
  icon?: string;
}

export const SYMPTOM_CATALOG: Record<string, SymptomDefinition> = {
  high_fever: {
    id: 'high_fever',
    label: 'High Fever (>39.5°C / 103°F)',
    labelHi: 'तेज बुखार (>39.5°C / 103°F)',
    category: 'systemic',
    severityWeight: 'high',
    description: 'Elevated rectal temperature indicating systemic infection or acute inflammatory response.',
  },
  mouth_blisters: {
    id: 'mouth_blisters',
    label: 'Mouth / Gum Blisters & Vesicles',
    labelHi: 'मुँह / मसूड़ों में छाले व फफोले',
    category: 'cutaneous_mucosal',
    severityWeight: 'critical',
    description: 'Vesicular lesions on tongue, dental pad, gums, or muzzle.',
  },
  excessive_salivation: {
    id: 'excessive_salivation',
    label: 'Excessive Drooling / Frothy Salivation',
    labelHi: 'अत्यधिक लार / झागदार लार टपकना',
    category: 'cutaneous_mucosal',
    severityWeight: 'high',
    description: 'Continuous drooling, smacking of lips, or ropy saliva strings.',
  },
  hoof_lesions: {
    id: 'hoof_lesions',
    label: 'Foot / Interdigital Blisters & Lameness',
    labelHi: 'खुर / पैरों के बीच छाले व लंगड़ापन',
    category: 'cutaneous_mucosal',
    severityWeight: 'critical',
    description: 'Painful lesions in coronary band or interdigital space causing lameness or recumbency.',
  },
  skin_nodules: {
    id: 'skin_nodules',
    label: 'Firm Circumscribed Skin Nodules',
    labelHi: 'त्वचा पर सख्त उभरी हुई गांठें (एलएसडी)',
    category: 'cutaneous_mucosal',
    severityWeight: 'high',
    description: 'Firm round nodules (0.5 to 5 cm) on head, neck, perineum, or entire body.',
  },
  lymph_swelling: {
    id: 'lymph_swelling',
    label: 'Enlarged Superficial Lymph Nodes',
    labelHi: 'सतही लसिका ग्रंथियों (लिम्फ नोड्स) में सूजन',
    category: 'systemic',
    severityWeight: 'moderate',
    description: 'Swollen prescapular or precrural lymph nodes palpable through skin.',
  },
  throat_swelling: {
    id: 'throat_swelling',
    label: 'Submandibular / Throat Edema',
    labelHi: 'गले व निचले जबड़े के नीचे सूजन (गलगोंटू)',
    category: 'respiratory',
    severityWeight: 'critical',
    description: 'Hot, painful swelling of throat, brisket, or head accompanied by respiratory stertor.',
  },
  respiratory_distress: {
    id: 'respiratory_distress',
    label: 'Labored Breathing / Grunting',
    labelHi: 'सांस लेने में भारी तकलीफ व घरघराहट',
    category: 'respiratory',
    severityWeight: 'high',
    description: 'Tachypnea, open-mouth breathing, extended neck, grunting on expiration.',
  },
  udder_swelling: {
    id: 'udder_swelling',
    label: 'Swollen, Hard, or Hot Udder',
    labelHi: 'थन में कठोरता, सूजन व अत्यधिक गर्मी (थनैला)',
    category: 'mammary',
    severityWeight: 'high',
    description: 'Acute inflammation of one or more quarters, painful to touch.',
  },
  abnormal_milk: {
    id: 'abnormal_milk',
    label: 'Clots, Flakes, or Blood in Milk',
    labelHi: 'दूध में थक्के, छींटे या रक्त (असामान्य दूध)',
    category: 'mammary',
    severityWeight: 'high',
    description: 'Watery secretions, yellow clots, blood tinges, or purulent curd.',
  },
  bloody_discharge: {
    id: 'bloody_discharge',
    label: 'Dark Blood from Natural Orifices',
    labelHi: 'प्राकृतिक छिद्रों से काला / गैर-थक्केदार रक्त',
    category: 'emergency',
    severityWeight: 'critical',
    description: 'Tar-like unclotted blood oozing from nostrils, mouth, anus, or vulva.',
  },
  red_urine: {
    id: 'red_urine',
    label: 'Red / Dark Brown Urine (Hemoglobinuria)',
    labelHi: 'लाल / गहरा भूरा पेशाब (रक्तमूत्र)',
    category: 'emergency',
    severityWeight: 'critical',
    description: 'Port-wine or coffee-colored urine indicating intravascular hemolysis.',
  },
  sudden_death: {
    id: 'sudden_death',
    label: 'Peracute Death in Herd',
    labelHi: 'बिना लक्षण दिखे अचानक मृत्यु (पेराक्य़ूट)',
    category: 'emergency',
    severityWeight: 'critical',
    description: 'Rapid mortality within hours with no prior prodromal signs.',
  },
  severe_diarrhea: {
    id: 'severe_diarrhea',
    label: 'Profuse Watery or Bloody Diarrhea',
    labelHi: 'अत्यधिक पतला या खूनी दस्त',
    category: 'digestive',
    severityWeight: 'high',
    description: 'Foul-smelling watery scour, tenesmus, or mucosal shreds.',
  },
  anorexia: {
    id: 'anorexia',
    label: 'Complete Loss of Appetite',
    labelHi: 'चारा / पानी पूरी तरह बंद होना (एनोरेक्सिया)',
    category: 'digestive',
    severityWeight: 'moderate',
    description: 'Refusal to ingest dry fodder or green forage, complete cessation of rumination.',
  },
  nasal_discharge: {
    id: 'nasal_discharge',
    label: 'Mucopurulent Nasal Discharge',
    labelHi: 'नाक से गाढ़ा मवादयुक्त स्राव',
    category: 'respiratory',
    severityWeight: 'moderate',
    description: 'Thick yellowish/greenish nasal exudate with crusting around nostrils.',
  },
  tick_infestation: {
    id: 'tick_infestation',
    label: 'Visible Heavy Tick Infestation',
    labelHi: 'शरीर पर अत्यधिक चिचड़ी / किलनी का प्रकोप',
    category: 'cutaneous_mucosal',
    severityWeight: 'moderate',
    description: 'High vector load clustered around perineum, groin, ears, or dewlap.',
  },
  mild_lethargy: {
    id: 'mild_lethargy',
    label: 'Mild Sluggishness / Reduced Rumination',
    labelHi: 'सुस्ती व जुगाली में कमी',
    category: 'systemic',
    severityWeight: 'mild',
    description: 'Decreased alertness, drooping ears, or slightly reduced feed intake.',
  },
};

export class ClinicalTriageService {
  /**
   * Evaluates clinical syndromic signs using transparent, rule-based veterinary triage
   * Exactly matching Flutter clinical_triage_service.dart
   */
  public static evaluateTriage({
    selectedSymptoms,
    bodyTemperatureC,
    species,
    vectorRiskMultiplier = 1.0,
  }: {
    selectedSymptoms: Set<string> | string[];
    bodyTemperatureC?: number | null;
    species?: string;
    vectorRiskMultiplier?: number;
  }): TriageAssessment {
    const symptoms = new Set(selectedSymptoms);
    const suspectedConditions: string[] = [];
    const rationale: string[] = [];
    const recommendations: string[] = [];
    let immediateIsolation = false;
    let alertVet = false;
    let urgency: TriageUrgency = 'low';

    // Fever detection: symptom checked OR body temp >= 39.5°C (103.1°F)
    const hasFever =
      symptoms.has('high_fever') || (bodyTemperatureC != null && bodyTemperatureC >= 39.5);
    const hasSalivation = symptoms.has('excessive_salivation');
    const hasMouthBlisters = symptoms.has('mouth_blisters');
    const hasHoofLesions = symptoms.has('hoof_lesions');
    const hasNodules = symptoms.has('skin_nodules');
    const hasThroatSwelling = symptoms.has('throat_swelling');
    const hasRespDistress = symptoms.has('respiratory_distress');
    const hasUdderSigns = symptoms.has('udder_swelling') || symptoms.has('abnormal_milk');
    const hasAnthraxSigns = symptoms.has('bloody_discharge') || symptoms.has('sudden_death');
    const hasRedUrine = symptoms.has('red_urine');

    // Rule 1: Anthrax Hazard / Sudden Death (Immediate Severe Hazard)
    if (hasAnthraxSigns) {
      urgency = 'urgent';
      suspectedConditions.push('Suspected Anthrax / Acute Septicemia');
      rationale.push(
        'Severe emergency signal: Unclotted tar-like blood discharge or peracute sudden mortality detected.'
      );
      recommendations.push(
        'DO NOT open the carcass under any circumstances to prevent environmental spore release.',
        'Immediately quarantine the immediate radius (100 meters minimum perimeter).',
        'Urgent mandatory alert to District Veterinary Officer (DVO) & State Disease Surveillance Unit.',
        'Seal all carcass openings and plan deep burial (minimum 6 feet) with quicklime.'
      );
      immediateIsolation = true;
      alertVet = true;
      return {
        urgency,
        suspectedConditions,
        rationalePoints: rationale,
        recommendedActions: recommendations,
        requiresImmediateIsolation: immediateIsolation,
        alertFieldVeterinarian: alertVet,
        vectorRiskMultiplier,
      };
    }

    // Rule 2: Foot-and-Mouth Disease (FMD) Syndrome
    if ((hasMouthBlisters || hasSalivation) && (hasHoofLesions || hasFever)) {
      urgency = 'urgent';
      suspectedConditions.push('Foot-and-Mouth Disease (FMD) Cluster');
      rationale.push(
        'Vesicular syndrome: Frothy salivation, mouth blisters and/or interdigital foot lesions are highly indicative of FMD (high contagiousness).'
      );
      recommendations.push(
        'Strictly isolate animal in quarantine stall immediately away from milking herd.',
        'Restrict all vehicle and human traffic between pens; install 4% sodium carbonate or 1:1000 potassium permanganate footbaths.',
        'Notify local veterinarian for emergency ring vaccination of all susceptible livestock in a 5km radius.',
        'Disinfect all milking equipment and feeding troughs with citric acid or washing soda.'
      );
      immediateIsolation = true;
      alertVet = true;
    }

    // Rule 3: Hemorrhagic Septicemia (HS) Syndrome
    if (hasThroatSwelling && (hasRespDistress || hasFever)) {
      urgency = 'urgent';
      suspectedConditions.push('Hemorrhagic Septicemia (HS) / Pasteurellosis');
      rationale.push(
        'Submandibular throat swelling accompanied by high fever and labored breathing indicates acute HS.'
      );
      if (vectorRiskMultiplier > 1.5) {
        rationale.push(
          'High environmental humidity and precipitation currently elevate pasteurella pathogen proliferation.'
        );
      }
      recommendations.push(
        'Immediate injectable antimicrobial administration required under veterinarian supervision (e.g. Oxytetracycline / Sulphonamide).',
        'Isolate animal in a dry, elevated, well-ventilated enclosure away from wet flooring.',
        'Monitor in-contact animals for rectal temperature spikes twice daily.'
      );
      immediateIsolation = true;
      alertVet = true;
    }

    // Rule 4: Lumpy Skin Disease (LSD) Syndrome
    if (hasNodules) {
      const currentUrgency: TriageUrgency = hasFever ? 'high' : 'moderate';
      if (urgency !== 'urgent') {
        urgency = currentUrgency;
      }
      suspectedConditions.push('Lumpy Skin Disease (LSD)');
      rationale.push(
        'Circumscribed cutaneous nodules on head, neck, or body are characteristic of capripoxvirus (LSD).'
      );
      if (vectorRiskMultiplier >= 1.5) {
        rationale.push('Current weather conditions favor biting flies/Culicoides vector transmission.');
      }
      recommendations.push(
        'Isolate affected animal in insect-proof screened stall or apply pyrethroid fly repellent spray.',
        'Disinfect skin nodules with topical antiseptic wash (Povidone Iodine) to prevent secondary bacterial infection.',
        'Examine rest of herd for subclinical skin nodules and swollen prescapular lymph nodes.'
      );
      immediateIsolation = true;
      alertVet = true;
    }

    // Rule 5: Clinical Mastitis Syndrome
    if (hasUdderSigns) {
      if (urgency === 'low') {
        urgency = hasFever ? 'high' : 'moderate';
      }
      suspectedConditions.push('Clinical Mastitis');
      rationale.push(
        'Udder swelling, localized heat, or abnormal milk secretions indicate acute intramammary inflammation.'
      );
      recommendations.push(
        'Withhold milk from human consumption or tank collection immediately (MRL safety & public health).',
        'Perform California Mastitis Test (CMT) on all four quarters to identify affected quarters.',
        'Consult veterinarian for targeted intramammary antibiotic infusion and supportive anti-inflammatory therapy.'
      );
      alertVet = true;
    }

    // Rule 6: Babesiosis / Redwater / Tick-borne
    if (hasRedUrine && hasFever) {
      if (urgency !== 'urgent') {
        urgency = 'high';
      }
      suspectedConditions.push('Bovine Babesiosis (Redwater Fever)');
      rationale.push(
        'Hemoglobinuria (red urine) with high fever points to erythrocyte destruction by tick-borne babesia.'
      );
      recommendations.push(
        'Emergency veterinary assessment for antiprotozoal injection (e.g. Diminazene Aceturate or Imidocarb Dipropionate).',
        'Examine and dip/spray herd for tick control (acaricide application).',
        'Ensure animal has continuous access to cool, shaded water and supportive electrolytes.'
      );
      alertVet = true;
    }

    // Rule 7: General / Non-specific / Mild signs
    if (suspectedConditions.length === 0) {
      if (hasFever || hasRespDistress) {
        urgency = 'moderate';
        suspectedConditions.push('Non-specific Pyrexia / Early Respiratory Infection');
        rationale.push(
          'Elevated body temperature or respiratory signs detected without localized vesicular lesions.'
        );
        recommendations.push(
          'Place under close observation in a shaded stall for 24-48 hours.',
          'Re-check rectally measured body temperature morning and evening.',
          'Provide clean palatable green fodder, fresh water, and electrolyte solution.'
        );
      } else if (symptoms.size > 0) {
        urgency = 'low';
        suspectedConditions.push('Mild Digestive / Behavioral Observation');
        rationale.push('Mild non-febrile signs. No signs of transboundary animal epidemic disease.');
        recommendations.push(
          'Maintain regular feeding and observe cud chewing (rumination cycles).',
          'If appetite or activity does not normalize in 24 hours, request veterinary inspection.'
        );
      } else {
        urgency = 'low';
        suspectedConditions.push('Healthy Baseline');
        rationale.push('No clinical symptoms selected. Vitals appear within normal physiologic range.');
        recommendations.push(
          'Continue standard farm biosecurity, balanced nutrition, and scheduled vaccination.'
        );
      }
    }

    return {
      urgency,
      suspectedConditions,
      rationalePoints: rationale,
      recommendedActions: recommendations,
      requiresImmediateIsolation: immediateIsolation,
      alertFieldVeterinarian: alertVet,
      vectorRiskMultiplier,
    };
  }

  /**
   * Helper method matching repository call signature
   */
  public static computeTriage(params: {
    species?: string;
    symptoms: string[];
    affectedCount?: number;
    mortalityCount?: number;
    bodyTemperatureC?: number | null;
    vectorRiskMultiplier?: number;
  }) {
    const assessment = this.evaluateTriage({
      selectedSymptoms: params.symptoms,
      species: params.species,
      bodyTemperatureC: params.bodyTemperatureC,
      vectorRiskMultiplier: params.vectorRiskMultiplier ?? 1.0,
    });
    return {
      ...assessment,
      urgencyLevel: assessment.urgency.toUpperCase() as 'URGENT' | 'HIGH' | 'MODERATE' | 'LOW',
      possibleConditions: assessment.suspectedConditions,
    };
  }

  /**
   * Convert Fahrenheit to Celsius
   */
  public static fahrenheitToCelsius(f: number): number {
    return Number((((f - 32) * 5) / 9).toFixed(1));
  }

  /**
   * Convert Celsius to Fahrenheit
   */
  public static celsiusToFahrenheit(c: number): number {
    return Number(((c * 9) / 5 + 32).toFixed(1));
  }
}

export { ClinicalTriageService as TriageService };
export type TriageResult = TriageAssessment & {
  urgencyLevel: 'URGENT' | 'HIGH' | 'MODERATE' | 'LOW';
  possibleConditions: string[];
};
