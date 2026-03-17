import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { InfusorTipo } from '../types';

interface InfusoresTiposStore {
  infusores: InfusorTipo[];
  add: (data: Omit<InfusorTipo, 'id'>) => void;
  update: (id: string, data: Omit<InfusorTipo, 'id'>) => void;
  remove: (id: string) => void;
}

export const useInfusoresTiposStore = create<InfusoresTiposStore>()(
  persist(
    (set) => ({
      infusores: [],

      add: (data) =>
        set((s) => ({
          infusores: [...s.infusores, { ...data, id: Date.now().toString() }],
        })),

      update: (id, data) =>
        set((s) => ({
          infusores: s.infusores.map((inf) =>
            inf.id === id ? { ...inf, ...data } : inf,
          ),
        })),

      remove: (id) =>
        set((s) => ({
          infusores: s.infusores.filter((inf) => inf.id !== id),
        })),
    }),
    {
      name: 'infusores-tipos',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
