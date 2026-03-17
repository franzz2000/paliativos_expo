import React, { Fragment, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import { NuevaInfusionModal } from '../components/NuevaInfusionModal';
import { useInfusionStore } from '../store/infusionStore';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const clearInfusion = useInfusionStore((s) => s.clear);

  const handleConfirm = () => {
    clearInfusion();
    setModalVisible(false);
    props.navigation.closeDrawer();
    // Navigate to the Infusor tab
    props.navigation.navigate('Infusion', { screen: 'Infusor' });
  };

  return (
    <>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
        {/* Drawer header */}
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Menú</Text>
        </View>

        {/* "Infusión nueva" — first item, opens confirmation modal */}
        <TouchableOpacity
          style={styles.newInfusionBtn}
          onPress={() => {
            props.navigation.closeDrawer();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.newInfusionText}>Infusión nueva</Text>
        </TouchableOpacity>

        {/* Registered drawer screens — divider after the first item */}
        {props.state.routes.map((route, index) => {
          const { title, drawerLabel, drawerIcon, drawerActiveTintColor, drawerInactiveTintColor } =
            props.descriptors[route.key].options;
          const focused = props.state.index === index;
          const label = (drawerLabel ?? title ?? route.name) as string;

          return (
            <Fragment key={route.key}>
              <DrawerItem
                label={label}
                focused={focused}
                icon={drawerIcon ? ({ color, size }) => drawerIcon({ color, size, focused }) : undefined}
                activeTintColor={drawerActiveTintColor}
                inactiveTintColor={drawerInactiveTintColor}
                onPress={() => props.navigation.navigate(route.name)}
              />
              {(index === 0 || index === 2) && <View style={styles.divider} />}
            </Fragment>
          );
        })}
      </DrawerContentScrollView>

      <NuevaInfusionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

const colors = {
  background: '#fff',
  border: '#e8e8e8',
  headerBg: '#f7f7f7',
  primary: '#007AFF',
  danger: '#d9534f',
  title: '#111',
  itemText: '#333',
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background },

  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 4,
  },
  drawerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.title,
  },

  // "Infusión nueva" destructive item
  newInfusionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  newInfusionText: {
    fontSize: 15,
    color: colors.danger,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
    marginBottom: 4,
  },
});
