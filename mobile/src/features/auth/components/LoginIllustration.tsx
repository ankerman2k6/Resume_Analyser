import { Image, StyleSheet, View } from 'react-native';

type Props = {
  height: number;
};

export function LoginIllustration({ height }: Props) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.stage, { height }]}>
      <View style={styles.platformGlow} />
      <View style={styles.platformBase} />
      <View style={styles.platformRim} />

      <Image
        resizeMode="contain"
        source={require('../../../assets/images/welcome/cv-stack.png')}
        style={styles.cv}
      />
      <Image
        resizeMode="contain"
        source={require('../../../assets/images/welcome/ai-badge.png')}
        style={styles.ai}
      />
      <Image
        resizeMode="contain"
        source={require('../../../assets/images/welcome/stats-icon.png')}
        style={styles.stats}
      />
      <Image
        resizeMode="contain"
        source={require('../../../assets/images/welcome/people-icon.png')}
        style={styles.people}
      />
      <Image
        resizeMode="contain"
        source={require('../../../assets/images/welcome/briefcase.png')}
        style={styles.briefcase}
      />
      <Image
        resizeMode="contain"
        source={require('../../../assets/images/welcome/magnifier.png')}
        style={styles.magnifier}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignSelf: 'center',
    maxWidth: 430,
    position: 'relative',
    width: '100%',
  },
  platformGlow: {
    backgroundColor: 'rgba(42, 198, 255, 0.18)',
    borderRadius: 999,
    bottom: 4,
    height: 18,
    left: '15%',
    position: 'absolute',
    right: '15%',
    shadowColor: '#35C7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 24,
  },
  platformBase: {
    backgroundColor: 'rgba(3, 18, 55, 0.96)',
    borderColor: 'rgba(52, 143, 232, 0.42)',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 8,
    height: 27,
    left: '8%',
    position: 'absolute',
    right: '8%',
    transform: [{ scaleY: 0.58 }],
  },
  platformRim: {
    backgroundColor: 'rgba(18, 67, 145, 0.62)',
    borderColor: 'rgba(96, 204, 255, 0.72)',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 16,
    height: 25,
    left: '10%',
    position: 'absolute',
    right: '10%',
    shadowColor: '#49C7FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    transform: [{ scaleY: 0.48 }],
  },
  cv: {
    height: '78%',
    left: '20%',
    position: 'absolute',
    top: '3%',
    width: '60%',
  },
  ai: {
    height: '31%',
    position: 'absolute',
    right: '8%',
    top: 0,
    width: '25%',
  },
  stats: {
    height: '24%',
    left: '3%',
    position: 'absolute',
    top: '33%',
    width: '18%',
  },
  people: {
    height: '23%',
    position: 'absolute',
    right: '2%',
    top: '36%',
    width: '18%',
  },
  briefcase: {
    bottom: '2%',
    height: '39%',
    left: '12%',
    position: 'absolute',
    width: '29%',
  },
  magnifier: {
    bottom: '4%',
    height: '40%',
    position: 'absolute',
    right: '10%',
    width: '29%',
  },
});
