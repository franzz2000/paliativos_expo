// ─── Drug Data Types ─────────────────────────────────────────────────────────

export interface Compatibilidad {
  atc: string;
  descripcion?: string;
}

export interface PrincipioActivo {
  descripcion: string;
  atc: string;
  grupo: number;
  unidad: string;
  compatibles: Compatibilidad[];
  incompatibles?: Compatibilidad[];
  notas?: string[];
}

export interface Presentacion {
  id: number | string;
  descripcion: string;
  atc: string;
  volumen: number;    // ml
  cantidad: number;   // mg or mcg
  enStock: number;    // number of units in stock
  tipo: string;       // 'Amp' | 'Vial'
}

// Presentacion enriched with calculation results
export interface PresentacionCalculada extends Presentacion {
  nPresentacionesCompletas: number;
  volumenParcial: number;
}

// ─── Infusion Session Types ───────────────────────────────────────────────────

export interface MedicamentoInfusion {
  atc: string;
  descripcion?: string;
  unidad?: string;
  cantidadDiaria: number;
  // Calculated fields (populated by calculaDatos / calculaPresentaciones)
  cantidadPorHora?: number;
  cantidadTotalNecesaria?: number;
  cantidadRestante?: number;
  cantidadDisponible?: number;
  cantidadInsuficiente?: boolean;
  presentacionesCompletas?: PresentacionCalculada[];
}

export interface Infusion {
  volumen: number | null;
  flujo: number | null;
  correccion: number | null;
  duracionDias: number | null;
  duracionHoras: number | null;
  duracion: number | null;
  medicamentos: MedicamentoInfusion[];
  // Calculated fields
  volumenTotal?: number;
  porcentajeCarga?: number;
  volumenMedicamentos?: number;
  volumenMinimo?: number | null;
  insuficiente?: boolean;
  recalculada?: boolean;
  duracionDeseada?: number;
}

// ─── Infusor Derived Display Values ──────────────────────────────────────────

export interface InfusorDerivedValues {
  TotalDuracion: number | null;
  MinimoDuracion: number | null;
  TotalDias: number | null;
  TotalHoras: number | null;
  MinimoDias: number | null;
  MinimoHoras: number | null;
  duracion: number;
  volumenMinimo: number | null;
}

// ─── Config & Error Types ─────────────────────────────────────────────────────

export interface Configuracion {
  porcentajeMinimo: number;
  recalcula: boolean;
  muestraAyudas: boolean;
  muestraIntro: boolean;
  disclaimerAceptado: boolean;
}

export interface ErrorCalculo {
  descripcion: string;
}

export interface ResultadoCalculo {
  infusion: Infusion;
  errores: ErrorCalculo[];
}
