// Infusion session store
// Migrated from DatosInfusion factory in factory.js
// Persisted via AsyncStorage using Zustand's persist middleware.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Infusion, MedicamentoInfusion } from '../types';

const DEFAULT_INFUSION: Infusion = {
  volumen: null,
  flujo: null,
  correccion: null,
  duracionDias: null,
  duracionHoras: null,
  duracion: null,
  medicamentos: [],
};

interface InfusionStore {
  infusion: Infusion;
  selectedInfusorTipoId: string | null;
  setVolumen: (v: number | null) => void;
  setFlujo: (v: number | null) => void;
  setCorreccion: (v: number | null) => void;
  setDuracionDias: (v: number | null) => void;
  setDuracionHoras: (v: number | null) => void;
  setSelectedInfusorTipoId: (id: string | null) => void;
  addMedicamento: (m: MedicamentoInfusion) => void;
  updateMedicamento: (atc: string, cantidadDiaria: number) => void;
  removeMedicamento: (atc: string) => void;
  setInfusion: (infusion: Infusion) => void;
  clear: () => void;
}

export const useInfusionStore = create<InfusionStore>()(
  persist(
    (set) => ({
      infusion: DEFAULT_INFUSION,
      selectedInfusorTipoId: null,

      setVolumen: (v) =>
        set((s) => ({ infusion: { ...s.infusion, volumen: v } })),

      setFlujo: (v) =>
        set((s) => ({ infusion: { ...s.infusion, flujo: v } })),

      setCorreccion: (v) =>
        set((s) => ({ infusion: { ...s.infusion, correccion: v } })),

      setDuracionDias: (v) =>
        set((s) => ({ infusion: { ...s.infusion, duracionDias: v } })),

      setDuracionHoras: (v) =>
        set((s) => ({ infusion: { ...s.infusion, duracionHoras: v } })),

      setSelectedInfusorTipoId: (id) => set({ selectedInfusorTipoId: id }),

      addMedicamento: (m) =>
        set((s) => ({
          infusion: {
            ...s.infusion,
            medicamentos: [...s.infusion.medicamentos, m],
          },
        })),

      updateMedicamento: (atc, cantidadDiaria) =>
        set((s) => ({
          infusion: {
            ...s.infusion,
            medicamentos: s.infusion.medicamentos.map((m) =>
              m.atc === atc ? { ...m, cantidadDiaria } : m,
            ),
          },
        })),

      removeMedicamento: (atc) =>
        set((s) => ({
          infusion: {
            ...s.infusion,
            medicamentos: s.infusion.medicamentos.filter((m) => m.atc !== atc),
          },
        })),

      setInfusion: (infusion) => set({ infusion }),

      clear: () => set({ infusion: { ...DEFAULT_INFUSION, medicamentos: [] }, selectedInfusorTipoId: null }),
    }),
    {
      name: 'infusion',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
