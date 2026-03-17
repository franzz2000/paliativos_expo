import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';

import { useInfusionStore } from '../store/infusionStore';
import { useDatosStore } from '../store/datosStore';
import { useConfiguracionStore } from '../store/configuracionStore';
import {
  ejecutaCalculo,
  calculaDatos,
  calculaPresentaciones,
  recalculaDuracion,
} from '../services/calculos';
import type { ErrorCalculo, Infusion, MedicamentoInfusion } from '../types';

// ─── Formatting helpers ───────────────────────────────────────────────────────

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** "2 días y 3 horas (51 horas)" */
function formatDuracion(totalHoras: number): string {
  const dias = Math.floor(totalHoras / 24);
  const horas = totalHoras % 24;
  const parts: string[] = [];
  if (dias >= 1) parts.push(`${dias} ${dias === 1 ? 'día' : 'días'}`);
  if (horas > 0) parts.push(`${r2(horas)} ${r2(horas) === 1 ? 'hora' : 'horas'}`);
  let result = parts.join(' y ');
  // show total hours in parens when there are days
  if (totalHoras !== horas) result += ` (${Math.floor(totalHoras)} horas)`;
  return result || '0 horas';
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

function AlertBanner({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.alertBanner}>
      <Ionicons name="alert-circle" size={20} color={colors.danger} style={styles.alertIcon} />
      <Text style={styles.alertText}>{children}</Text>
    </View>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  titleStyle?: object;
  children: React.ReactNode;
}

function SectionCard({ title, titleStyle, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardHeader, titleStyle]}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Card row ─────────────────────────────────────────────────────────────────

function CardRow({
  label,
  danger,
  children,
}: {
  label?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.cardRow, danger && styles.cardRowDanger]}>
      {label && <Text style={[styles.cardRowLabel, danger && styles.textDanger]}>{label}</Text>}
      <Text style={[styles.cardRowText, danger && styles.textDanger]}>{children}</Text>
    </View>
  );
}

// ─── Duration card ────────────────────────────────────────────────────────────

function DurationCard({ infusion }: { infusion: Infusion }) {
  const durDeseada = infusion.duracionDeseada ?? 0;
  const durReal = infusion.duracion ?? 0;

  return (
    <SectionCard
      title={`Duración del infusor${infusion.recalculada ? ' recalculada' : ''}`}
      titleStyle={infusion.recalculada ? styles.headerEnergized : undefined}
    >
      {/* Desired duration — strikethrough when recalculated */}
      <View style={styles.cardRow}>
        <Text style={[styles.cardRowText, infusion.recalculada && styles.strikethrough]}>
          <Text style={styles.cardRowLabel}>Deseada: </Text>
          {formatDuracion(durDeseada)}
        </Text>
      </View>

      {/* Recalculated duration */}
      {infusion.recalculada && (
        <View style={[styles.cardRow, styles.cardRowEnergized]}>
          <Text style={[styles.cardRowText, styles.textEnergized]}>
            <Text style={styles.cardRowLabel}>Recalculada: </Text>
            {formatDuracion(durReal)}
          </Text>
        </View>
      )}
    </SectionCard>
  );
}

// ─── Volumes card ─────────────────────────────────────────────────────────────

function VolumesCard({ infusion }: { infusion: Infusion }) {
  const volMed   = infusion.volumenMedicamentos ?? 0;
  const volTotal = infusion.volumenTotal ?? 0;
  const volMin   = infusion.volumenMinimo ?? 0;
  const volMax   = infusion.volumen ?? 0;

  const headerDanger = volTotal > volMax || volTotal < volMin;
  const medDanger    = volMed > volTotal;
  const totalDanger  = volMin > volTotal || volTotal > volMax;
  const showDilution = volTotal >= volMed;

  return (
    <SectionCard
      title="Volúmenes"
      titleStyle={headerDanger ? styles.headerDanger : undefined}
    >
      <CardRow danger={medDanger}>
        Volumen medicamentos: {r2(volMed)} ml
      </CardRow>

      {showDilution && (
        <>
          <View style={styles.rowDivider} />
          <CardRow>
            Volumen dilución: {r2(volTotal - volMed)} ml
          </CardRow>
        </>
      )}

      <View style={styles.rowDivider} />
      <CardRow danger={totalDanger}>
        Volumen total: {r2(volTotal)} ml ({r2(infusion.porcentajeCarga ?? 0)}% de la capacidad)
      </CardRow>
    </SectionCard>
  );
}

// ─── Single medication breakdown ──────────────────────────────────────────────

function MedicamentoCard({ med }: { med: MedicamentoInfusion }) {
  const wholePres = (med.presentacionesCompletas ?? []).filter(
    (p) => p.nPresentacionesCompletas > 0,
  );
  const partialPres = (med.presentacionesCompletas ?? []).filter(
    (p) => p.volumenParcial > 0.01,
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>
        {med.descripcion} ({r2(med.cantidadTotalNecesaria ?? 0)} {med.unidad})
      </Text>

      {wholePres.map((pres) => (
        <View key={`w-${pres.id}`} style={styles.presRow}>
          <Text style={styles.presText}>{pres.descripcion}</Text>
          <View style={styles.badgeGreen}>
            <Text style={styles.badgeText}>
              {pres.nPresentacionesCompletas}{' '}
              {pres.nPresentacionesCompletas === 1 ? 'Ud' : 'Uds'}
            </Text>
          </View>
        </View>
      ))}

      {partialPres.map((pres) => (
        <View key={`p-${pres.id}`} style={styles.presRow}>
          <Text style={styles.presText}>{pres.descripcion}</Text>
          <View style={styles.badgeAmber}>
            <Text style={styles.badgeText}>{r2(pres.volumenParcial)} ml</Text>
          </View>
        </View>
      ))}

      {wholePres.length === 0 && partialPres.length === 0 && (
        <View style={styles.cardRow}>
          <Text style={styles.cardRowTextMuted}>Sin presentaciones disponibles</Text>
        </View>
      )}
    </View>
  );
}

// ─── Insufficient stock section ───────────────────────────────────────────────

interface InsuficienteSectionProps {
  infusion: Infusion;
  muestraAyudas: boolean;
  onAjustar: () => void;
}

function InsuficienteSection({ infusion, muestraAyudas, onAjustar }: InsuficienteSectionProps) {
  return (
    <>
      <SectionCard title="Existencias de medicamentos seleccionados">
        {infusion.medicamentos.map((med, i) => {
          const falta = r2((med.cantidadTotalNecesaria ?? 0) - (med.cantidadDisponible ?? 0));
          return (
            <React.Fragment key={med.atc}>
              {i > 0 && <View style={styles.rowDivider} />}
              <View style={styles.cardRow}>
                <Text style={styles.cardRowText} numberOfLines={2}>
                  {med.descripcion ?? med.atc}
                  {med.cantidadInsuficiente
                    ? ` (Faltan ${falta} ${med.unidad})`
                    : ''}
                </Text>
                <View style={med.cantidadInsuficiente ? styles.badgeRed : styles.badgeGreen}>
                  <Ionicons
                    name={med.cantidadInsuficiente ? 'close' : 'checkmark'}
                    size={14}
                    color="#fff"
                  />
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </SectionCard>

      <AlertBanner>
        No tiene suficiente medicación en el almacén para cargar el infusor con la dosis deseada.
      </AlertBanner>

      <TouchableOpacity style={styles.ajustarBtn} onPress={onAjustar}>
        <Text style={styles.ajustarBtnText}>Ajustar duración</Text>
      </TouchableOpacity>

      {muestraAyudas && (
        <View style={styles.helpCard}>
          <Ionicons name="information-circle-outline" size={20} color="#4a90d9" style={styles.helpIcon} />
          <Text style={styles.helpText}>
            Al pulsar "Ajustar duración" se reducirá la duración de la infusión para
            ajustarla a las existencias disponibles.
          </Text>
        </View>
      )}
    </>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function CalculoScreen() {
  const navigation = useNavigation();

  const infusionStored    = useInfusionStore((s) => s.infusion);
  const getPa             = useDatosStore((s) => s.getPa);
  const getPresentacionesPa = useDatosStore((s) => s.getPresentacionesPa);
  const configuracion     = useConfiguracionStore(useShallow((s) => ({
    recalcula: s.recalcula,
    porcentajeMinimo: s.porcentajeMinimo,
    muestraAyudas: s.muestraAyudas,
  })));

  const [resultado, setResultado] = useState<Infusion>(infusionStored);
  const [errores, setErrores]     = useState<ErrorCalculo[]>([]);

  // Re-run calculation every time this tab is focused
  useFocusEffect(
    useCallback(() => {
      const { infusion: calc, errores: errs } = ejecutaCalculo(
        infusionStored,
        configuracion,
        getPa,
        getPresentacionesPa,
      );
      setResultado(calc);
      setErrores(errs);
    }, [infusionStored, configuracion, getPa, getPresentacionesPa]),
  );

  // Sync header title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: resultado.recalculada ? 'Cálculo ajustado a existencias' : 'Cálculo',
    });
  }, [navigation, resultado.recalculada]);

  // Manual "Ajustar duración" — replicates $scope.calculaDuracion
  const handleAjustar = useCallback(() => {
    let inf: Infusion = { ...resultado, recalculada: true, insuficiente: false };
    inf = { ...inf, duracion: Math.floor(recalculaDuracion(resultado)) };
    inf = calculaDatos(inf, inf.duracion!, getPa, getPresentacionesPa);
    inf = calculaPresentaciones(inf, getPresentacionesPa);
    setResultado(inf);
  }, [resultado, getPa, getPresentacionesPa]);

  const volMed   = resultado.volumenMedicamentos ?? 0;
  const volTotal = resultado.volumenTotal ?? 0;
  const volMin   = resultado.volumenMinimo ?? 0;
  const volMax   = resultado.volumen ?? 0;

  // ── Error state ─────────────────────────────────────────────────────────────
  if (errores.length > 0) {
    return (
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <AlertBanner>
          No se puede realizar el cálculo porque se han detectado errores.
        </AlertBanner>
        <SectionCard title="Errores detectados">
          {errores.map((e, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.rowDivider} />}
              <View style={styles.cardRow}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.cardRowText, styles.textDanger]}>{e.descripcion}</Text>
              </View>
            </React.Fragment>
          ))}
        </SectionCard>
      </ScrollView>
    );
  }

  // ── Normal state ─────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      {/* Duration */}
      <DurationCard infusion={resultado} />

      {/* Volumes (hidden while stock is insufficient) */}
      {!resultado.insuficiente && (
        <>
          <VolumesCard infusion={resultado} />

          {/* Overflow alert */}
          {volTotal < volMed && (
            <AlertBanner>
              El volumen de los medicamentos supera la capacidad total del infusor.
            </AlertBanner>
          )}

          {/* Below minimum alert */}
          {volMin > volTotal && (
            <AlertBanner>
              El volumen de infusión necesario es inferior a la capacidad mínima del infusor.
            </AlertBanner>
          )}
        </>
      )}

      {/* Medications breakdown — only when stock is OK */}
      {!resultado.insuficiente && resultado.medicamentos.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Medicamentos</Text>
          {resultado.medicamentos.map((med) => (
            <MedicamentoCard key={med.atc} med={med} />
          ))}
        </>
      )}

      {/* Insufficient stock state */}
      {resultado.insuficiente && (
        <InsuficienteSection
          infusion={resultado}
          muestraAyudas={configuracion.muestraAyudas}
          onAjustar={handleAjustar}
        />
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const colors = {
  background: '#f0f0f0',
  card: '#ffffff',
  border: '#e0e0e0',
  divider: '#eeeeee',
  headerBg: '#f7f7f7',
  headerText: '#555555',
  text: '#111111',
  muted: '#888888',
  danger: '#d9534f',
  dangerBg: '#fdf2f2',
  energized: '#e6a817',
  energizedBg: '#fef9ec',
  success: '#5cb85c',
  helpBg: '#eaf3fb',
  helpBorder: '#4a90d9',
  helpText: '#2c6fad',
  primary: '#007AFF',
  badgeGreenBg: '#5cb85c',
  badgeRedBg: '#d9534f',
  badgeAmberBg: '#e6a817',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 12, gap: 12 },

  // Alert banner
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dangerBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    borderRadius: 6,
    padding: 12,
    gap: 8,
  },
  alertIcon: { marginTop: 1 },
  alertText: { flex: 1, fontSize: 14, color: colors.danger, lineHeight: 20 },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.headerText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerDanger: { color: colors.danger, backgroundColor: colors.dangerBg },
  headerEnergized: { color: colors.energized, backgroundColor: colors.energizedBg },

  // Card rows
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },
  cardRowDanger: { backgroundColor: colors.dangerBg },
  cardRowEnergized: { backgroundColor: colors.energizedBg },
  cardRowLabel: { fontWeight: '600', color: colors.text },
  cardRowText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  cardRowTextMuted: { flex: 1, fontSize: 14, color: colors.muted, fontStyle: 'italic' },
  rowDivider: { height: 1, backgroundColor: colors.divider, marginLeft: 14 },
  textDanger: { color: colors.danger },
  textEnergized: { color: colors.energized },
  strikethrough: { textDecorationLine: 'line-through', color: colors.muted },

  // Section title (above medication cards)
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
    marginBottom: -4,
  },

  // Presentation rows inside medication card
  presRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  presText: { flex: 1, fontSize: 14, color: colors.text },

  // Badges
  badgeGreen: {
    backgroundColor: colors.badgeGreenBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeRed: {
    backgroundColor: colors.badgeRedBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeAmber: {
    backgroundColor: colors.badgeAmberBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  // "Ajustar duración" button
  ajustarBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ajustarBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Help card
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.helpBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.helpBorder,
    borderRadius: 6,
    padding: 12,
    gap: 8,
  },
  helpIcon: { marginTop: 1 },
  helpText: { flex: 1, fontSize: 14, color: colors.helpText, lineHeight: 20 },
});
