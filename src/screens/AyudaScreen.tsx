import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HelpSection {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
}

const SECTIONS: HelpSection[] = [
  {
    icon: 'time-outline',
    title: 'Infusor',
    body:
      'En esta pestaña se rellenan los valores relativos al infusor.\n\n' +
      'Introduzca el volumen, el flujo, el factor de corrección y la duración deseada de la infusión.\n\n' +
      'El factor de corrección modifica el flujo en un determinado porcentaje, para poder adaptarlo a diferentes situaciones especiales, como el tipo de dilución, temperatura ambiental, lugar de colocación del infusor, etc.\n\n' +
      'La duración de infusión deseada puede variar en función del volumen de llenado del infusor; esta debe estar dentro del rango indicado en la configuración. La duración viene determinada por la suma de los campos "Días" y "Horas".',
  },
  {
    icon: 'medkit-outline',
    title: 'Medicamentos',
    body:
      'En esta pestaña se indican los diferentes medicamentos que se quieran incluir en la infusión.\n\n' +
      'Pulsando sobre el icono + en la esquina superior derecha, puede añadir un principio activo a la infusión. Éste deberá incluir una dosis diaria.\n\n' +
      'Para modificar la dosis de un medicamento, pulse sobre su nombre.\n\n' +
      'Para borrarlo, arrastre su nombre hacia la izquierda para que aparezca la opción de borrado.',
  },
  {
    icon: 'calculator-outline',
    title: 'Cálculo',
    body:
      'Esta pestaña muestra los cálculos realizados. Indica la duración de la infusión, el volumen de la medicación, el volumen del diluyente que hay que añadir y el número de ampollas necesarias para cada principio activo.\n\n' +
      'En caso de no haber suficiente medicación en el almacén, se indicará con un aviso. Se podrá ajustar la duración de la infusión a la medicación existente, con lo que se disminuirá el tiempo de infusión deseado.\n\n' +
      'Los errores en el cálculo se indicarán en rojo.',
  },
  {
    icon: 'archive-outline',
    title: 'Existencias / Almacén',
    body:
      'El almacén contiene las existencias de medicación. En él se puede especificar la cantidad exacta de presentaciones disponibles de cada principio activo.\n\n' +
      'La aplicación ajustará el cálculo de la medicación según las existencias, intentando utilizar el máximo de productos de forma completa. En caso de necesitar solo una parte de una presentación, utilizará la más pequeña disponible.',
  },
];

export function AyudaScreen() {
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name={s.icon} size={18} color={colors.headerText} />
            <Text style={styles.cardTitle}>{s.title}</Text>
          </View>
          <Text style={styles.cardBody}>{s.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const colors = {
  background: '#f0f0f0',
  card: '#fff',
  border: '#e0e0e0',
  headerBg: '#f7f7f7',
  headerText: '#555',
  text: '#222',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 12, gap: 12 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.headerText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
    padding: 14,
  },
});
