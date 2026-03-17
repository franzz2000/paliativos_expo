import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useConfiguracionStore } from '../store/configuracionStore';

export function ConfiguracionScreen() {
  const porcentajeMinimo   = useConfiguracionStore((s) => s.porcentajeMinimo);
  const recalcula          = useConfiguracionStore((s) => s.recalcula);
  const muestraAyudas      = useConfiguracionStore((s) => s.muestraAyudas);
  const setPorcentajeMinimo = useConfiguracionStore((s) => s.setPorcentajeMinimo);
  const setRecalcula        = useConfiguracionStore((s) => s.setRecalcula);
  const setMuestraAyudas    = useConfiguracionStore((s) => s.setMuestraAyudas);
  const setMuestraIntro     = useConfiguracionStore((s) => s.setMuestraIntro);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>

      {/* ── Características del infusor ──────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Características del infusor</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Porcentaje mínimo del infusor (%)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Porcentaje mínimo"
            placeholderTextColor="#aaa"
            value={String(porcentajeMinimo)}
            onChangeText={(t) => {
              const n = parseFloat(t);
              if (!isNaN(n) && n > 0 && n <= 100) setPorcentajeMinimo(n);
            }}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* ── Características del cálculo ──────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Características del cálculo</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel} numberOfLines={3}>
            Recalcular automáticamente si no hay existencias suficientes
          </Text>
          <Switch
            value={recalcula}
            onValueChange={setRecalcula}
            trackColor={{ false: '#ddd', true: '#4a90d9' }}
            thumbColor={Platform.OS === 'android' ? (recalcula ? '#4a90d9' : '#f4f3f4') : undefined}
          />
        </View>
      </View>

      {/* ── General ──────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>General</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Mostrar ayudas</Text>
          <Switch
            value={muestraAyudas}
            onValueChange={setMuestraAyudas}
            trackColor={{ false: '#ddd', true: '#4a90d9' }}
            thumbColor={Platform.OS === 'android' ? (muestraAyudas ? '#4a90d9' : '#f4f3f4') : undefined}
          />
        </View>
      </View>

      {/* ── Mostrar intro ─────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => setMuestraIntro(true)}
      >
        <Text style={styles.btnText}>Mostrar intro</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const colors = {
  background: '#f0f0f0',
  card: '#fff',
  border: '#e0e0e0',
  headerBg: '#f7f7f7',
  headerText: '#555',
  label: '#333',
  text: '#111',
  primary: '#007AFF',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 12, gap: 12 },

  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
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

  inputRow: { paddingHorizontal: 14, paddingVertical: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: colors.label, marginBottom: 6 },
  input: {
    fontSize: 16,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: Platform.OS === 'ios' ? 4 : 2,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  toggleLabel: { flex: 1, fontSize: 15, color: colors.text },

  btn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
