import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

import { useDatosStore } from '../store/datosStore';
import type { ExistenciaStackParams } from '../navigation/AppNavigator';

type Props = StackScreenProps<ExistenciaStackParams, 'Existencia'>;

export function ExistenciaScreen({ route, navigation }: Props) {
  const { idExistencia } = route.params;

  const getPresentacion = useDatosStore((s) => s.getPresentacion);
  const getPa           = useDatosStore((s) => s.getPa);
  const setStock        = useDatosStore((s) => s.setStock);

  const presentacion = getPresentacion(idExistencia);
  const pa           = getPa(presentacion.atc);

  // Local editing state
  const [enStock, setEnStock] = useState(String(presentacion.enStock));

  // Ref always holds the latest value so the cleanup closure stays stable
  const enStockRef = useRef(enStock);
  useEffect(() => { enStockRef.current = enStock; }, [enStock]);

  // Set navigation header title to the PA name (replicates view-title={{datos.titulo}})
  useLayoutEffect(() => {
    navigation.setOptions({ title: pa.descripcion });
  }, [navigation, pa.descripcion]);

  // Save stock when leaving the screen (replicates $ionicView.leave)
  useFocusEffect(
    useCallback(() => {
      return () => {
        const value = Number(enStockRef.current);
        if (!isNaN(value) && value >= 0) {
          setStock(idExistencia, value);
        }
      };
    }, [idExistencia, setStock]),
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <View style={styles.content}>
        {/* Presentation description (replicates <h3>{{datos.descripcion}}</h3>) */}
        <Text style={styles.presTitle}>{presentacion.descripcion}</Text>

        {/* Stock input (replicates item-input item-stacked-label with focus-me) */}
        <View style={styles.section}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Unidades</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={enStock}
              onChangeText={setEnStock}
              autoFocus   // replicates the focus-me directive
              returnKeyType="done"
              selectTextOnFocus
            />
          </View>
        </View>

        {/* Info row: drug amount per unit */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {presentacion.cantidad} {pa.unidad} · {presentacion.volumen} ml por unidad
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const colors = {
  background: '#f0f0f0',
  card: '#ffffff',
  border: '#e0e0e0',
  label: '#444444',
  text: '#111111',
  muted: '#888888',
  infoBg: '#eaf3fb',
  infoBorder: '#4a90d9',
  infoText: '#2c6fad',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },

  content: { padding: 16, gap: 14 },

  // Presentation subtitle
  presTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },

  // Input card
  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inputRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.label,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: Platform.OS === 'ios' ? 4 : 2,
    minWidth: 80,
  },

  // Info row beneath the input
  infoCard: {
    backgroundColor: colors.infoBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.infoBorder,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.infoText,
  },
});
