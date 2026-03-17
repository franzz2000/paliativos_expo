// App settings store
// Migrated from ConfiguracionFactory in factory.js
// Persisted via AsyncStorage using Zustand's persist middleware.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Configuracion } from '../types';

const DEFAULT_CONFIG: Configuracion = {
  porcentajeMinimo: 70,
  recalcula: false,
  muestraAyudas: true,
  muestraIntro: true,
};

interface ConfiguracionStore extends Configuracion {
  setPorcentajeMinimo: (value: number) => void;
  setRecalcula: (value: boolean) => void;
  setMuestraAyudas: (value: boolean) => void;
  setMuestraIntro: (value: boolean) => void;
  reset: () => void;
}

export const useConfiguracionStore = create<ConfiguracionStore>()(
  persist(
    (set) => ({
      ...DEFAULT_CONFIG,

      setPorcentajeMinimo: (value) => set({ porcentajeMinimo: value }),
      setRecalcula: (value) => set({ recalcula: value }),
      setMuestraAyudas: (value) => set({ muestraAyudas: value }),
      setMuestraIntro: (value) => set({ muestraIntro: value }),
      reset: () => set(DEFAULT_CONFIG),
    }),
    {
      name: 'configuracion',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
