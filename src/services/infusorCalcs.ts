// Infusor (pump) derived value calculations
// Migrated from: InfusorCtrl.cambiaTotal() in controllers.js
// All functions are pure — no side effects.

import type { InfusorDerivedValues } from '../types';

export interface InfusorInputs {
  volumen: number | null;
  flujo: number | null;
  correccion: number | null;
  duracionDias: number | null;
  duracionHoras: number | null;
}

/**
 * Computes display values shown on the Infusor screen:
 *   - Maximum pump duration (hours/days) given volume and flow
 *   - Minimum acceptable duration (applying porcentajeMinimo)
 *   - Desired duration in total hours
 *   - Minimum volume
 *
 * Migrated from: $scope.cambiaTotal (InfusorCtrl)
 */
export function calcularInfusor(
  inputs: InfusorInputs,
  porcentajeMinimo: number,
): InfusorDerivedValues {
  const { volumen, flujo, correccion, duracionDias, duracionHoras } = inputs;

  let TotalDuracion: number | null = null;
  let MinimoDuracion: number | null = null;
  let TotalDias: number | null = null;
  let TotalHoras: number | null = null;
  let MinimoDias: number | null = null;
  let MinimoHoras: number | null = null;
  let volumenMinimo: number | null = null;

  if (volumen && flujo) {
    let horas = volumen / flujo;
    horas = horas - horas * (correccion ?? 0) / 100;

    TotalDuracion = horas;
    MinimoDuracion = Math.round((horas * porcentajeMinimo) / 100);
    TotalDias = Math.floor(horas / 24);
    TotalHoras = horas % 24;
    MinimoDias = Math.floor(MinimoDuracion / 24);
    MinimoHoras = MinimoDuracion % 24;
    volumenMinimo = (volumen * porcentajeMinimo) / 100;
  }

  const duracion = (duracionDias ?? 0) * 24 + (duracionHoras ?? 0);

  return {
    TotalDuracion,
    MinimoDuracion,
    TotalDias,
    TotalHoras,
    MinimoDias,
    MinimoHoras,
    duracion,
    volumenMinimo,
  };
}

/**
 * Returns true if the desired duration exceeds the maximum pump capacity.
 * Migrated from: $scope.compruebaDuracion (InfusorCtrl)
 */
export function isDuracionFueraRango(
  duracion: number,
  TotalDuracion: number | null,
): boolean {
  if (TotalDuracion === null) return false;
  return duracion > TotalDuracion;
}
