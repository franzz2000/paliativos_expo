import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInfusionStore } from '../store/infusionStore';
import { useConfiguracionStore } from '../store/configuracionStore';
import { calcularInfusor } from '../services/infusorCalcs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function plural(n: number, singular: string, plural: string): string {
  return Math.round(n * 100) / 100 === 1 ? singular : plural;
}

function formatHoras(h: number): string {
  const rounded = Math.round(h * 100) / 100;
  return `${rounded} ${plural(rounded, 'hora', 'horas')}`;
}

function formatDiasHoras(dias: number, horas: number): string {
  const d = Math.round(dias * 100) / 100;
  const h = Math.round(horas * 100) / 100;
  if (d <= 0) return '';
  return `(${d} ${plural(d, 'día', 'días')} y ${h} ${plural(h, 'hora', 'horas')})`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LabeledInputProps {
  label: string;
  placeholder: string;
  value: number | null;
  onChange: (v: number | null) => void;
}

function LabeledInput({ label, placeholder, value, onChange }: LabeledInputProps) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={value !== null ? String(value) : ''}
        onChangeText={(text) => {
          const n = parseFloat(text);
          onChange(isNaN(n) || text === '' ? null : n);
        }}
        returnKeyType="done"
        autoCorrect={false}
      />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function InfusorScreen() {
  const infusion = useInfusionStore((s) => s.infusion);
  const setVolumen = useInfusionStore((s) => s.setVolumen);
  const setFlujo = useInfusionStore((s) => s.setFlujo);
  const setCorreccion = useInfusionStore((s) => s.setCorreccion);
  const setDuracionDias = useInfusionStore((s) => s.setDuracionDias);
  const setDuracionHoras = useInfusionStore((s) => s.setDuracionHoras);

  const muestraAyudas = useConfiguracionStore((s) => s.muestraAyudas);
  const porcentajeMinimo = useConfiguracionStore((s) => s.porcentajeMinimo);

  const derived = useMemo(
    () =>
      calcularInfusor(
        {
          volumen: infusion.volumen,
          flujo: infusion.flujo,
          correccion: infusion.correccion,
          duracionDias: infusion.duracionDias,
          duracionHoras: infusion.duracionHoras,
        },
        porcentajeMinimo,
      ),
    [
      infusion.volumen,
      infusion.flujo,
      infusion.correccion,
      infusion.duracionDias,
      infusion.duracionHoras,
      porcentajeMinimo,
    ],
  );

  const duracionDeseada = derived.duracion;
  const isBelowMin =
    derived.MinimoDuracion !== null && duracionDeseada < derived.MinimoDuracion;
  const isAboveMax =
    derived.TotalDuracion !== null && duracionDeseada > derived.TotalDuracion;

  const showHelp = muestraAyudas && !infusion.recalculada;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Help card ─────────────────────────────────────────────────── */}
        {showHelp && (
          <View style={styles.helpCard}>
            <Ionicons name="information-circle-outline" size={20} color="#4a90d9" style={styles.helpIcon} />
            <Text style={styles.helpText}>
              Introduzca las características del infusor (volumen y flujo), junto al
              factor de corrección y la duración deseada del infusor.
            </Text>
          </View>
        )}

        {/* ── Características del infusor ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Características del infusor</Text>

          <LabeledInput
            label="Volumen (ml)"
            placeholder="Volumen del infusor en ml"
            value={infusion.volumen}
            onChange={setVolumen}
          />
          <View style={styles.divider} />
          <LabeledInput
            label="Flujo (ml/h)"
            placeholder="Flujo del infusor en ml/h"
            value={infusion.flujo}
            onChange={setFlujo}
          />
        </View>

        {/* ── Factor de corrección ──────────────────────────────────────── */}
        <View style={styles.section}>
          <LabeledInput
            label="Factor de corrección (%)"
            placeholder="Factor de corrección en %"
            value={infusion.correccion}
            onChange={setCorreccion}
          />
        </View>

        {/* ── Duración deseada ──────────────────────────────────────────── */}
        <View style={styles.section}>
          {/* Header with min/max info */}
          <View style={styles.duracionHeader}>
            <Text style={styles.sectionHeader}>Duración deseada</Text>

            {derived.MinimoDuracion !== null && (
              <Text style={[styles.duracionMeta, isBelowMin && styles.textDanger]}>
                Mínimo ({porcentajeMinimo}%): {derived.MinimoDuracion}{' '}
                {plural(derived.MinimoDuracion, 'hora', 'horas')}
                {derived.MinimoDias !== null && derived.MinimoDias > 0
                  ? ' ' + formatDiasHoras(derived.MinimoDias, derived.MinimoHoras ?? 0)
                  : ''}
              </Text>
            )}

            {derived.TotalDuracion !== null && (
              <Text style={[styles.duracionMeta, isAboveMax && styles.textDanger]}>
                Máximo: {formatHoras(derived.TotalDuracion)}
                {derived.TotalDias !== null && derived.TotalDias > 0
                  ? ' ' + formatDiasHoras(derived.TotalDias, derived.TotalHoras ?? 0)
                  : ''}
              </Text>
            )}
          </View>

          <LabeledInput
            label="Días"
            placeholder="Días de duración de la infusión"
            value={infusion.duracionDias}
            onChange={setDuracionDias}
          />
          <View style={styles.divider} />
          <LabeledInput
            label="Horas"
            placeholder="Horas de duración de la infusión"
            value={infusion.duracionHoras}
            onChange={setDuracionHoras}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const colors = {
  background: '#f0f0f0',
  card: '#ffffff',
  border: '#e0e0e0',
  headerBg: '#f7f7f7',
  headerText: '#555555',
  label: '#333333',
  placeholder: '#aaaaaa',
  inputText: '#111111',
  danger: '#d9534f',
  helpBg: '#eaf3fb',
  helpBorder: '#4a90d9',
  helpText: '#2c6fad',
  divider: '#eeeeee',
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 12,
    gap: 12,
  },

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
  helpIcon: {
    marginTop: 1,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: colors.helpText,
    lineHeight: 20,
  },

  // Section card
  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.headerText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: colors.headerBg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 14,
  },

  // Duration header (contains min/max lines)
  duracionHeader: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  duracionMeta: {
    fontSize: 13,
    color: colors.headerText,
    marginTop: 2,
  },
  textDanger: {
    color: colors.danger,
    fontWeight: '600',
  },

  // Input row
  inputRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: colors.inputText,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
