// Root navigator — mirrors the Angular UI-Router state tree from app.js
// Intro → (if accepted) Drawer with Tabs inside

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useConfiguracionStore } from '../store/configuracionStore';

// ── Custom drawer ─────────────────────────────────────────────────────────────
import { CustomDrawerContent } from './CustomDrawerContent';

// ── Screens ───────────────────────────────────────────────────────────────────
import { IntroScreen }          from '../screens/IntroScreen';
import { InfusorScreen }        from '../screens/InfusorScreen';
import { MedicamentosScreen }   from '../screens/MedicamentosScreen';
import { CalculoScreen }        from '../screens/CalculoScreen';
import { ExistenciasScreen }    from '../screens/ExistenciasScreen';
import { ExistenciaScreen }     from '../screens/ExistenciaScreen';
import { ConfiguracionScreen }  from '../screens/ConfiguracionScreen';
import { AyudaScreen }          from '../screens/AyudaScreen';
import { AcercaDeScreen }       from '../screens/AcercaDeScreen';

// ── Type declarations ──────────────────────────────────────────────────────────
export type RootStackParams = {
  Intro: undefined;
  App: undefined;
};

export type DrawerParams = {
  Infusion: undefined;
  Existencias: undefined;
  Configuracion: undefined;
  Ayuda: undefined;
  AcercaDe: undefined;
};

export type InfusionTabParams = {
  Infusor: undefined;
  Medicamentos: undefined;
  Calculo: undefined;
};

export type ExistenciaStackParams = {
  ExistenciasList: undefined;
  Existencia: { idExistencia: number | string };
};

// ── Navigators ────────────────────────────────────────────────────────────────
const Stack           = createStackNavigator<RootStackParams>();
const ExistenciaStack = createStackNavigator<ExistenciaStackParams>();
const Drawer          = createDrawerNavigator<DrawerParams>();
const Tab             = createBottomTabNavigator<InfusionTabParams>();

function DrawerMenuButton() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParams>>();
  return (
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ paddingHorizontal: 16 }}>
      <Ionicons name="menu" size={24} color="#007AFF" />
    </TouchableOpacity>
  );
}

/** Replaces app.existencias + app.existencia/:id states */
function ExistenciasStack() {
  return (
    <ExistenciaStack.Navigator>
      <ExistenciaStack.Screen
        name="ExistenciasList"
        component={ExistenciasScreen}
        options={{ title: 'Existencias', headerLeft: () => <DrawerMenuButton /> }}
      />
      <ExistenciaStack.Screen
        name="Existencia"
        component={ExistenciaScreen}
        options={{ title: '' }} // overridden dynamically by ExistenciaScreen
      />
    </ExistenciaStack.Navigator>
  );
}

/** Replaces app.infusion abstract state + its three child tab states */
function InfusionTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Infusor"      component={InfusorScreen}      options={{ title: 'Infusor' }} />
      <Tab.Screen name="Medicamentos" component={MedicamentosScreen} options={{ title: 'Medicamentos' }} />
      <Tab.Screen name="Calculo"      component={CalculoScreen}      options={{ title: 'Cálculo' }} />
    </Tab.Navigator>
  );
}

/** Replaces menu.html side-menu + all app.* states */
function AppDrawer() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Infusion"     component={InfusionTabs}      options={{ title: 'Infusión' }} />
      <Drawer.Screen name="Existencias"  component={ExistenciasStack}  options={{ title: 'Existencias', headerShown: false }} />
      <Drawer.Screen name="Configuracion" component={ConfiguracionScreen} options={{ title: 'Configuración' }} />
      <Drawer.Screen name="Ayuda"        component={AyudaScreen}       options={{ title: 'Ayuda' }} />
      <Drawer.Screen name="AcercaDe"     component={AcercaDeScreen}    options={{ title: 'Acerca de' }} />
    </Drawer.Navigator>
  );
}

/** Root stack — handles intro gating (replaces $urlRouterProvider.otherwise('/intro')) */
export function AppNavigator() {
  const muestraIntro = useConfiguracionStore((s) => s.muestraIntro);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {muestraIntro ? (
          <Stack.Screen name="Intro" component={IntroScreen} />
        ) : (
          <Stack.Screen name="App" component={AppDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
