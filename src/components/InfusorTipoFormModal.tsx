import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { InfusorTipo } from '../types';

interface Props {
  visible: boolean;
  initial?: InfusorTipo | null;
  onClose: () => void;
  onSave: (data: Omit<InfusorTipo, 'id'>) => void;
}

export function InfusorTipoFormModal({ visible, initial, onClose, onSave }: Props) {
  const [descripcion, setDescripcion] = useState('');
  const [volumen, setVolumen] = useState('');
  const [flujo, setFlujo] = useState('');

  useEffect(() => {
    if (visible) {
      setDescripcion(initial?.descripcion ?? '');
      setVolumen(initial?.volumen != null ? String(initial.volumen) : '');
      setFlujo(initial?.flujo != null ? String(initial.flujo) : '');
    }
  }, [visible, initial]);

  const isValid =
    descripcion.trim().length > 0 &&
    parseFloat(volumen) > 0 &&
    parseFloat(flujo) > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      descripcion: descripcion.trim(),
      volumen: parseFloat(volumen),
      flujo: parseFloat(flujo),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {initial ? 'Editar infusor' : 'Nuevo infusor'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isValid}
            style={styles.headerBtn}
          >
            <Text style={[styles.headerBtnText, styles.headerBtnSave, !isValid && styles.headerBtnDisabled]}>
              Guardar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Descripción</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del infusor"
              placeholderTextColor="#aaa"
              value={descripcion}
              onChangeText={setDescripcion}
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Características</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Volumen (ml)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="ml"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={volumen}
                onChangeText={setVolumen}
                returnKeyType="next"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Flujo (ml/h)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="ml/h"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={flujo}
                onChangeText={setFlujo}
                returnKeyType="done"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const colors = {
  background: '#f0f0f0',
  card: '#ffffff',
  border: '#e0e0e0',
  headerBg: '#f8f8f8',
  headerBorder: '#e0e0e0',
  primary: '#007AFF',
  text: '#111',
  muted: '#555',
  sectionHeader: '#555',
  divider: '#eee',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBorder,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  headerBtn: { padding: 8, minWidth: 80 },
  headerBtnText: { fontSize: 16, color: colors.primary },
  headerBtnSave: { fontWeight: '600', textAlign: 'right' },
  headerBtnDisabled: { color: '#b0c8e8' },

  content: { padding: 16, gap: 16 },

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
    color: colors.sectionHeader,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  input: {
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  inputRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  inputField: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 14,
  },
});
