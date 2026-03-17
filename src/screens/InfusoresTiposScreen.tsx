import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useInfusoresTiposStore } from '../store/infusoresTiposStore';
import { InfusorTipoFormModal } from '../components/InfusorTipoFormModal';
import type { InfusorTipo } from '../types';

// ─── Swipe delete action ───────────────────────────────────────────────────────

function DeleteAction({ onPress, dragX }: { onPress: () => void; dragX: Animated.AnimatedInterpolation<number> }) {
  const scale = dragX.interpolate({
    inputRange: [-80, 0],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  return (
    <TouchableOpacity style={styles.deleteAction} onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
  item: InfusorTipo;
  onEdit: (item: InfusorTipo) => void;
  onDelete: (id: string) => void;
}

function InfusorRow({ item, onEdit, onDelete }: RowProps) {
  const swipeRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeRef.current?.close();
    onDelete(item.id);
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => <DeleteAction onPress={handleDelete} dragX={dragX} />;

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} friction={2} rightThreshold={40}>
      <View style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{item.descripcion}</Text>
          <Text style={styles.rowMeta}>{item.volumen} ml · {item.flujo} ml/h</Text>
        </View>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.editBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="pencil-outline" size={18} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function InfusoresTiposScreen() {
  const navigation = useNavigation();
  const infusores = useInfusoresTiposStore((s) => s.infusores);
  const add       = useInfusoresTiposStore((s) => s.add);
  const update    = useInfusoresTiposStore((s) => s.update);
  const remove    = useInfusoresTiposStore((s) => s.remove);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<InfusorTipo | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => { setEditing(null); setModalVisible(true); }}
          style={{ paddingHorizontal: 16 }}
        >
          <Ionicons name="add" size={26} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleEdit = useCallback((item: InfusorTipo) => {
    setEditing(item);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    remove(id);
  }, [remove]);

  const handleSave = useCallback(
    (data: Omit<InfusorTipo, 'id'>) => {
      if (editing) {
        update(editing.id, data);
      } else {
        add(data);
      }
      setModalVisible(false);
      setEditing(null);
    },
    [editing, add, update],
  );

  const renderItem = useCallback(
    ({ item }: { item: InfusorTipo }) => (
      <InfusorRow item={item} onEdit={handleEdit} onDelete={handleDelete} />
    ),
    [handleEdit, handleDelete],
  );

  return (
    <View style={styles.flex}>
      <FlatList
        data={infusores}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>Sin infusores guardados</Text>
            <Text style={styles.emptySubtitle}>
              Pulsa el botón + para añadir un nuevo tipo de infusor.
            </Text>
          </View>
        }
      />

      <InfusorTipoFormModal
        visible={modalVisible}
        initial={editing}
        onClose={() => { setModalVisible(false); setEditing(null); }}
        onSave={handleSave}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f0f0f0' },
  list: { flex: 1 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  rowMeta: { fontSize: 13, color: '#666', marginTop: 2 },
  editBtn: { padding: 4 },

  deleteAction: {
    backgroundColor: '#d9534f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
  },

  separator: { height: 1, backgroundColor: '#e0e0e0' },

  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#555' },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
});
