import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function NuevaInfusionModal({ visible, onClose, onConfirm }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Infusión nueva</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Ionicons name="trash-outline" size={40} color={colors.danger} style={styles.icon} />
            <Text style={styles.message}>
              Se van a eliminar todos los datos de la infusión actual.
            </Text>
            <Text style={styles.question}>¿Quiere continuar?</Text>
          </View>

          {/* Confirm button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>Infusión nueva</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const colors = {
  overlay: 'rgba(0,0,0,0.45)',
  card: '#ffffff',
  border: '#e0e0e0',
  headerBg: '#f7f7f7',
  title: '#111111',
  message: '#444444',
  cancel: '#007AFF',
  danger: '#d9534f',
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.headerBg,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: '600', color: colors.title },
  closeBtn: { padding: 2 },
  closeBtnText: { fontSize: 16, color: colors.cancel },

  // Body
  body: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    gap: 10,
  },
  icon: { marginBottom: 4 },
  message: {
    fontSize: 15,
    color: colors.message,
    textAlign: 'center',
    lineHeight: 22,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.message,
    textAlign: 'center',
  },

  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmBtn: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
