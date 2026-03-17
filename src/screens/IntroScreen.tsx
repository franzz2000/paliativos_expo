import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useConfiguracionStore } from '../store/configuracionStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_SLIDES = 4;

// ─── Disclaimer text (shared with AcercaDeScreen) ────────────────────────────

const DISCLAIMER_ITEMS = [
  'A pesar de que se ha intentado evitar al máximo errores de cálculo en la aplicación, ésta puede tener fallos, por lo que no se garantiza que la misma esté exenta de errores.',
  'Esta aplicación está pensada para los fines que se describen en los términos de uso. Cualquier uso de la misma para otros fines se considerará un uso incorrecto.',
  'La aplicación Infusor y su autor no asumen ninguna responsabilidad sobre los daños que pueda causar por su uso incorrecto o por la aparición de errores en los cálculos.',
  'Es responsabilidad exclusiva del profesional sanitario que la utilice el comprobar que los resultados calculados en la aplicación son los correctos.',
];

// ─── Slide content ────────────────────────────────────────────────────────────

interface SlideProps {
  aceptaCondiciones: boolean;
  onToggleAcepta: () => void;
}

function Slide0() {
  return (
    <View style={styles.slide}>
      <Ionicons name="pulse" size={80} color={colors.primary} style={styles.slideIcon} />
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
      <Ionicons name="time-outline" size={64} color={colors.primary} style={styles.slideIcon} />
      <Text style={styles.slideTitle}>Configura el infusor</Text>
      <Text style={styles.slideBody}>
        Introduzca las características del infusor: volumen, flujo y factor de corrección.{'\n\n'}
        También es necesario introducir la duración deseada de la infusión.
      </Text>
    </View>
  );
}

function Slide2({ aceptaCondiciones, onToggleAcepta }: SlideProps) {
  return (
    <View style={[styles.slide, styles.slideScroll]}>
      <ScrollView
        contentContainerStyle={styles.disclaimerContent}
        showsVerticalScrollIndicator
      >
        <Text style={styles.disclaimerTitle}>Descargo de responsabilidades</Text>

        {DISCLAIMER_ITEMS.map((item, i) => (
          <View key={i} style={styles.disclaimerItem}>
            <Text style={styles.disclaimerBullet}>{i + 1}.</Text>
            <Text style={styles.disclaimerText}>{item}</Text>
          </View>
        ))}

        {/* Acceptance checkbox */}
        <TouchableOpacity
          style={styles.checkRow}
          onPress={onToggleAcepta}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, aceptaCondiciones && styles.checkboxChecked]}>
            {aceptaCondiciones && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
          <Text style={styles.checkLabel}>He leído y acepto las condiciones de uso</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Slide3() {
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

  const [slideIndex, setSlideIndex]               = useState(0);
  const [aceptaCondiciones, setAceptaCondiciones] = useState(false);
  const flatListRef = useRef<FlatList<number>>(null);

  const startApp = useCallback(() => setMuestraIntro(false), [setMuestraIntro]);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_SLIDES) return;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setSlideIndex(index);
  }, []);

  // Detect current slide after user swipes manually
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
        index === 2 ? (
          <Slide2
            aceptaCondiciones={aceptaCondiciones}
            onToggleAcepta={() => setAceptaCondiciones((v) => !v)}
          />
        ) : <Slide3 />;
      return <View style={styles.slideContainer}>{slide}</View>;
    },
    [aceptaCondiciones],
  );

  // ── Header nav buttons (replicates ion-nav-buttons) ──────────────────────
  const leftBtn =
    slideIndex === 0 && aceptaCondiciones ? (
      <TouchableOpacity onPress={startApp} style={styles.navBtn}>
        <Text style={styles.navBtnText}>Saltar Intro</Text>
      </TouchableOpacity>
    ) : slideIndex > 0 ? (
      <TouchableOpacity onPress={() => goTo(slideIndex - 1)} style={styles.navBtn}>
        <Text style={styles.navBtnText}>‹ Previa</Text>
      </TouchableOpacity>
    ) : null;

  const rightBtn =
    slideIndex === 3 ? (
      <TouchableOpacity onPress={startApp} style={styles.navBtn}>
        <Text style={styles.navBtnText}>Iniciar aplicación</Text>
      </TouchableOpacity>
    ) : slideIndex === 2 ? (
      aceptaCondiciones ? (
        <TouchableOpacity onPress={() => goTo(slideIndex + 1)} style={styles.navBtn}>
          <Text style={styles.navBtnText}>Siguiente ›</Text>
        </TouchableOpacity>
      ) : null
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
        data={[0, 1, 2, 3]}
        keyExtractor={(i) => String(i)}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        scrollEventThrottle={16}
        style={styles.flex}
        // Prevent FlatList from adding extra padding on iOS
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
  border: '#e0e0e0',
  checkBorder: '#ccc',
  checkBg: '#007AFF',
  dotInactive: '#ddd',
  dotActive: '#007AFF',
  navBg: '#f8f8f8',
  navBorder: '#e0e0e0',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },

  // Custom nav bar (replicates ion-nav-buttons)
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

  // Slide wrapper — exactly one screen wide
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },

  // Slide layouts
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  slideScroll: {
    justifyContent: 'flex-start',
    padding: 0,
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

  // Disclaimer slide
  disclaimerContent: { padding: 20, gap: 12 },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  disclaimerItem: { flexDirection: 'row', gap: 8 },
  disclaimerBullet: { fontSize: 13, fontWeight: '600', color: colors.text, minWidth: 18 },
  disclaimerText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 19, textAlign: 'justify' },

  // Acceptance checkbox
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.checkBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: colors.checkBg,
    borderColor: colors.checkBg,
  },
  checkLabel: { flex: 1, fontSize: 14, color: colors.text },

  // Dot indicators
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
