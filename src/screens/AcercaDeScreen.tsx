import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

export function AcercaDeScreen() {
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.card}>

        <Section title="Autor">
          <Paragraph>Francisco José Jimeno Demuth</Paragraph>
          <Paragraph>Médico especialista en Medicina Familiar y Comunitaria</Paragraph>
        </Section>

        <View style={styles.divider} />

        <Section title="Correo electrónico">
          <Paragraph>infusor@infusor-app.com</Paragraph>
        </Section>

        <View style={styles.divider} />

        <Section title="Introducción">
          <Paragraph>
            El uso de los infusores elastoméricos para aplicar medicación de forma continuada
            a los pacientes ha ido en aumento en los últimos años.
          </Paragraph>
          <Paragraph>
            A pesar de que el cálculo de la cantidad necesaria a utilizar es relativamente
            sencilla, en ocasiones puede generar dudas al profesional de si ha hecho
            correctamente los cálculos.
          </Paragraph>
          <Paragraph>
            La aplicación "Infusor" trata de ayudar a estos profesionales sanitarios en el uso
            de un infusor elastomérico realizando el cálculo de la cantidad de medicamentos
            necesaria para un determinado tiempo de infusión a partir de la dosis diaria de
            los mismos, conociendo el volumen y el flujo del infusor.
          </Paragraph>
        </Section>

        <View style={styles.divider} />

        <Section title="Términos de uso">
          <Paragraph>
            Cualquier uso fuera de los términos anteriormente descritos se considerará fuera
            del ámbito de uso de la aplicación.
          </Paragraph>
        </Section>

        <View style={styles.divider} />

        <Section title="Descargo de responsabilidades">
          {[
            'A pesar de que se ha intentado evitar al máximo errores de cálculo en la aplicación, ésta puede tener fallos, por lo que no se garantiza que la misma esté exenta de errores que puedan aparecer.',
            'Esta aplicación está pensada para los fines que se describen en los términos de uso. Cualquier uso de la misma para otros fines se considerará un uso incorrecto.',
            'La aplicación Infusor y su autor no asumen ninguna responsabilidad sobre los daños que pueda causar por su uso incorrecto o por la aparición de errores en los cálculos.',
            'Es responsabilidad exclusiva del profesional sanitario que la utilice el comprobar que los resultados calculados en la aplicación son los correctos.',
          ].map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listBullet}>{i + 1}.</Text>
              <Text style={[styles.paragraph, styles.listText]}>{item}</Text>
            </View>
          ))}
        </Section>

        <View style={styles.divider} />

        <Section title="Agradecimientos">
          {[
            'María Gabriela Álvarez Sánchez',
            'Rosario Isabel de la Fuente Iturralde',
            'Ana María Romero Suárez',
          ].map((name) => (
            <View key={name} style={styles.listItem}>
              <Text style={styles.listBullet}>·</Text>
              <Text style={[styles.paragraph, styles.listText]}>{name}</Text>
            </View>
          ))}
        </Section>

      </View>
    </ScrollView>
  );
}

const colors = {
  background: '#f0f0f0',
  card: '#fff',
  border: '#e0e0e0',
  title: '#333',
  text: '#222',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 12 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: colors.border },

  section: { padding: 16, gap: 6 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.title,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
    textAlign: 'justify',
  },
  listItem: { flexDirection: 'row', gap: 8, marginTop: 4 },
  listBullet: { fontSize: 14, color: colors.title, fontWeight: '600', minWidth: 18 },
  listText: { flex: 1 },
});
