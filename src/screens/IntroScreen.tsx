import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useConfiguracionStore } from '../store/configuracionStore';
import InfusorIcon    from '../../assets/infusor.svg';
import MedkitIcon     from '../../assets/medkit.svg';
import CalculatorIcon from '../../assets/calculator.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_SLIDES = 5;

// ─── Slide content ────────────────────────────────────────────────────────────

function Slide0() {
  return (
    <View style={styles.slide}>
      <InfusorIcon width={80} height={80} color={colors.primary} style={styles.slideIcon} />
      <Text style={styles.slideTitle}>Bienvenido a{'\n'}InfusorApp</Text>
      <Text style={styles.slideSubtitle}>
        Calculadora de medicación para infusores elastoméricos en cuidados paliativos.
      </Text>
    </View>
  );
}

function Slide1() {
  return (
    <View style={styles.slide}>
      <InfusorIcon width={80} height={80} color={colors.primary} style={styles.slideIcon} />
      <Text style={styles.slideTitle}>Configura el infusor</Text>
      <Text style={styles.slideBody}>
        Introduce las características del infusor: volumen, flujo y factor de corrección.{'\n\n'}
        También puedes introducir la duración deseada de la infusión.
      </Text>
    </View>
  );
}

function Slide2() {
  return (
    <View style={styles.slide}>
      <MedkitIcon width={64} height={64} fill={colors.primary} style={styles.slideIcon} />
      <Text style={styles.slideTitle}>Selecciona la medicación</Text>
      <Text style={styles.slideBody}>
        Introduce la medicación que deseas incluir en el infusor y sus dosis diarias.{'\n\n'}
        Puedes añadir varios medicamentos y la aplicación verificará su compatibilidad.
      </Text>
    </View>
  );
}

function Slide3() {
  return (
    <View style={styles.slide}>
      <CalculatorIcon width={64} height={64} fill={colors.primary} style={styles.slideIcon} />
      <Text style={styles.slideTitle}>Calcula la infusión</Text>
      <Text style={styles.slideBody}>
        La aplicación calcula automáticamente los datos para el infusor y la medicación seleccionados.{'\n\n'}
        Obtendrás los volúmenes, presentaciones necesarias y la duración real de la infusión.
      </Text>
    </View>
  );
}

function Slide4() {
  return (
    <View style={styles.slide}>
      <Ionicons name="information-circle-outline" size={64} color={colors.primary} style={styles.slideIcon} />
      <Text style={styles.slideTitle}>Más información</Text>
      <Text style={styles.slideBody}>
        Puede consultar más información sobre la aplicación en{'\n'}
        <Text style={styles.link}>www.infusor-app.com</Text>
      </Text>
      <Text style={styles.slideBody}>
        Si quiere contactar con el programador puede hacerlo en{'\n'}
        <Text style={styles.link}>infusor@infusor-app.com</Text>
      </Text>
    </View>
  );
}

// ─── Dot indicator ────────────────────────────────────────────────────────────

function Dots({ current }: { current: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
        <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function IntroScreen() {
  const insets = useSafeAreaInsets();
  const setMuestraIntro = useConfiguracionStore((s) => s.setMuestraIntro);

  const [slideIndex, setSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList<number>>(null);

  const startApp = useCallback(() => setMuestraIntro(false), [setMuestraIntro]);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_SLIDES) return;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setSlideIndex(index);
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setSlideIndex(viewableItems[0].index);
      }
    },
  );
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderSlide = useCallback(
    ({ item: index }: { item: number }) => {
      const slide =
        index === 0 ? <Slide0 /> :
        index === 1 ? <Slide1 /> :
        index === 2 ? <Slide2 /> :
        index === 3 ? <Slide3 /> :
        <Slide4 />;
      return <View style={styles.slideContainer}>{slide}</View>;
    },
    [],
  );

  const leftBtn = slideIndex > 0 ? (
    <TouchableOpacity onPress={() => goTo(slideIndex - 1)} style={styles.navBtn}>
      <Text style={styles.navBtnText}>‹ Previa</Text>
    </TouchableOpacity>
  ) : null;

  const rightBtn = slideIndex === TOTAL_SLIDES - 1 ? (
    <TouchableOpacity onPress={startApp} style={styles.navBtn}>
      <Text style={styles.navBtnText}>Iniciar aplicación</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={() => goTo(slideIndex + 1)} style={styles.navBtn}>
      <Text style={styles.navBtnText}>Siguiente ›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.flex}>
      {/* Nav bar */}
      <View style={[styles.navBar, { paddingTop: insets.top }]}>
        <View style={styles.navSide}>{leftBtn}</View>
        <Text style={styles.navTitle}>Intro</Text>
        <View style={[styles.navSide, styles.navRight]}>{rightBtn}</View>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={[0, 1, 2, 3, 4]}
        keyExtractor={(i) => String(i)}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        scrollEventThrottle={16}
        style={styles.flex}
        contentInsetAdjustmentBehavior="never"
      />

      {/* Dot indicators */}
      <Dots current={slideIndex} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const colors = {
  background: '#ffffff',
  primary: '#007AFF',
  text: '#111',
  muted: '#666',
  dotInactive: '#ddd',
  dotActive: '#007AFF',
  navBg: '#f8f8f8',
  navBorder: '#e0e0e0',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.navBorder,
    minHeight: 48,
    paddingHorizontal: 4,
  },
  navSide: { flex: 1 },
  navRight: { alignItems: 'flex-end' },
  navTitle: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' },
  navBtn: { padding: 10 },
  navBtnText: { fontSize: 15, color: colors.primary },

  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  slideIcon: { marginBottom: 8 },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  slideSubtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  slideBody: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 23,
  },
  link: { color: colors.primary },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dotInactive,
  },
  dotActive: { backgroundColor: colors.dotActive, width: 20 },
});
