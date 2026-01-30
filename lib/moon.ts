import * as SunCalc from "suncalc";

export interface MoonData {
  phase: string; // nom de la phase
  phaseValue: number; // valeur de phase 0-1
  illumination: number;
  moonrise: Date | null;
  moonset: Date | null;
  daysUntilFullMoon: number;
  visibilityDuration: number | null; // en heures
  distance: number; // en km
  sminaValue: number; // illumination + 5%
  altitude: number; // altitude de la lune en degrés
}

/**
 * Convertit la phase de la lune (0-1) en nom français
 */
export function getPhaseName(phase: number): string {
  // phase: 0 = nouvelle lune, 0.25 = premier quartier, 0.5 = pleine lune, 0.75 = dernier quartier
  if (phase < 0.03 || phase > 0.97) {
    return "Nouvelle lune";
  } else if (phase < 0.22) {
    return "Premier croissant";
  } else if (phase < 0.28) {
    return "Premier quartier";
  } else if (phase < 0.47) {
    return "Gibbeuse croissante";
  } else if (phase < 0.53) {
    return "Pleine lune";
  } else if (phase < 0.72) {
    return "Gibbeuse décroissante";
  } else if (phase < 0.78) {
    return "Dernier quartier";
  } else {
    return "Dernier croissant";
  }
}

/**
 * Calcule le nombre de jours avant la prochaine pleine lune
 */
export function getDaysUntilFullMoon(phase: number): number {
  if (phase < 0.5) {
    // Avant la pleine lune
    return Math.round((0.5 - phase) * 29.53);
  } else {
    // Après la pleine lune, calculer jusqu'à la prochaine
    return Math.round((1.5 - phase) * 29.53);
  }
}

/**
 * Calcule la durée de visibilité de la lune en heures
 */
export function getVisibilityDuration(moonrise: Date | null, moonset: Date | null): number | null {
  if (!moonrise || !moonset) {
    return null;
  }
  let diff = moonset.getTime() - moonrise.getTime();
  // Si coucher < lever, la lune se couche le lendemain, ajouter 24h
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000; // ajouter 24h en millisecondes
  }
  return diff / (1000 * 60 * 60); // conversion en heures
}

/**
 * Formate une date en heure locale (HH:MM)
 */
export function formatTime(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calcule toutes les données lunaires pour une position et une date données
 */
export function calculateMoonData(lat: number, lon: number, date: Date = new Date()): MoonData {
  // Obtenir l'illumination de la lune
  const illumination = SunCalc.getMoonIllumination(date);
  const phase = illumination.phase;
  const fraction = illumination.fraction;

  // Obtenir les heures de lever et coucher de la lune
  const moonTimes = SunCalc.getMoonTimes(date, lat, lon);
  const moonrise = moonTimes.rise || null;
  const moonset = moonTimes.set || null;

  // Obtenir la position de la lune (pour distance et altitude)
  const moonPosition = SunCalc.getMoonPosition(date, lat, lon);
  // distance est déjà en kilomètres dans SunCalc
  const distance = moonPosition.distance;
  const altitude = (moonPosition.altitude * 180) / Math.PI; // conversion en degrés

  // Calculer les jours avant pleine lune
  const daysUntilFullMoon = getDaysUntilFullMoon(phase);

  // Calculer la durée de visibilité
  const visibilityDuration = getVisibilityDuration(moonrise, moonset);

  // Calculer la rayonnance de Smina (illumination + 5%)
  const sminaValue = Math.min(100, (fraction * 100) + 5);

  return {
    phase: getPhaseName(phase),
    phaseValue: phase,
    illumination: Math.round(fraction * 100),
    moonrise,
    moonset,
    daysUntilFullMoon,
    visibilityDuration: visibilityDuration ? Math.round(visibilityDuration * 10) / 10 : null,
    distance: Math.round(distance),
    sminaValue: Math.round(sminaValue * 10) / 10,
    altitude,
  };
}

/**
 * Obtient l'index du sprite lunaire (1-30) basé sur la phase
 */
export function getMoonSpriteIndex(phase: number): number {
  // phase est entre 0 et 1, on veut un index entre 1 et 30
  const index = Math.floor(phase * 30) + 1;
  return Math.min(30, Math.max(1, index));
}
