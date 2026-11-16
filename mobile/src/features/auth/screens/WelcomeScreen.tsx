import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KonekLogo } from '../components/KonekLogo';
import { WelcomeActionModal } from '../components/WelcomeActionModal';
import { WelcomeSceneController } from '../components/WelcomeSceneController';
import {
  ONBOARDING_SLIDES,
  WELCOME_BACKGROUND,
  WELCOME_COLORS,
} from '../components/welcome.constants';
import { fontFamilies } from '../../../theme';
import type { RootStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const { height, width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const compact = height < 720;
  const stageHeight = compact
    ? Math.min(218, Math.max(190, height * 0.31))
    : Math.min(306, Math.max(238, height * 0.36));
  const contentWidth = Math.min(width - 48, 440);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  return (
    <ImageBackground
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
      source={require('../../../assets/images/welcome/welcome-background.jpg')}
      style={styles.background}
    >
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.backgroundTint} />
      <View pointerEvents="none" style={styles.topRightGlow} />
      <View pointerEvents="none" style={styles.bottomShapeWash} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={[styles.header, compact && styles.headerCompact]}>
          <KonekLogo inverse />
        </View>

        <View style={[styles.welcomeIntro, compact && styles.welcomeIntroCompact]}>
          <Text style={[styles.welcomeTitle, compact && styles.welcomeTitleCompact]}>
            Chào mừng đến với KONEK
          </Text>
          <Text style={[styles.welcomeSubtitle, compact && styles.welcomeSubtitleCompact]}>
            Nền tảng kết nối ứng viên và nhà tuyển dụng thông minh.
          </Text>
        </View>

        <View style={[styles.storyContainer, { maxWidth: contentWidth }]}>
          <WelcomeSceneController
            height={stageHeight}
            onSceneChange={setActiveIndex}
            paused={modalVisible || !isFocused}
            reduceMotion={reduceMotion}
            width={contentWidth}
          />
        </View>

        <View style={[styles.bottomControls, compact && styles.bottomControlsCompact]}>
          <View
            accessibilityLabel={`Slide ${activeIndex + 1} of ${ONBOARDING_SLIDES.length}`}
            style={styles.pagination}
          >
            {ONBOARDING_SLIDES.map((slide, index) => (
              <View
                key={slide.id}
                style={[styles.dot, index === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
          <Pressable
            accessibilityHint="Mở các lựa chọn đăng ký, đăng nhập hoặc trải nghiệm ứng dụng"
            accessibilityRole="button"
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [styles.getStartedButton, pressed && styles.buttonPressed]}
          >
            <View pointerEvents="none" style={styles.buttonHighlight} />
            <Text style={styles.getStartedText}>Get Started</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <WelcomeActionModal
        onClose={() => setModalVisible(false)}
        onGuest={() => navigation.navigate('CandidateTabs')}
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
        reduceMotion={reduceMotion}
        visible={modalVisible}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: WELCOME_BACKGROUND.base,
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.66,
  },
  backgroundTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 12, 40, 0.5)',
  },
  topRightGlow: {
    backgroundColor: 'rgba(143, 180, 255, 0.14)',
    borderBottomLeftRadius: 220,
    height: 176,
    position: 'absolute',
    right: 0,
    shadowColor: WELCOME_BACKGROUND.highlight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 38,
    top: 0,
    width: 228,
  },
  bottomShapeWash: {
    backgroundColor: 'rgba(23, 62, 138, 0.12)',
    borderTopRightRadius: 220,
    bottom: 0,
    height: 154,
    left: 0,
    position: 'absolute',
    width: '72%',
  },
  safeArea: { flex: 1 },
  header: {
    paddingBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  headerCompact: {
    paddingBottom: 2,
    paddingTop: 8,
  },
  welcomeIntro: {
    alignSelf: 'center',
    maxWidth: 440,
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 10,
    width: '100%',
  },
  welcomeIntroCompact: {
    paddingBottom: 10,
    paddingTop: 8,
  },
  welcomeTitle: {
    color: WELCOME_COLORS.white,
    fontFamily: fontFamilies.bold,
    fontSize: 24,
    letterSpacing: -0.45,
    lineHeight: 30,
  },
  welcomeTitleCompact: {
    fontSize: 21,
    lineHeight: 27,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
    maxWidth: 390,
  },
  welcomeSubtitleCompact: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  storyContainer: {
    alignSelf: 'center',
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 0,
    width: '100%',
  },
  bottomControls: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: 440,
    paddingBottom: 12,
    paddingHorizontal: 24,
    paddingTop: 6,
    width: '100%',
  },
  bottomControlsCompact: {
    gap: 12,
    paddingBottom: 6,
    paddingTop: 2,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: 'rgba(142, 190, 255, 0.42)',
    borderRadius: 99,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: WELCOME_COLORS.white,
    shadowColor: WELCOME_COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 5,
    width: 20,
  },
  getStartedButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#0868F5',
    borderColor: 'rgba(145, 214, 255, 0.82)',
    borderRadius: 27,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#168CFF',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    width: '100%',
    elevation: 8,
  },
  buttonHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 27,
    height: '52%',
    left: 1,
    position: 'absolute',
    right: 1,
    top: 1,
  },
  buttonPressed: { opacity: 0.82 },
  getStartedText: {
    color: WELCOME_COLORS.white,
    fontFamily: fontFamilies.semibold,
    fontSize: 17,
    lineHeight: 24,
  },
});
