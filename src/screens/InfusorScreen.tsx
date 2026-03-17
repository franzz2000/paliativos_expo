import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInfusionStore } from '../store/infusionStore';
import { useConfiguracionStore } from '../store/configuracionStore';
import { useInfusoresTiposStore } from '../store/infusoresTiposStore';
import { calcularInfusor } from '../services/infusorCalcs';
import type { InfusorTipo } from '../types';

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

// ─── Infusor picker overlay ────────────────────────────────────────────────────

const PERSONALIZACION_ID = '__custom__';

interface PickerOverlayProps {
  infusores: InfusorTipo[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}

function InfusorPickerOverlay({ infusores, selectedId, onSelect, onClose }: PickerOverlayProps) {
  type PickerItem = { id: string; label: string; meta?: string };

  const items: PickerItem[] = [
    { id: PERSONALIZACION_ID, label: 'Personalizar' },
    ...infusores.map((inf) => ({
      id: inf.id,
      label: inf.descripcion,
      meta: `${inf.volumen} ml · ${inf.flujo} ml/h`,
    })),
  ];

  return (
    <View style={styles.pickerOverlay}>
      <Pressable style={styles.pickerBackdrop} onPress={onClose} />
      <View style={styles.pickerSheet}>
        <Text style={styles.pickerTitle}>Seleccionar infusor</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.pickerSeparator} />}
          renderItem={({ item }) => {
            const isSelected = item.id === (selectedId ?? PERSONALIZACION_ID);
            return (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => onSelect(item.id === PERSONALIZACION_ID ? null : item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.pickerItemText}>
                  <Text style={[styles.pickerItemLabel, isSelected && styles.pickerItemLabelActive]}>
                    {item.label}
                  </Text>
                  {item.meta ? (
                    <Text style={styles.pickerItemMeta}>{item.meta}</Text>
                  ) : null}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color="#007AFF" />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function InfusorScreen() {
  const infusion       = useInfusionStore((s) => s.infusion);
  const setVolumen     = useInfusionStore((s) => s.setVolumen);
  const setFlujo       = useInfusionStore((s) => s.setFlujo);
  const setCorreccion  = useInfusionStore((s) => s.setCorreccion);
  const setDuracionDias  = useInfusionStore((s) => s.setDuracionDias);
  const setDuracionHoras = useInfusionStore((s) => s.setDuracionHoras);

  const muestraAyudas    = useConfiguracionStore((s) => s.muestraAyudas);
  const porcentajeMinimo = useConfiguracionStore((s) => s.porcentajeMinimo);

  const infusores = useInfusoresTiposStore((s) => s.infusores);

  const selectedInfusorId        = useInfusionStore((s) => s.selectedInfusorTipoId);
  const setSelectedInfusorTipoId = useInfusionStore((s) => s.setSelectedInfusorTipoId);

  const [pickerVisible, setPickerVisible] = useState(false);

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

  const selectedLabel = useMemo(() => {
    if (selectedInfusorId === null) return 'Personalizar';
    return infusores.find((inf) => inf.id === selectedInfusorId)?.descripcion ?? 'Personalizar';
  }, [selectedInfusorId, infusores]);

  const handleSelectInfusor = (id: string | null) => {
    setSelectedInfusorTipoId(id);
    setPickerVisible(false);
    if (id !== null) {
      const inf = infusores.find((i) => i.id === id);
      if (inf) {
        setVolumen(inf.volumen);
        setFlujo(inf.flujo);
      }
    } else {
      setVolumen(null);
      setFlujo(null);
    }
  };

  const handleVolumenChange = (v: number | null) => {
    setSelectedInfusorTipoId(null);
    setVolumen(v);
  };

  const handleFlujoChange = (v: number | null) => {
    setSelectedInfusorTipoId(null);
    setFlujo(v);
  };

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

        {/* ── Selector de infusor ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Tipo de infusor</Text>
          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.pickerRowText}>{selectedLabel}</Text>
            <Ionicons name="chevron-down" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* ── Características del infusor ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Características del infusor</Text>

          <LabeledInput
            label="Volumen (ml)"
            placeholder="Volumen del infusor en ml"
            value={infusion.volumen}
            onChange={handleVolumenChange}
          />
          <View style={styles.divider} />
          <LabeledInput
            label="Flujo (ml/h)"
            placeholder="Flujo del infusor en ml/h"
            value={infusion.flujo}
            onChange={handleFlujoChange}
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

      {/* ── Infusor picker overlay ────────────────────────────────────────── */}
      {pickerVisible && (
        <InfusorPickerOverlay
          infusores={infusores}
          selectedId={selectedInfusorId}
          onSelect={handleSelectInfusor}
          onClose={() => setPickerVisible(false)}
        />
      )}
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
  primary: '#007AFF',
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
  helpText: {
    flex: 1,
    fontSize: 14,
    color: colors.helpText,
    lineHeight: 20,
  },

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

  // Picker trigger row
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  pickerRowText: {
    flex: 1,
    fontSize: 16,
    color: colors.inputText,
  },

  // Duration header
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

  // Picker overlay
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    maxHeight: '60%',
  },
  pickerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
    paddingVertical: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  pickerItemText: { flex: 1 },
  pickerItemLabel: { fontSize: 16, color: '#111' },
  pickerItemLabelActive: { color: colors.primary, fontWeight: '600' },
  pickerItemMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  pickerSeparator: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 20 },
});
