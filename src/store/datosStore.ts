// Drug and presentation data store
// Migrated from DatosPa + DatosPresentacion + DatosFactory in factory.js
// Stock levels are persisted; base drug data is always loaded from source files.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRESENTACIONES, getPresentacion, getPresentacionesPa, getAllPresentaciones } from '../data/presentaciones';
import { MEDICAMENTOS, getPa, getAllPa } from '../data/medicamentos';
import type { Presentacion, PrincipioActivo } from '../types';

interface DatosStore {
  // Stock overrides keyed by presentation id (only deviations from defaults are stored)
  stockOverrides: Record<string | number, number>;

  // Derived — returns presentations with current stock applied
  getPresentacion: (id: number | string) => Presentacion;
  getPresentacionesPa: (atc: string) => Presentacion[];
  getAllPresentaciones: () => Presentacion[];

  // PA accessors (data never changes at runtime)
  getPa: (atc: string) => PrincipioActivo;
  getAllPa: () => PrincipioActivo[];

  // Mutations
  setStock: (id: number | string, enStock: number) => void;
  resetStock: () => void;
}

export const useDatosStore = create<DatosStore>()(
  persist(
    (set, get) => {
      const applyStock = (p: Presentacion): Presentacion => {
        const overrides = get().stockOverrides;
        const override = overrides[p.id];
        return override !== undefined ? { ...p, enStock: override } : p;
      };

      return {
        stockOverrides: {},

        getPresentacion: (id) => applyStock(getPresentacion(id)),

        getPresentacionesPa: (atc) =>
          getPresentacionesPa(atc).map(applyStock),

        getAllPresentaciones: () =>
          getAllPresentaciones().map(applyStock),

        getPa,
        getAllPa,

        setStock: (id, enStock) =>
          set((s) => ({
            stockOverrides: { ...s.stockOverrides, [id]: enStock },
          })),

        resetStock: () => set({ stockOverrides: {} }),
      };
    },
    {
      name: 'datos',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist stock overrides, not the functions
      partialize: (s) => ({ stockOverrides: s.stockOverrides }),
    },
  ),
);
