import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfiguracionStore } from '../store/configuracionStore';

const DISCLAIMER_ITEMS = [
  'A pesar de que se ha intentado evitar al máximo errores de cálculo en la aplicación, ésta puede tener fallos, por lo que no se garantiza que la misma esté exenta de errores.',
  'Esta aplicación está pensada para los fines que se describen en los términos de uso. Cualquier uso de la misma para otros fines se considerará un uso incorrecto.',
  'La aplicación Infusor y su autor no asumen ninguna responsabilidad sobre los daños que pueda causar por su uso incorrecto o por la aparición de errores en los cálculos.',
  'Es responsabilidad exclusiva del profesional sanitario que la utilice el comprobar que los resultados calculados en la aplicación son los correctos.',
];

export function DisclaimerModal() {
  const disclaimerAceptado    = useConfiguracionStore((s) => s.disclaimerAceptado);
  const setDisclaimerAceptado = useConfiguracionStore((s) => s.setDisclaimerAceptado);

  const [aceptado, setAceptado] = useState(false);

  if (disclaimerAceptado) return null;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={28} color="#007AFF" />
          <Text style={styles.headerTitle}>Descargo de responsabilidades</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          {DISCLAIMER_ITEMS.map((item, i) => (
            <View key={i} style={styles.item}>
              <Text style={styles.bullet}>{i + 1}.</Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAceptado((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, aceptado && styles.checkboxChecked]}>
              {aceptado && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.checkLabel}>He leído y acepto las condiciones de uso</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, !aceptado && styles.btnDisabled]}
            onPress={() => setDisclaimerAceptado(true)}
            disabled={!aceptado}
          >
            <Text style={styles.btnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
  },
  item: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    minWidth: 20,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    lineHeight: 21,
    textAlign: 'justify',
  },
  footer: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: '#111',
  },
  btn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#b0c8e8',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
