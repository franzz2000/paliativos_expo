// Principios Activos (Active Pharmaceutical Ingredients)
// Migrated from DatosFactory in factory.js
// Compatibility data sourced from: "Administración de medicamentos por vía subcutánea
// en cuidados paliativos" (Farmacia Hospitalaria)

import type { PrincipioActivo } from '../types';

export const MEDICAMENTOS: PrincipioActivo[] = [
  {
    descripcion: 'Butilescopolamina',
    atc: 'A03BB01',
    grupo: 5,
    unidad: 'mg',
    compatibles: [
      { atc: 'N02AA01' }, // Morfina
      { atc: 'N02AA05' }, // Oxicodona
      { atc: 'H02AB02' }, // Dexametasona
      { atc: 'N01AH01' }, // Fentanilo
      { atc: 'N05AD01', descripcion: 'Precipita en dosis de: Haloperidol 15mg/día + Buscapina 30mg/día' }, // Haloperidol
      { atc: 'N05AA02' }, // Levomepromazina
      { atc: 'A03FA01' }, // Metoclopramida
      { atc: 'N05CD08' }, // Midazolam
      { atc: 'N02AX02' }, // Tramadol
    ],
    notas: [''],
  },
  {
    descripcion: 'Calcitonina',
    atc: 'H05BA01',
    grupo: 13,
    unidad: 'UI',
    compatibles: [],
    incompatibles: [{ atc: 'Todos', descripcion: 'Se recomienda no mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Clonazepam',
    atc: 'N03AE01',
    grupo: 4,
    unidad: 'mg',
    compatibles: [
      { atc: 'A03BB01' }, // Butilescopolamina
      { atc: 'N02AA01' }, // Morfina
      { atc: 'H02AB02' }, // Dexametasona
      { atc: 'N05AD01' }, // Haloperidol
      { atc: 'N01AX03' }, // Ketamina
      { atc: 'N05AA02' }, // Levomepromazina
      { atc: 'N07BC02' }, // Metadona
      { atc: 'A03FA01' }, // Metoclopramida
    ],
  },
  {
    descripcion: 'Dexametasona',
    atc: 'H02AB02',
    grupo: 3,
    unidad: 'mg',
    compatibles: [
      { atc: 'A03BB01' }, // Butilescopolamina
      { atc: 'N01AX03' }, // Ketamina
      { atc: 'A03FA01' }, // Metoclopramida
      { atc: 'N02AA01' }, // Morfina
      { atc: 'A02BA02' }, // Ranitidina
      { atc: 'N02AX02' }, // Tramadol
    ],
  },
  {
    descripcion: 'Diclofenaco',
    atc: 'M01AB05',
    grupo: 2,
    unidad: 'mg',
    compatibles: [],
    incompatibles: [{ atc: 'Todos', descripcion: 'Se recomienda no mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Fentanilo',
    atc: 'N01AH01',
    grupo: 1,
    unidad: 'mg',
    compatibles: [
      { atc: 'A03BB01' }, // Butilescopolamina
      { atc: 'H02AB02' }, // Dexametasona
      { atc: 'N05AD01' }, // Haloperidol
      { atc: 'N01AX03' }, // Ketamina
      { atc: 'N05AA02' }, // Levomepromazina
      { atc: 'A03FA01' }, // Metoclopramida
      { atc: 'N05CD08' }, // Midazolam
      { atc: 'H01CB02' }, // Octreotido
    ],
  },
  {
    descripcion: 'Furosemida',
    atc: 'C03CA01',
    grupo: 8,
    unidad: 'mg',
    compatibles: [],
    incompatibles: [{ atc: 'Todos', descripcion: 'Se recomienda no mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Haloperidol',
    atc: 'N05AD01',
    grupo: 6,
    unidad: 'mg',
    compatibles: [
      { atc: 'A03BB01' }, // Butilescopolamina
      { atc: 'N03AE01' }, // Clonazepam
      { atc: 'N02AA01' }, // Morfina
      { atc: 'N01AX03' }, // Ketamina
      { atc: 'N05AA02' }, // Levomepromazina
      { atc: 'N07BC02' }, // Metadona
      { atc: 'A03FA01' }, // Metoclopramida
      { atc: 'N05CD08' }, // Midazolam
      { atc: 'A04AA01' }, // Ondasetron
      { atc: 'N02AA05' }, // Oxicodona
      { atc: 'N02AX02' }, // Tramadol
    ],
  },
  {
    descripcion: 'Ketamina',
    atc: 'N01AX03',
    grupo: 2,
    unidad: 'mg',
    compatibles: [
      { atc: 'N01AH01' }, // Fentanilo
      { atc: 'N05AD01' }, // Haloperidol
      { atc: 'N05AA02' }, // Levomepromazina
      { atc: 'A03FA01' }, // Metoclopramida
    ],
    incompatibles: [{ atc: 'Todos', descripcion: 'Se recomienda no mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Ketorolaco',
    atc: 'M01AB15',
    grupo: 2,
    unidad: 'mg',
    compatibles: [],
    incompatibles: [
      { atc: 'N05AD01', descripcion: 'No se recomienda mezclar Ketorolaco con Haloperidol.' },
      { atc: 'N05AA02', descripcion: 'No se recomienda mezclar Ketorolaco con Levomepromazina.' },
      { atc: 'N05CD08', descripcion: 'No se recomienda mezclar Ketorolaco con Midazolam.' },
      { atc: 'N02AA01', descripcion: 'No se recomienda mezclar Ketorolaco con Morfina.' },
    ],
  },
  {
    descripcion: 'Levomepromazina',
    atc: 'N05AA02',
    grupo: 6,
    unidad: 'mg',
    compatibles: [],
    incompatibles: [{ atc: 'Todos', descripcion: 'Habitualmente no se recomienda mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Meperidina',
    atc: 'N02AB02',
    grupo: 1,
    unidad: 'mg',
    compatibles: [],
    incompatibles: [{ atc: 'Todos', descripcion: 'Se recomienda no mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Metadona',
    atc: 'N07BC02',
    grupo: 1,
    unidad: 'mg',
    compatibles: [],
    incompatibles: [{ atc: 'Todos', descripcion: 'Se recomienda no mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Metoclopramida',
    atc: 'A03FA01',
    grupo: 9,
    unidad: 'mg',
    compatibles: [],
  },
  {
    descripcion: 'Midazolam',
    atc: 'N05CD08',
    grupo: 4,
    unidad: 'mg',
    compatibles: [
      { atc: 'A03BB01' }, // Butilescopolamina
      { atc: 'N02AA01' }, // Morfina
      { atc: 'N01AH01' }, // Fentanilo
      { atc: 'N05AD01' }, // Haloperidol
      { atc: 'N01AX03' }, // Ketamina
      { atc: 'N05AA02' }, // Levomepromazina
      { atc: 'N07BC02' }, // Metadona
      { atc: 'A03FA01' }, // Metoclopramida
      { atc: 'H01CB02' }, // Octreotido
      { atc: 'A04AA01' }, // Ondasetron
      { atc: 'N02AA05' }, // Oxicodona
      { atc: 'N02AX02' }, // Tramadol
    ],
  },
  {
    descripcion: 'Morfina',
    atc: 'N02AA01',
    grupo: 1,
    unidad: 'mg',
    compatibles: [
      { atc: 'A03BB01' }, // Butilescopolamina
      { atc: 'N03AE01' }, // Clonazepam
      { atc: 'H02AB02' }, // Dexametasona
      { atc: 'N05AD01' }, // Haloperidol
      { atc: 'N01AX03' }, // Ketamina
      { atc: 'N05AA02' }, // Levomepromazina
      { atc: 'A03FA01' }, // Metoclopramida
      { atc: 'N05CD08' }, // Midazolam
      { atc: 'A04AA01' }, // Ondasetron
      { atc: 'N02AX02', descripcion: 'No se recomienda mezclar morfina con tramadol, ya que son medicamentos de la misma familia.' },
    ],
    incompatibles: [{ atc: 'Todos', descripcion: 'Se recomienda no mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Octreotido',
    atc: 'H01CB02',
    grupo: 12,
    unidad: 'mcg',
    compatibles: [],
    incompatibles: [{ atc: 'Todos', descripcion: 'Habitualmente no se recomienda mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Omeprazol',
    atc: 'A02BC01',
    grupo: 12,
    unidad: 'mg',
    compatibles: [],
    incompatibles: [{ atc: 'Todos', descripcion: 'Habitualmente no se recomienda mezclar con otros principios activos.' }],
  },
  {
    descripcion: 'Ondasetron',
    atc: 'A04AA01',
    grupo: 9,
    unidad: 'mg',
    compatibles: [
      { atc: 'N02AA01' }, // Morfina
      { atc: 'H02AB02' }, // Dexametasona
      { atc: 'N02AB02' }, // Meperidina
    ],
  },
  {
    descripcion: 'Ranitidina',
    atc: 'A02BA02',
    grupo: 1,
    unidad: 'mg',
    compatibles: [],
    incompatibles: [
      { atc: 'N02AA01' }, // Morfina
      { atc: 'N05AA02' }, // Levomepromazina
      { atc: 'N05AD01' }, // Haloperidol
      { atc: 'N05CD08' }, // Midazolam
    ],
  },
  {
    descripcion: 'Oxicodona',
    atc: 'N02AA05',
    grupo: 1,
    unidad: 'mg',
    compatibles: [],
  },
  {
    descripcion: 'Tramadol',
    atc: 'N02AX02',
    grupo: 1,
    unidad: 'mg',
    compatibles: [
      { atc: 'A03BB01' }, // Butilescopolamina
      { atc: 'H02AB02' }, // Dexametasona
      { atc: 'N02AA01', descripcion: 'No se recomienda mezclar tramadol con morfina, ya que son medicamentos de la misma familia.' },
      { atc: 'N05CD08' }, // Midazolam
      { atc: 'N05AD01' }, // Haloperidol
      { atc: 'A03FA01' }, // Metoclopramida
    ],
  },
];

// Lookup helpers
export function getPa(atc: string): PrincipioActivo {
  const found = MEDICAMENTOS.find(m => m.atc === atc);
  if (!found) throw new Error(`Principio activo no encontrado: ${atc}`);
  return found;
}

export function getAllPa(): PrincipioActivo[] {
  return MEDICAMENTOS;
}
