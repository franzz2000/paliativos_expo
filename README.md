# InfusorApp

Aplicación móvil para el cálculo de medicación en infusores elastoméricos en cuidados paliativos.

## Descripción

**InfusorApp** ayuda a los profesionales sanitarios a calcular las dosis de medicamentos necesarias para cargar un infusor elastomérico, teniendo en cuenta el volumen y flujo del dispositivo, la duración deseada y las existencias disponibles en el almacén.

La aplicación permite:
- Configurar las características del infusor (volumen, flujo, duración)
- Añadir los principios activos con sus dosis diarias
- Calcular automáticamente los volúmenes y las presentaciones necesarias
- Gestionar el stock de medicamentos disponible
- Ajustar la duración de la infusión si las existencias son insuficientes

> **Aviso:** Esta aplicación es una herramienta de apoyo para profesionales sanitarios. Es responsabilidad exclusiva del profesional comprobar que los resultados calculados son correctos.

## Capturas de pantalla

| Infusor | Medicamentos | Cálculo |
|---------|--------------|---------|
| Configuración del dispositivo | Principios activos | Resultados y presentaciones |

## Instalación

### Requisitos previos

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator / Android Emulator o dispositivo físico con Expo Go

### Pasos

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd paliativos_expo

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npx expo start
```

Escanea el código QR con la app **Expo Go** en tu dispositivo, o pulsa `i` para abrir el simulador de iOS o `a` para Android.

## Estructura del proyecto

```
src/
├── screens/               # Pantallas de la aplicación
│   ├── IntroScreen.tsx       # Introducción y aviso legal
│   ├── InfusorScreen.tsx     # Configuración del infusor (tab 1)
│   ├── MedicamentosScreen.tsx# Añadir medicamentos (tab 2)
│   ├── CalculoScreen.tsx     # Resultados del cálculo (tab 3)
│   ├── ExistenciasScreen.tsx # Lista de existencias
│   ├── ExistenciaScreen.tsx  # Edición de stock individual
│   ├── ConfiguracionScreen.tsx
│   ├── AyudaScreen.tsx
│   └── AcercaDeScreen.tsx
│
├── navigation/            # Configuración de la navegación
│   ├── AppNavigator.tsx      # Estructura principal (drawer + tabs)
│   └── CustomDrawerContent.tsx
│
├── store/                 # Estado global (Zustand)
│   ├── configuracionStore.ts # Ajustes de la app
│   ├── datosStore.ts         # Datos de medicamentos y stock
│   └── infusionStore.ts      # Sesión de infusión activa
│
├── services/              # Lógica de negocio
│   ├── calculos.ts           # Cálculo de infusión
│   ├── infusorCalcs.ts       # Cálculo de parámetros del infusor
│   └── storage.ts            # Wrapper de AsyncStorage
│
├── data/                  # Base de datos estática
│   ├── medicamentos.ts       # Principios activos y compatibilidades
│   └── presentaciones.ts     # Presentaciones disponibles
│
└── types/
    └── index.ts           # Definiciones de tipos TypeScript
```

## Navegación

```
RootStack
├── Intro (pantalla de bienvenida y aviso legal)
└── App
    └── Drawer
        ├── Infusión
        │   ├── Infusor (tab)       ← parámetros del dispositivo
        │   ├── Medicamentos (tab)  ← principios activos y dosis
        │   └── Cálculo (tab)       ← resultados y presentaciones
        ├── Existencias             ← gestión de stock
        ├── Configuración
        ├── Ayuda
        └── Acerca de
```

## Flujo de uso

1. **Infusor** — Introduce el volumen, flujo, factor de corrección y duración deseada del infusor.
2. **Medicamentos** — Añade los principios activos con sus dosis diarias.
3. **Cálculo** — Consulta los resultados: duración, volúmenes, y número de presentaciones necesarias por medicamento.
4. **Existencias** *(opcional)* — Actualiza el stock disponible para que el cálculo tenga en cuenta los medicamentos que tienes en el almacén.

Si el stock es insuficiente, la app muestra una alerta y permite ajustar la duración de la infusión automáticamente.

## Lógica de cálculo

El módulo `calculos.ts` implementa un pipeline en cuatro pasos:

1. **Validación** — Comprueba que los campos obligatorios están rellenos.
2. **Cálculo de datos** — Para cada medicamento calcula la cantidad total necesaria, la compara con el stock disponible y calcula los volúmenes.
3. **Asignación de presentaciones** — Algoritmo greedy que determina qué presentaciones (ampollas/viales) usar, priorizando las más grandes y calculando el volumen parcial restante.
4. **Recálculo de duración** *(opcional)* — Si el stock es insuficiente y la opción está activada, calcula la duración máxima alcanzable con las existencias disponibles.

## Estado y persistencia

El estado se gestiona con **Zustand** y se persiste automáticamente en AsyncStorage:

| Store | Contenido | Persistido |
|-------|-----------|------------|
| `configuracionStore` | Ajustes de la app | ✓ Completo |
| `datosStore` | Datos de medicamentos + overrides de stock | ✓ Solo overrides |
| `infusionStore` | Sesión de infusión activa | ✓ Completo |

## Tecnologías

| Paquete | Versión | Uso |
|---------|---------|-----|
| React Native | 0.81.5 | Framework móvil |
| Expo SDK | 54 | Toolchain |
| React | 19.1.0 | UI |
| React Navigation | 7 | Navegación |
| Zustand | 4.5 | Estado global |
| React Native Reanimated | 4.1 | Animaciones |
| React Native Gesture Handler | 2.28 | Gestos |
| TypeScript | 5.9 | Tipado estático |

## Scripts disponibles

```bash
npm start          # Inicia el servidor Expo
npm run ios        # Abre en simulador iOS
npm run android    # Abre en emulador Android
npm test           # Ejecuta los tests
```

## Autor

**Francisco José Jimeno Demuth**
Médico especialista en Medicina Familiar y Comunitaria

- Web: [www.infusor-app.com](http://www.infusor-app.com)
- Contacto: infusor@infusor-app.com

## ⚖️ Licencia y Atribución
Este proyecto está bajo la licencia **GNU GPL v3**. 

**¿Quieres usar parte del código en tu proyecto?**
¡Perfecto! Solo recuerda que, bajo esta licencia, debes:
1. **Mencionar a InfusorApp** y a sus autores originales en los créditos.
2. Hacer que tu aplicación también sea de **código abierto** bajo la misma licencia GPL v3.

## ☕ Apoya el proyecto
Si InfusorApp te resulta útil, puedes invitarme a un café para ayudarme a mantener los servidores y seguir mejorando la herramienta:
👉 [Buy Me a Coffee](https://buymeacoffee.com/franzjimeno)

---
Hecho con ❤️ por Franz Jimeno 
