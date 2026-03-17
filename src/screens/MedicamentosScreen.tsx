import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useInfusionStore } from '../store/infusionStore';
import { useDatosStore } from '../store/datosStore';
import { useConfiguracionStore } from '../store/configuracionStore';
import type { MedicamentoInfusion, PrincipioActivo, Presentacion } from '../types';

// ─── Swipeable list row ───────────────────────────────────────────────────────

interface MedicamentoRowProps {
  med: MedicamentoInfusion;
  nombre: string;
  unidad: string;
  onEdit: () => void;
  onDelete: () => void;
}

function MedicamentoRow({ med, nombre, unidad, onEdit, onDelete }: MedicamentoRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => {
        swipeableRef.current?.close();
        onDelete();
      }}
    >
      <Text style={styles.deleteActionText}>Borrar</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} friction={2}>
      <TouchableOpacity style={styles.row} onPress={onEdit} activeOpacity={0.7}>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{nombre}</Text>
          <Text style={styles.rowSubtitle}>
            {med.cantidadDiaria} {unidad}/24h
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#bbb" />
      </TouchableOpacity>
    </Swipeable>
  );
}

// ─── PA picker modal (secondary modal inside the add/edit modal) ──────────────

interface PaPickerModalProps {
  visible: boolean;
  items: PrincipioActivo[];
  onSelect: (pa: PrincipioActivo) => void;
  onClose: () => void;
}

function PaPickerOverlay({ visible, items, onSelect, onClose }: PaPickerModalProps) {
  if (!visible) return null;
  return (
    <View style={styles.pickerOverlay}>
      <Pressable style={styles.pickerBackdrop} onPress={onClose} />
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Seleccione principio activo</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color="#555" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.atc}
          ItemSeparatorComponent={() => <View style={styles.pickerSeparator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <Text style={styles.pickerItemText}>{item.descripcion}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

// ─── Presentation badge ───────────────────────────────────────────────────────

function StockBadge({ enStock }: { enStock: number }) {
  const hasStock = enStock > 0;
  return (
    <View style={[styles.badge, hasStock ? styles.badgeOk : styles.badgeEmpty]}>
      <Text style={styles.badgeText}>{enStock} Uds</Text>
    </View>
  );
}

// ─── Add / Edit modal ─────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit';

interface MedicamentoModalProps {
  visible: boolean;
  mode: ModalMode;
  editAtc: string | null;
  onClose: () => void;
}

function MedicamentoModal({ visible, mode, editAtc, onClose }: MedicamentoModalProps) {
  const addMedicamento   = useInfusionStore((s) => s.addMedicamento);
  const updateMedicamento = useInfusionStore((s) => s.updateMedicamento);
  const medicamentos     = useInfusionStore((s) => s.infusion.medicamentos);

  const getAllPa            = useDatosStore((s) => s.getAllPa);
  const getPa               = useDatosStore((s) => s.getPa);
  const getPresentacionesPa = useDatosStore((s) => s.getPresentacionesPa);
  const muestraAyudas       = useConfiguracionStore((s) => s.muestraAyudas);

  // PAs that are not yet in the infusion, sorted alphabetically
  const availablePa = useMemo(
    () =>
      getAllPa()
        .filter((pa) => !medicamentos.some((m) => m.atc === pa.atc))
        .sort((a, b) => a.descripcion.localeCompare(b.descripcion)),
    [getAllPa, medicamentos],
  );

  // Local form state
  const [selectedPa, setSelectedPa] = useState<PrincipioActivo | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [paPickerVisible, setPaPickerVisible] = useState(false);
  const [cantidadError, setCantidadError] = useState(false);

  // Presentations to show
  const presentaciones: Presentacion[] = useMemo(() => {
    const atc = mode === 'add' ? selectedPa?.atc : editAtc ?? undefined;
    if (!atc) return [];
    return getPresentacionesPa(atc);
  }, [mode, selectedPa, editAtc, getPresentacionesPa]);

  // Pre-fill form when opening in edit mode
  const editMed = useMemo(
    () => (editAtc ? medicamentos.find((m) => m.atc === editAtc) : null),
    [editAtc, medicamentos],
  );
  const editPa = useMemo(
    () => (editAtc ? getPa(editAtc) : null),
    [editAtc, getPa],
  );

  // Reset form on open
  const handleOpen = useCallback(() => {
    if (mode === 'edit' && editMed) {
      setCantidad(String(editMed.cantidadDiaria));
    } else {
      setSelectedPa(null);
      setCantidad('');
    }
    setCantidadError(false);
    setPaPickerVisible(false);
  }, [mode, editMed]);

  // Validate and submit
  const handleSubmit = () => {
    const n = parseFloat(cantidad);
    if (isNaN(n) || n <= 0) {
      setCantidadError(true);
      return;
    }
    if (mode === 'add') {
      if (!selectedPa) return;
      addMedicamento({
        atc: selectedPa.atc,
        descripcion: selectedPa.descripcion,
        unidad: selectedPa.unidad,
        cantidadDiaria: n,
      });
    } else if (editAtc) {
      updateMedicamento(editAtc, n);
    }
    onClose();
  };

  const isAddDisabled = mode === 'add' && (!selectedPa || !cantidad);
  const unidad = mode === 'add' ? (selectedPa?.unidad ?? '') : (editPa?.unidad ?? '');
  const title = mode === 'add' ? 'Principio Activo Nuevo' : 'Editar Principio Activo';
  const submitLabel = mode === 'add' ? 'Añadir' : 'Aceptar';

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
        onShow={handleOpen}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* ── Modal header ─────────────────────────────────────────── */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Help card ─────────────────────────────────────────── */}
            {muestraAyudas && (
              <View style={styles.helpCard}>
                <Ionicons name="information-circle-outline" size={20} color="#4a90d9" style={styles.helpIcon} />
                <Text style={styles.helpText}>
                  Seleccione el principio activo e introduzca la dosis diaria que desea
                  añadir al infusor.
                </Text>
              </View>
            )}

            <View style={styles.section}>
              {/* ── PA selector (add mode) ────────────────────────── */}
              {mode === 'add' && (
                <>
                  <View style={styles.fieldHeader}>
                    <Text style={styles.fieldLabel}>Principio Activo</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setPaPickerVisible(true)}
                  >
                    <Text style={[styles.selectorText, !selectedPa && styles.selectorPlaceholder]}>
                      {selectedPa ? selectedPa.descripcion : '-- Seleccione PA --'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#888" />
                  </TouchableOpacity>
                  <View style={styles.divider} />
                </>
              )}

              {/* ── Drug name (edit mode) ─────────────────────────── */}
              {mode === 'edit' && (
                <>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Medicamento</Text>
                    <Text style={styles.fieldValue}>{editPa?.descripcion}</Text>
                  </View>
                  <View style={styles.divider} />
                </>
              )}

              {/* ── Daily dose input ──────────────────────────────── */}
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>
                  Dosis diaria{unidad ? ` en ${unidad}` : ''}
                </Text>
                <TextInput
                  style={[styles.input, cantidadError && styles.inputError]}
                  placeholder={`Dosis diaria${unidad ? ` en ${unidad}` : ''}`}
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={cantidad}
                  onChangeText={(t) => { setCantidad(t); setCantidadError(false); }}
                  returnKeyType="done"
                  autoCorrect={false}
                />
                {cantidadError && (
                  <Text style={styles.errorText}>Este campo es necesario</Text>
                )}
              </View>
            </View>

            {/* ── Submit button ──────────────────────────────────────── */}
            <TouchableOpacity
              style={[styles.submitBtn, isAddDisabled && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isAddDisabled}
            >
              <Text style={styles.submitBtnText}>{submitLabel}</Text>
            </TouchableOpacity>

            {/* ── Presentations list ──────────────────────────────────── */}
            {presentaciones.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>
                  Presentaciones disponibles
                  {(selectedPa || editPa) ? ` de ${selectedPa?.descripcion ?? editPa?.descripcion}` : ''}
                </Text>
                {presentaciones.map((pres, i) => (
                  <React.Fragment key={pres.id}>
                    {i > 0 && <View style={styles.divider} />}
                    <View style={styles.presRow}>
                      <Text style={styles.presText}>{pres.descripcion}</Text>
                      <StockBadge enStock={pres.enStock} />
                    </View>
                  </React.Fragment>
                ))}
              </View>
            )}
          </ScrollView>

          {/* PA picker — overlay inside the same modal to avoid nested-modal issues on iOS */}
          <PaPickerOverlay
            visible={paPickerVisible}
            items={availablePa}
            onSelect={(pa) => { setSelectedPa(pa); setCantidad(''); }}
            onClose={() => setPaPickerVisible(false)}
          />
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function MedicamentosScreen() {
  const navigation = useNavigation();
  const medicamentos  = useInfusionStore((s) => s.infusion.medicamentos);
  const removeMed     = useInfusionStore((s) => s.removeMedicamento);
  const getPa         = useDatosStore((s) => s.getPa);
  const muestraAyudas = useConfiguracionStore((s) => s.muestraAyudas);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode]       = useState<ModalMode>('add');
  const [editAtc, setEditAtc]           = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setModalMode('add');
    setEditAtc(null);
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((atc: string) => {
    setModalMode('edit');
    setEditAtc(atc);
    setModalVisible(true);
  }, []);

  // Add "+" button to the navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={openAdd} style={styles.headerBtn}>
          <Ionicons name="add" size={26} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, openAdd]);

  const renderItem = useCallback(
    ({ item, index }: { item: MedicamentoInfusion; index: number }) => {
      let nombre = item.descripcion ?? '';
      let unidad = item.unidad ?? '';
      if (!nombre || !unidad) {
        try {
          const pa = getPa(item.atc);
          nombre = pa.descripcion;
          unidad = pa.unidad;
        } catch {
          nombre = item.atc;
        }
      }
      return (
        <>
          {index > 0 && <View style={styles.listDivider} />}
          <MedicamentoRow
            med={item}
            nombre={nombre}
            unidad={unidad}
            onEdit={() => openEdit(item.atc)}
            onDelete={() => removeMed(item.atc)}
          />
        </>
      );
    },
    [getPa, openEdit, removeMed],
  );

  return (
    <View style={styles.flex}>
      {muestraAyudas && (
        <View style={styles.helpCard}>
          <Ionicons name="information-circle-outline" size={20} color="#4a90d9" style={styles.helpIcon} />
          <Text style={styles.helpText}>
            Deslice el medicamento hacia la izquierda para borrarlo.
          </Text>
        </View>
      )}

      {medicamentos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="medkit-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Sin medicamentos</Text>
          <Text style={styles.emptySubtext}>
            Pulse + para añadir un principio activo a la infusión.
          </Text>
        </View>
      ) : (
        <FlatList
          data={medicamentos}
          keyExtractor={(item) => item.atc}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      <MedicamentoModal
        visible={modalVisible}
        mode={modalMode}
        editAtc={editAtc}
        onClose={() => setModalVisible(false)}
      />
    </View>
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
  label: '#444444',
  text: '#111111',
  subtext: '#888888',
  danger: '#d9534f',
  success: '#5cb85c',
  primary: '#007AFF',
  helpBg: '#eaf3fb',
  helpBorder: '#4a90d9',
  helpText: '#2c6fad',
  deleteRed: '#ff3b30',
  badgeOkBg: '#dff0d8',
  badgeOkText: '#3c763d',
  badgeEmptyBg: '#f2dede',
  badgeEmptyText: '#a94442',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },

  // Header button
  headerBtn: { paddingHorizontal: 12 },

  // Help card
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.helpBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.helpBorder,
    borderRadius: 6,
    margin: 12,
    marginBottom: 0,
    padding: 12,
    gap: 8,
  },
  helpIcon: { marginTop: 1 },
  helpText: { flex: 1, fontSize: 14, color: colors.helpText, lineHeight: 20 },

  // List
  list: { flex: 1 },
  listContent: { padding: 12 },
  listDivider: { height: 1, backgroundColor: colors.divider, marginLeft: 16 },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 60,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '500', color: colors.text },
  rowSubtitle: { fontSize: 13, color: colors.subtext, marginTop: 2 },

  // Swipe delete action
  deleteAction: {
    backgroundColor: colors.deleteRed,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteActionText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 10,
  },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#999' },
  emptySubtext: { fontSize: 14, color: '#bbb', textAlign: 'center' },

  // Modal
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    paddingBottom: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  modalCancelBtn: { padding: 4 },
  modalCancelText: { fontSize: 16, color: colors.primary },
  modalContent: { padding: 12, gap: 12 },

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
    paddingVertical: 10,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 14 },

  // Fields
  fieldHeader: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 2 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.label, marginBottom: 4 },
  fieldRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldValue: { fontSize: 15, color: colors.text, flex: 1 },

  // Selector
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  selectorText: { flex: 1, fontSize: 15, color: colors.text },
  selectorPlaceholder: { color: '#aaa' },

  // Input
  inputRow: { paddingHorizontal: 14, paddingVertical: 10 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: colors.label, marginBottom: 4 },
  input: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inputError: { borderBottomColor: colors.danger },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4 },

  // Submit button
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#b0c8e8' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Presentation row
  presRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  presText: { flex: 1, fontSize: 14, color: colors.text },

  // Badge
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeOk: { backgroundColor: colors.badgeOkBg },
  badgeEmpty: { backgroundColor: colors.badgeEmptyBg },
  badgeText: { fontSize: 12, fontWeight: '600' },

  // PA picker sheet
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  pickerSeparator: { height: 1, backgroundColor: colors.divider, marginLeft: 16 },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 14 },
  pickerItemText: { fontSize: 16, color: colors.text },
});
