import { StyleSheet, Text, View } from 'react-native';
import { fontFamilies } from '../../../theme';
import { WELCOME_COLORS } from './welcome.constants';

type Props = {
  inverse?: boolean;
};

export function KonekLogo({ inverse = false }: Props) {
  const color = inverse ? WELCOME_COLORS.white : WELCOME_COLORS.navy;

  return (
    <View accessibilityLabel="KONEK" style={styles.container}>
      <View aria-hidden style={styles.mark}>
        <View style={[styles.markStem, { backgroundColor: color }]} />
        <View style={[styles.markArm, styles.markArmTop, { backgroundColor: color }]} />
        <View style={[styles.markArm, styles.markArmBottom, { backgroundColor: color }]} />
      </View>
      <Text style={[styles.wordmark, { color }]}>KONEK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  mark: {
    height: 30,
    position: 'relative',
    width: 28,
  },
  markStem: {
    borderRadius: 3,
    height: 28,
    left: 1,
    position: 'absolute',
    top: 1,
    width: 8,
  },
  markArm: {
    borderRadius: 3,
    height: 8,
    left: 8,
    position: 'absolute',
    width: 21,
  },
  markArmTop: {
    top: 5,
    transform: [{ rotate: '-42deg' }],
  },
  markArmBottom: {
    bottom: 5,
    transform: [{ rotate: '42deg' }],
  },
  wordmark: {
    fontFamily: fontFamilies.bold,
    fontSize: 25,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
});
