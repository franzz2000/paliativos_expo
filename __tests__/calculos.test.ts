// Tests for core calculation logic
// Covers all functions in src/services/calculos.ts
// Run with: npm test

import {
  calculaDuracionInfusion,
  compruebaErrores,
  calculaDatos,
  calculaPresentaciones,
  recalculaDuracion,
  ejecutaCalculo,
} from '../src/services/calculos';
import type { Infusion, Presentacion, PrincipioActivo } from '../src/types';

// ─── Test fixtures ────────────────────────────────────────────────────────────

const PA_MORFINA: PrincipioActivo = {
  atc: 'N02AA01',
  descripcion: 'Morfina',
  grupo: 1,
  unidad: 'mg',
  compatibles: [],
};

const PA_MIDAZOLAM: PrincipioActivo = {
  atc: 'N05CD08',
  descripcion: 'Midazolam',
  grupo: 4,
  unidad: 'mg',
  compatibles: [],
};

// Ampolla 10mg (1ml) — plenty in stock
const PRES_MORFINA_10: Presentacion = {
  id: 1, atc: 'N02AA01', descripcion: 'Ampolla 10mg (1ml)', volumen: 1, cantidad: 10, enStock: 100, tipo: 'Amp',
};
// Vial 400mg (20ml) — plenty in stock
const PRES_MORFINA_400: Presentacion = {
  id: 3, atc: 'N02AA01', descripcion: 'Vial 400mg (20ml)', volumen: 20, cantidad: 400, enStock: 100, tipo: 'Vial',
};
// Ampolla 10mg out of stock
const PRES_MORFINA_10_EMPTY: Presentacion = {
  ...PRES_MORFINA_10, enStock: 0,
};

const PRES_MIDAZOLAM_50: Presentacion = {
  id: 7, atc: 'N05CD08', descripcion: 'Ampolla 50mg (10ml)', volumen: 10, cantidad: 50, enStock: 100, tipo: 'Amp',
};

// Base infusion: 250ml at 5ml/h, no correction, duration 48h
const BASE_INFUSION: Infusion = {
  volumen: 250,
  flujo: 5,
  correccion: 0,
  duracionDias: 2,
  duracionHoras: 0,
  duracion: 48,
  medicamentos: [],
};

// Lookup stubs
const getPa = (atc: string): PrincipioActivo => {
  const map: Record<string, PrincipioActivo> = {
    N02AA01: PA_MORFINA,
    N05CD08: PA_MIDAZOLAM,
  };
  if (!map[atc]) throw new Error(`PA not found: ${atc}`);
  return map[atc];
};

const getPresentacionesPa = (atc: string): Presentacion[] => {
  const map: Record<string, Presentacion[]> = {
    N02AA01: [PRES_MORFINA_10, PRES_MORFINA_400],
    N05CD08: [PRES_MIDAZOLAM_50],
  };
  return map[atc] ?? [];
};

// ─── calculaDuracionInfusion ──────────────────────────────────────────────────

describe('calculaDuracionInfusion', () => {
  it('returns 24h when daily dose equals available quantity', () => {
    expect(calculaDuracionInfusion(10, 10)).toBe(24);
  });

  it('returns 48h when available quantity is double the daily dose', () => {
    expect(calculaDuracionInfusion(20, 10)).toBe(48);
  });

  it('returns 12h when available quantity is half the daily dose', () => {
    expect(calculaDuracionInfusion(5, 10)).toBe(12);
  });
});

// ─── compruebaErrores ─────────────────────────────────────────────────────────

describe('compruebaErrores', () => {
  it('returns no errors for a valid infusion', () => {
    const infusion: Infusion = {
      ...BASE_INFUSION,
      medicamentos: [{ atc: 'N02AA01', cantidadDiaria: 30 }],
    };
    expect(compruebaErrores(infusion)).toHaveLength(0);
  });

  it('flags missing volumen', () => {
    const infusion: Infusion = {
      ...BASE_INFUSION,
      volumen: null,
      medicamentos: [{ atc: 'N02AA01', cantidadDiaria: 30 }],
    };
    const errors = compruebaErrores(infusion);
    expect(errors.some(e => e.descripcion.includes('volumen'))).toBe(true);
  });

  it('flags missing flujo', () => {
    const infusion: Infusion = {
      ...BASE_INFUSION,
      flujo: null,
      medicamentos: [{ atc: 'N02AA01', cantidadDiaria: 30 }],
    };
    const errors = compruebaErrores(infusion);
    expect(errors.some(e => e.descripcion.includes('flujo'))).toBe(true);
  });

  it('flags missing duracion', () => {
    const infusion: Infusion = {
      ...BASE_INFUSION,
      duracion: null,
      medicamentos: [{ atc: 'N02AA01', cantidadDiaria: 30 }],
    };
    const errors = compruebaErrores(infusion);
    expect(errors.some(e => e.descripcion.includes('duración'))).toBe(true);
  });

  it('flags empty medicamentos list', () => {
    const errors = compruebaErrores(BASE_INFUSION);
    expect(errors.some(e => e.descripcion.includes('medicamento'))).toBe(true);
  });

  it('returns multiple errors when several fields are missing', () => {
    const infusion: Infusion = {
      volumen: null, flujo: null, correccion: null,
      duracionDias: null, duracionHoras: null, duracion: null,
      medicamentos: [],
    };
    expect(compruebaErrores(infusion).length).toBeGreaterThanOrEqual(4);
  });
});

// ─── calculaDatos ─────────────────────────────────────────────────────────────

describe('calculaDatos', () => {
  const infusion: Infusion = {
    ...BASE_INFUSION,
    medicamentos: [{ atc: 'N02AA01', cantidadDiaria: 30 }],
  };

  it('computes volumenTotal without correction', () => {
    const result = calculaDatos(infusion, 48, getPa, getPresentacionesPa);
    // 48h * 5ml/h = 240ml (no correction)
    expect(result.volumenTotal).toBeCloseTo(240);
  });

  it('applies correction factor to volumenTotal', () => {
    const withCorreccion = { ...infusion, correccion: 10 };
    const result = calculaDatos(withCorreccion, 48, getPa, getPresentacionesPa);
    // 240ml + 10% = 264ml
    expect(result.volumenTotal).toBeCloseTo(264);
  });

  it('computes porcentajeCarga correctly', () => {
    const result = calculaDatos(infusion, 48, getPa, getPresentacionesPa);
    // 240ml / 250ml * 100 = 96%
    expect(result.porcentajeCarga).toBeCloseTo(96);
  });

  it('computes cantidadTotalNecesaria for each medication', () => {
    const result = calculaDatos(infusion, 48, getPa, getPresentacionesPa);
    // 30mg/day / 24 * 48h = 60mg
    expect(result.medicamentos[0].cantidadTotalNecesaria).toBeCloseTo(60);
  });

  it('computes cantidadPorHora for each medication', () => {
    const result = calculaDatos(infusion, 24, getPa, getPresentacionesPa);
    // 30mg / 24h = 1.25 mg/h
    expect(result.medicamentos[0].cantidadPorHora).toBeCloseTo(1.25);
  });

  it('sets cantidadInsuficiente=false when stock is adequate', () => {
    const result = calculaDatos(infusion, 48, getPa, getPresentacionesPa);
    expect(result.medicamentos[0].cantidadInsuficiente).toBe(false);
    expect(result.insuficiente).toBe(false);
  });

  it('sets cantidadInsuficiente=true when stock is too low', () => {
    const lowStockPres: Presentacion = { ...PRES_MORFINA_10, enStock: 5 }; // 5 * 10mg = 50mg
    const lowGet = (atc: string) =>
      atc === 'N02AA01' ? [lowStockPres] : getPresentacionesPa(atc);
    // Needs 60mg but only 50mg available
    const result = calculaDatos(infusion, 48, getPa, lowGet);
    expect(result.medicamentos[0].cantidadInsuficiente).toBe(true);
    expect(result.insuficiente).toBe(true);
  });

  it('populates descripcion and unidad from PA data', () => {
    const result = calculaDatos(infusion, 48, getPa, getPresentacionesPa);
    expect(result.medicamentos[0].descripcion).toBe('Morfina');
    expect(result.medicamentos[0].unidad).toBe('mg');
  });
});

// ─── calculaPresentaciones ────────────────────────────────────────────────────

describe('calculaPresentaciones', () => {
  it('uses whole presentations (largest first) for pass 1', () => {
    // Need 60mg Morfina. Available: 10mg ampoules (100) + 400mg vials (100)
    // Greedy: 0 vials (60 < 400), 6 x 10mg ampoules = 60mg → remainder 0
    const infusion: Infusion = {
      ...BASE_INFUSION,
      medicamentos: [{
        atc: 'N02AA01',
        cantidadDiaria: 30,
        cantidadRestante: 60,
        cantidadTotalNecesaria: 60,
      }],
    };
    const result = calculaPresentaciones(infusion, getPresentacionesPa);
    const meds = result.medicamentos[0];
    const ampoule10 = meds.presentacionesCompletas?.find(p => p.id === 1);
    const vial400   = meds.presentacionesCompletas?.find(p => p.id === 3);
    expect(ampoule10?.nPresentacionesCompletas).toBe(6);
    expect(vial400?.nPresentacionesCompletas).toBe(0);
  });

  it('uses a vial when quantity is large enough', () => {
    // Need 450mg: 1 x 400mg vial + 5 x 10mg ampoules = 450mg
    const infusion: Infusion = {
      ...BASE_INFUSION,
      medicamentos: [{
        atc: 'N02AA01',
        cantidadDiaria: 225,
        cantidadRestante: 450,
        cantidadTotalNecesaria: 450,
      }],
    };
    const result = calculaPresentaciones(infusion, getPresentacionesPa);
    const meds = result.medicamentos[0];
    const ampoule10 = meds.presentacionesCompletas?.find(p => p.id === 1);
    const vial400   = meds.presentacionesCompletas?.find(p => p.id === 3);
    expect(vial400?.nPresentacionesCompletas).toBe(1);
    expect(ampoule10?.nPresentacionesCompletas).toBe(5);
  });

  it('uses a partial presentation for fractional remainder', () => {
    // Need 65mg: 6 x 10mg + partial 10mg (5mg from a 10mg ampoule)
    const infusion: Infusion = {
      ...BASE_INFUSION,
      medicamentos: [{
        atc: 'N02AA01',
        cantidadDiaria: 32.5,
        cantidadRestante: 65,
        cantidadTotalNecesaria: 65,
      }],
    };
    const result = calculaPresentaciones(infusion, getPresentacionesPa);
    const meds = result.medicamentos[0];
    const ampoule10 = meds.presentacionesCompletas?.find(p => p.id === 1);
    expect(ampoule10?.nPresentacionesCompletas).toBe(6);
    expect(ampoule10?.volumenParcial).toBeCloseTo(0.5); // 5mg/10mg * 1ml
  });

  it('caps nPresentacionesCompletas at enStock', () => {
    // Only 2 ampoules in stock; need 60mg (would want 6)
    const limitedGet = (atc: string): Presentacion[] => {
      if (atc === 'N02AA01') return [{ ...PRES_MORFINA_10, enStock: 2 }];
      return [];
    };
    const infusion: Infusion = {
      ...BASE_INFUSION,
      medicamentos: [{
        atc: 'N02AA01',
        cantidadDiaria: 30,
        cantidadRestante: 60,
        cantidadTotalNecesaria: 60,
      }],
    };
    const result = calculaPresentaciones(infusion, limitedGet);
    const ampoule10 = result.medicamentos[0].presentacionesCompletas?.find(p => p.id === 1);
    expect(ampoule10?.nPresentacionesCompletas).toBe(2); // capped at enStock
  });

  it('accumulates volumenMedicamentos across all presentations', () => {
    // 6 x 10mg ampoules (1ml each) = 6ml
    const infusion: Infusion = {
      ...BASE_INFUSION,
      medicamentos: [{
        atc: 'N02AA01',
        cantidadDiaria: 30,
        cantidadRestante: 60,
        cantidadTotalNecesaria: 60,
      }],
    };
    const result = calculaPresentaciones(infusion, getPresentacionesPa);
    expect(result.volumenMedicamentos).toBeCloseTo(6);
  });

  it('skips out-of-stock presentations', () => {
    const noStockGet = (atc: string): Presentacion[] => {
      if (atc === 'N02AA01') return [PRES_MORFINA_10_EMPTY, PRES_MORFINA_400];
      return [];
    };
    const infusion: Infusion = {
      ...BASE_INFUSION,
      medicamentos: [{
        atc: 'N02AA01',
        cantidadDiaria: 30,
        cantidadRestante: 60,
        cantidadTotalNecesaria: 60,
      }],
    };
    const result = calculaPresentaciones(infusion, noStockGet);
    // Only vial available: need 60mg, partial use of 400mg vial
    const vial400 = result.medicamentos[0].presentacionesCompletas?.find(p => p.id === 3);
    expect(vial400?.nPresentacionesCompletas).toBe(0);
    expect(vial400?.volumenParcial).toBeGreaterThan(0); // partial use
  });
});

// ─── recalculaDuracion ────────────────────────────────────────────────────────

describe('recalculaDuracion', () => {
  it('returns desired duration when no drugs are insufficient', () => {
    const infusion: Infusion = {
      ...BASE_INFUSION,
      duracionDias: 2,
      duracionHoras: 0,
      medicamentos: [{ atc: 'N02AA01', cantidadDiaria: 30, cantidadInsuficiente: false, cantidadDisponible: 100 }],
    };
    expect(recalculaDuracion(infusion)).toBe(48);
  });

  it('returns the minimum feasible duration when a drug is insufficient', () => {
    // 30mg available, 30mg/day → 24h
    const infusion: Infusion = {
      ...BASE_INFUSION,
      duracionDias: 2,
      duracionHoras: 0,
      medicamentos: [{
        atc: 'N02AA01',
        cantidadDiaria: 30,
        cantidadInsuficiente: true,
        cantidadDisponible: 30, // only 24h worth
      }],
    };
    expect(recalculaDuracion(infusion)).toBe(24);
  });

  it('returns the most restrictive duration across multiple drugs', () => {
    const infusion: Infusion = {
      ...BASE_INFUSION,
      duracionDias: 3,
      duracionHoras: 0,
      medicamentos: [
        { atc: 'N02AA01', cantidadDiaria: 30, cantidadInsuficiente: true,  cantidadDisponible: 30 },  // 24h
        { atc: 'N05CD08', cantidadDiaria: 20, cantidadInsuficiente: true,  cantidadDisponible: 20 },  // 24h
        { atc: 'N05CD08', cantidadDiaria: 40, cantidadInsuficiente: true,  cantidadDisponible: 20 },  // 12h ← limiting
      ],
    };
    expect(recalculaDuracion(infusion)).toBe(12);
  });
});

// ─── ejecutaCalculo (full pipeline) ──────────────────────────────────────────

describe('ejecutaCalculo', () => {
  const medicamentosFull = [{ atc: 'N02AA01', cantidadDiaria: 30 }];

  it('returns no errors for valid input', () => {
    const infusion: Infusion = { ...BASE_INFUSION, medicamentos: medicamentosFull };
    const { errores } = ejecutaCalculo(
      infusion, { recalcula: false }, getPa, getPresentacionesPa,
    );
    expect(errores).toHaveLength(0);
  });

  it('returns errors for incomplete infusion', () => {
    const infusion: Infusion = { ...BASE_INFUSION, volumen: null, medicamentos: [] };
    const { errores } = ejecutaCalculo(
      infusion, { recalcula: false }, getPa, getPresentacionesPa,
    );
    expect(errores.length).toBeGreaterThan(0);
  });

  it('computes the full pipeline without auto-recalc', () => {
    const infusion: Infusion = { ...BASE_INFUSION, medicamentos: medicamentosFull };
    const { infusion: result } = ejecutaCalculo(
      infusion, { recalcula: false }, getPa, getPresentacionesPa,
    );
    expect(result.volumenTotal).toBeCloseTo(240);
    expect(result.medicamentos[0].cantidadTotalNecesaria).toBeCloseTo(60);
    expect(result.volumenMedicamentos).toBeDefined();
    expect(result.recalculada).toBe(false);
  });

  it('auto-recalculates duration when stock is insufficient (recalcula=true)', () => {
    // Only 5 ampoules (50mg) of Morfina available, need 60mg for 48h
    const lowStockGet = (atc: string): Presentacion[] => {
      if (atc === 'N02AA01') return [{ ...PRES_MORFINA_10, enStock: 5 }]; // 50mg total
      return [];
    };
    const infusion: Infusion = { ...BASE_INFUSION, medicamentos: medicamentosFull };
    const { infusion: result } = ejecutaCalculo(
      infusion, { recalcula: true }, getPa, lowStockGet,
    );
    expect(result.recalculada).toBe(true);
    // 50mg available / 30mg/day * 24 = 40h → floored to 40
    expect(result.duracion).toBe(40);
  });

  it('does NOT auto-recalculate when recalcula=false', () => {
    const lowStockGet = (atc: string): Presentacion[] => {
      if (atc === 'N02AA01') return [{ ...PRES_MORFINA_10, enStock: 5 }];
      return [];
    };
    const infusion: Infusion = { ...BASE_INFUSION, medicamentos: medicamentosFull };
    const { infusion: result } = ejecutaCalculo(
      infusion, { recalcula: false }, getPa, lowStockGet,
    );
    expect(result.recalculada).toBe(false);
    expect(result.duracion).toBe(48); // unchanged
    expect(result.insuficiente).toBe(true);
  });

  it('sets duracionDeseada to the original desired duration', () => {
    const infusion: Infusion = { ...BASE_INFUSION, medicamentos: medicamentosFull };
    const { infusion: result } = ejecutaCalculo(
      infusion, { recalcula: false }, getPa, getPresentacionesPa,
    );
    expect(result.duracionDeseada).toBe(48);
  });
});
