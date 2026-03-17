// Core infusion calculation logic
// Migrated from CalculoCtrl and InfusorCtrl in controllers.js
// All functions are pure — no side effects, no UI dependencies.

import type {
  Infusion,
  MedicamentoInfusion,
  Presentacion,
  PresentacionCalculada,
  PrincipioActivo,
  ErrorCalculo,
  ResultadoCalculo,
} from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * How long (hours) a drug lasts given available quantity and daily dose.
 * Migrated from: calculaDuracionInfusion (CalculoCtrl)
 */
export function calculaDuracionInfusion(
  cantidadDisponible: number,
  dosisDiaria: number,
): number {
  return (24 * cantidadDisponible) / dosisDiaria;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Returns a list of validation errors for the infusion setup.
 * Migrated from: compruebaErrores (CalculoCtrl)
 */
export function compruebaErrores(infusion: Infusion): ErrorCalculo[] {
  const errores: ErrorCalculo[] = [];

  if (!infusion.volumen) {
    errores.push({ descripcion: 'El volumen del infusor no puede ser 0' });
  }
  if (!infusion.flujo) {
    errores.push({ descripcion: 'El flujo del infusor no puede ser 0' });
  }
  if (!infusion.duracion) {
    errores.push({ descripcion: 'Debe introducir una duración deseada para el infusor' });
  }
  if (!infusion.medicamentos.length) {
    errores.push({ descripcion: 'No ha seleccionado ningún medicamento para la infusión' });
  }

  return errores;
}

// ─── Step 1: Calculate medication needs ──────────────────────────────────────

/**
 * For each medication, computes quantities needed and flags insufficient stock.
 * Also computes total infusion volume and load percentage.
 * Migrated from: calculaDatos (CalculoCtrl)
 *
 * @param infusion   - current infusion state
 * @param horasInfusion - desired infusion duration in hours
 * @param getPa      - lookup function for PrincipioActivo by ATC code
 * @param getPresentacionesPa - lookup function for Presentaciones by ATC code
 */
export function calculaDatos(
  infusion: Infusion,
  horasInfusion: number,
  getPa: (atc: string) => PrincipioActivo,
  getPresentacionesPa: (atc: string) => Presentacion[],
): Infusion {
  const volumenTotal =
    horasInfusion * (infusion.flujo ?? 0) *
    (1 + (infusion.correccion ?? 0) / 100);

  const porcentajeCarga = volumenTotal / (infusion.volumen ?? 1) * 100;

  const medicamentos: MedicamentoInfusion[] = infusion.medicamentos.map(med => {
    const paData = getPa(med.atc);
    const presentacionesEnStock = getPresentacionesPa(med.atc).filter(p => p.enStock > 0);

    const cantidadPorHora = med.cantidadDiaria / 24;
    const cantidadTotalNecesaria = cantidadPorHora * horasInfusion;
    const cantidadDisponible = presentacionesEnStock.reduce(
      (sum, p) => sum + p.cantidad * p.enStock,
      0,
    );

    return {
      ...med,
      descripcion: paData.descripcion,
      unidad: paData.unidad,
      cantidadPorHora,
      cantidadTotalNecesaria,
      cantidadRestante: cantidadTotalNecesaria,
      cantidadDisponible,
      cantidadInsuficiente: cantidadDisponible < cantidadTotalNecesaria,
    };
  });

  const insuficiente = medicamentos.some(m => m.cantidadInsuficiente);

  return {
    ...infusion,
    volumenTotal,
    porcentajeCarga,
    medicamentos,
    insuficiente,
  };
}

// ─── Step 2: Calculate presentation breakdown ─────────────────────────────────

/**
 * For each medication, determines which ampoules/vials to use and how many.
 * Uses a greedy two-pass algorithm:
 *   Pass 1 (descending by cantidad): fill whole presentations
 *   Pass 2 (ascending by cantidad): fill any remaining with a partial presentation
 * Migrated from: calculaPresentaciones (CalculoCtrl)
 *
 * @param infusion - result of calculaDatos (medicamentos must have cantidadRestante set)
 * @param getPresentacionesPa - lookup function for Presentaciones by ATC code
 */
export function calculaPresentaciones(
  infusion: Infusion,
  getPresentacionesPa: (atc: string) => Presentacion[],
): Infusion {
  let volumenMedicamentos = 0;

  const medicamentos: MedicamentoInfusion[] = infusion.medicamentos.map(med => {
    // Build mutable working copies with calculation fields
    const presentaciones: PresentacionCalculada[] = getPresentacionesPa(med.atc)
      .filter(p => p.enStock > 0)
      .map(p => ({ ...p, nPresentacionesCompletas: 0, volumenParcial: 0 }));

    let cantidadRestante = med.cantidadRestante ?? 0;

    // Pass 1: use whole presentations, largest first
    presentaciones.sort((a, b) => b.cantidad - a.cantidad);
    for (const pres of presentaciones) {
      if (cantidadRestante / pres.cantidad >= 1) {
        let n = Math.floor(cantidadRestante / pres.cantidad);
        if (n > pres.enStock) n = pres.enStock;
        pres.nPresentacionesCompletas = n;
        cantidadRestante -= n * pres.cantidad;
        volumenMedicamentos += pres.volumen * n;
      }
      // else nPresentacionesCompletas stays 0
    }

    // Pass 2: find the smallest presentation that covers the remaining fraction
    // Sort ascending so we hit the smallest qualifying one first
    presentaciones.sort((a, b) => a.cantidad - b.cantidad);
    for (const pres of presentaciones) {
      if (
        pres.cantidad > cantidadRestante &&
        pres.enStock - pres.nPresentacionesCompletas > 0
      ) {
        pres.volumenParcial = (cantidadRestante / pres.cantidad) * pres.volumen;
        volumenMedicamentos += pres.volumenParcial;
        cantidadRestante = 0;
        // No break — matches original behavior; subsequent items will add 0
      } else {
        pres.volumenParcial = 0;
      }
    }

    // Sort back to descending for display
    presentaciones.sort((a, b) => b.cantidad - a.cantidad);

    return {
      ...med,
      cantidadRestante,
      presentacionesCompletas: presentaciones,
    };
  });

  return {
    ...infusion,
    medicamentos,
    volumenMedicamentos,
  };
}

// ─── Step 3: Auto-adjust duration to available stock ─────────────────────────

/**
 * Finds the maximum feasible duration given current stock.
 * Returns the minimum duration across all drugs with insufficient stock.
 * Migrated from: recalculaDuracion (CalculoCtrl)
 *
 * @param infusion - result of calculaDatos (must have cantidadInsuficiente flags set)
 */
export function recalculaDuracion(infusion: Infusion): number {
  let duracionMinima =
    (infusion.duracionDias ?? 0) * 24 + (infusion.duracionHoras ?? 0);

  const insuficientes = infusion.medicamentos.filter(m => m.cantidadInsuficiente);
  for (const med of insuficientes) {
    const duracionCalculada = calculaDuracionInfusion(
      med.cantidadDisponible ?? 0,
      med.cantidadDiaria,
    );
    if (duracionCalculada < duracionMinima) {
      duracionMinima = duracionCalculada;
    }
  }

  return duracionMinima;
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

/**
 * Runs the full calculation pipeline used by CalculoCtrl.
 * Handles optional auto-recalc (configuracion.recalcula).
 *
 * @returns { infusion, errores }
 */
export function ejecutaCalculo(
  infusion: Infusion,
  configuracion: { recalcula: boolean },
  getPa: (atc: string) => PrincipioActivo,
  getPresentacionesPa: (atc: string) => Presentacion[],
): ResultadoCalculo {
  let result: Infusion = {
    ...infusion,
    insuficiente: false,
    recalculada: false,
    duracionDeseada:
      (infusion.duracionDias ?? 0) * 24 + (infusion.duracionHoras ?? 0),
    duracion:
      (infusion.duracionDias ?? 0) * 24 + (infusion.duracionHoras ?? 0),
  };

  const errores = compruebaErrores(result);

  if (configuracion.recalcula) {
    result = calculaDatos(result, result.duracion!, getPa, getPresentacionesPa);
    if (result.insuficiente) {
      result = {
        ...result,
        duracion: Math.floor(recalculaDuracion(result)),
        recalculada: true,
        insuficiente: false,
      };
      result = calculaDatos(result, result.duracion!, getPa, getPresentacionesPa);
    }
  } else {
    result = calculaDatos(result, result.duracion!, getPa, getPresentacionesPa);
  }

  result = calculaPresentaciones(result, getPresentacionesPa);

  return { infusion: result, errores };
}
