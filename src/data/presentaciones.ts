// Medication Presentations (ampoules, vials)
// Migrated from DatosFactory in factory.js
// version: 0.3

import type { Presentacion } from '../types';

export const PRESENTACIONES: Presentacion[] = [
  // Morfina (N02AA01)
  { id: 1,  descripcion: 'Ampolla 10mg (1ml) (al 1%)',   atc: 'N02AA01', volumen: 1,  cantidad: 10,   enStock: 100, tipo: 'Amp' },
  { id: 2,  descripcion: 'Ampolla 40mg (2ml) (al 2%)',   atc: 'N02AA01', volumen: 2,  cantidad: 40,   enStock: 100, tipo: 'Amp' },
  { id: 3,  descripcion: 'Vial 400mg (20ml) (al 2%)',    atc: 'N02AA01', volumen: 20, cantidad: 400,  enStock: 100, tipo: 'Vial' },
  // Midazolam (N05CD08)
  { id: 4,  descripcion: 'Ampolla 5mg (1ml)',             atc: 'N05CD08', volumen: 1,  cantidad: 5,    enStock: 100, tipo: 'Amp' },
  { id: 5,  descripcion: 'Ampolla 5mg (5ml)',             atc: 'N05CD08', volumen: 5,  cantidad: 5,    enStock: 100, tipo: 'Amp' },
  { id: 6,  descripcion: 'Ampolla 15mg (3ml)',            atc: 'N05CD08', volumen: 3,  cantidad: 15,   enStock: 100, tipo: 'Amp' },
  { id: 7,  descripcion: 'Ampolla 50mg (10ml)',           atc: 'N05CD08', volumen: 10, cantidad: 50,   enStock: 100, tipo: 'Amp' },
  // Butilescopolamina (A03BB01)
  { id: 8,  descripcion: 'Ampolla 20mg (1ml)',            atc: 'A03BB01', volumen: 1,  cantidad: 20,   enStock: 100, tipo: 'Amp' },
  // Oxicodona (N02AA05)
  { id: 9,  descripcion: 'Ampolla 10mg (1ml)',            atc: 'N02AA05', volumen: 1,  cantidad: 10,   enStock: 100, tipo: 'Amp' },
  { id: 10, descripcion: 'Ampolla 20mg (2ml)',            atc: 'N02AA05', volumen: 2,  cantidad: 20,   enStock: 100, tipo: 'Amp' },
  // Levomepromazina (N05AA02)
  { id: 11, descripcion: 'Ampolla 25mg (1ml)',            atc: 'N05AA02', volumen: 1,  cantidad: 25,   enStock: 100, tipo: 'Amp' },
  // Haloperidol (N05AD01)
  { id: 12, descripcion: 'Ampolla 5mg (1ml)',             atc: 'N05AD01', volumen: 1,  cantidad: 5,    enStock: 100, tipo: 'Amp' },
  // Ketorolaco (M01AB15)
  { id: 13, descripcion: 'Ampolla 30mg (1ml)',            atc: 'M01AB15', volumen: 1,  cantidad: 30,   enStock: 100, tipo: 'Amp' },
  // Metoclopramida (A03FA01)
  { id: 14, descripcion: 'Ampolla 10mg (2ml)',            atc: 'A03FA01', volumen: 2,  cantidad: 10,   enStock: 100, tipo: 'Amp' },
  // Tramadol (N02AX02)
  { id: 15, descripcion: 'Ampolla 100mg (2ml)',           atc: 'N02AX02', volumen: 2,  cantidad: 200,  enStock: 100, tipo: 'Amp' },
  // Octreotido (H01CB02)
  { id: 16, descripcion: 'Ampolla 50mcg (1ml)',           atc: 'H01CB02', volumen: 1,  cantidad: 50,   enStock: 100, tipo: 'Amp' },
  { id: 17, descripcion: 'Ampolla 100mcg (1ml)',          atc: 'H01CB02', volumen: 1,  cantidad: 100,  enStock: 100, tipo: 'Amp' },
  // Ondasetron (A04AA01)
  { id: 18, descripcion: 'Ampolla 4mg (1ml)',             atc: 'A04AA01', volumen: 1,  cantidad: 4,    enStock: 100, tipo: 'Amp' },
  { id: 19, descripcion: 'Ampolla 8mg (1ml)',             atc: 'A04AA01', volumen: 1,  cantidad: 8,    enStock: 100, tipo: 'Amp' },
  // Furosemida (C03CA01)
  { id: 20, descripcion: 'Ampolla 250mg (25ml)',          atc: 'C03CA01', volumen: 25, cantidad: 250,  enStock: 100, tipo: 'Amp' },
  { id: 21, descripcion: 'Ampolla 20mg (2ml)',            atc: 'C03CA01', volumen: 2,  cantidad: 20,   enStock: 100, tipo: 'Amp' },
  // Dexametasona (H02AB02)
  { id: 22, descripcion: 'Ampolla 40mg (5ml)',            atc: 'H02AB02', volumen: 5,  cantidad: 40,   enStock: 100, tipo: 'Amp' },
  { id: 23, descripcion: 'Ampolla 4mg (1ml)',             atc: 'H02AB02', volumen: 1,  cantidad: 4,    enStock: 100, tipo: 'Amp' },
  // Fentanilo (N01AH01)
  { id: 24, descripcion: 'Ampolla 0.05mg (3ml)',          atc: 'N01AH01', volumen: 3,  cantidad: 0.15, enStock: 100, tipo: 'Amp' },
  // Calcitonina (H05BA01)
  { id: 25, descripcion: 'Ampolla 100UI (1ml)',           atc: 'H05BA01', volumen: 1,  cantidad: 100,  enStock: 100, tipo: 'Amp' },
  // Clonazepam (N03AE01)
  { id: 26, descripcion: 'Ampolla 1mg (1ml)',             atc: 'N03AE01', volumen: 1,  cantidad: 1,    enStock: 100, tipo: 'Amp' },
  // Diclofenaco (M01AB05)
  { id: 27, descripcion: 'Ampolla 75mg (3ml)',            atc: 'M01AB05', volumen: 3,  cantidad: 75,   enStock: 100, tipo: 'Amp' },
];

// Lookup helpers
export function getPresentacion(id: number | string): Presentacion {
  const found = PRESENTACIONES.find(p => p.id === id);
  if (!found) throw new Error(`Presentación no encontrada: ${id}`);
  return found;
}

export function getPresentacionesPa(atc: string): Presentacion[] {
  return PRESENTACIONES.filter(p => p.atc === atc);
}

export function getAllPresentaciones(): Presentacion[] {
  return PRESENTACIONES;
}
