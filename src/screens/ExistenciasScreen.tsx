import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';

import { useDatosStore } from '../store/datosStore';
import type { ExistenciaStackParams } from '../navigation/AppNavigator';
import type { Presentacion, PrincipioActivo } from '../types';

// ─── List item type ───────────────────────────────────────────────────────────

type TitleItem = PrincipioActivo & { esTitulo: true; clave: string };
type PresItem  = Presentacion    & { esTitulo: false; clave: string };
type ListItem  = TitleItem | PresItem;

// ─── Build the flat grouped list (replicates ExistenciasCtrl logic) ───────────

function buildList(
  allPa: PrincipioActivo[],
  allPres: Presentacion[],
): ListItem[] {
  const sorted = [...allPa].sort((a, b) =>
    a.descripcion.localeCompare(b.descripcion),
  );
  const items: ListItem[] = [];
  for (const pa of sorted) {
    items.push({ ...pa, esTitulo: true, clave: pa.descripcion });
    for (const pres of allPres.filter((p) => p.atc === pa.atc)) {
      items.push({ ...pres, esTitulo: false, clave: pa.descripcion });
    }
  }
  return items;
}

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockBadge({ enStock }: { enStock: number }) {
  return (
    <View style={[styles.badge, enStock > 0 ? styles.badgeOk : styles.badgeEmpty]}>
      <Text style={styles.badgeText}>{enStock} Uds</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type Props = StackScreenProps<ExistenciaStackParams, 'ExistenciasList'>;

export function ExistenciasScreen({ navigation }: Props) {
  const getAllPa            = useDatosStore((s) => s.getAllPa);
  const getAllPresentaciones = useDatosStore((s) => s.getAllPresentaciones);

  const [search, setSearch] = useState('');
  const listRef = useRef<FlatList<ListItem>>(null);

  // Build full flat list once; re-build when store changes
  const fullList = useMemo(
    () => buildList(getAllPa(), getAllPresentaciones()),
    [getAllPa, getAllPresentaciones],
  );

  // Filter by PA name (clave), preserving both title rows and their children
  const filteredList = useMemo(() => {
    if (!search.trim()) return fullList;
    const q = search.toLowerCase();
    return fullList.filter((item) => item.clave.toLowerCase().includes(q));
  }, [fullList, search]);

  // Scroll to top whenever the search query changes (replicates scrollTop())
  useEffect(() => {
    if (filteredList.length > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [search]);

  const handleClearSearch = useCallback(() => setSearch(''), []);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.esTitulo) {
        return <Text style={styles.groupHeader}>{item.descripcion}</Text>;
      }
      return (
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Existencia', { idExistencia: item.id })}
          activeOpacity={0.7}
        >
          <Text style={styles.rowText} numberOfLines={2}>
            {item.descripcion}
          </Text>
          <StockBadge enStock={item.enStock} />
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  return (
    <View style={styles.flex}>
      {/* ── Search bar (replicates ion-header-bar sub-header) ──────────────── */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filtrar medicamentos..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Flat grouped list ──────────────────────────────────────────────── */}
      <FlatList
        ref={listRef}
        data={filteredList}
        keyExtractor={(item, index) =>
          item.esTitulo ? `title-${item.atc}` : `pres-${item.id}-${index}`
        }
        renderItem={renderItem}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Sin resultados para "{search}"</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const colors = {
  background: '#f0f0f0',
  card: '#ffffff',
  border: '#e0e0e0',
  groupHeader: '#f0f0f0',
  groupHeaderText: '#666666',
  text: '#111111',
  badgeOkBg: '#5cb85c',
  badgeEmptyBg: '#d9534f',
  searchBg: '#ffffff',
  searchBorder: '#ddd',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.searchBorder,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    gap: 8,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
  },
  clearBtn: { padding: 2 },

  // List
  list: { flex: 1 },

  // Group header row (PA title — replicates item-divider)
  groupHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.groupHeaderText,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    backgroundColor: colors.groupHeader,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Presentation row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  rowText: { flex: 1, fontSize: 15, color: colors.text },

  // Badge
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeOk: { backgroundColor: colors.badgeOkBg },
  badgeEmpty: { backgroundColor: colors.badgeEmptyBg },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  // Empty state
  emptyState: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#999' },
});
