import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  type ImageSourcePropType,
  PanResponder,
  Platform,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { fontFamilies } from '../../../theme';
import { ONBOARDING_SLIDES, WELCOME_COLORS } from './welcome.constants';

const TRANSITION_MS = 700;
const AUTO_ADVANCE_MS = 5000;

const ASSETS = {
  ai: require('../../../assets/images/welcome/ai-badge.png') as ImageSourcePropType,
  briefcase: require('../../../assets/images/welcome/briefcase.png') as ImageSourcePropType,
  cv: require('../../../assets/images/welcome/cv-stack.png') as ImageSourcePropType,
  magnifier: require('../../../assets/images/welcome/magnifier.png') as ImageSourcePropType,
  people: require('../../../assets/images/welcome/people-icon.png') as ImageSourcePropType,
  stats: require('../../../assets/images/welcome/stats-icon.png') as ImageSourcePropType,
};

type Props = {
  height: number;
  paused?: boolean;
  reduceMotion: boolean;
  width: number;
  onSceneChange: (index: number) => void;
};

type FloatingAssetProps = {
  aspectRatio: number;
  duration: number;
  floatX?: number;
  floatY?: number;
  phase?: number;
  paused: boolean;
  reduceMotion: boolean;
  source: ImageSourcePropType;
  style: StyleProp<ViewStyle>;
  width: number;
};

type SceneLayerProps = {
  height: number;
  paused: boolean;
  reduceMotion: boolean;
  reveal: Animated.Value;
  width: number;
};

function useLoopMotion(reduceMotion: boolean, duration: number, phase = 0, paused = false) {
  const value = useRef(new Animated.Value(phase)).current;
  const hasStarted = useRef(false);

  useEffect(() => {
    value.stopAnimation();
    if (reduceMotion) {
      value.setValue(0.5);
      return;
    }
    if (paused) return;

    if (!hasStarted.current) {
      value.setValue(phase);
      hasStarted.current = true;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          duration: Math.max(500, duration * (1 - phase)),
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(value, {
          duration,
          easing: Easing.inOut(Easing.sin),
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(value, {
          duration: Math.max(500, duration * phase),
          easing: Easing.inOut(Easing.sin),
          toValue: phase,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, paused, phase, reduceMotion, value]);

  return value;
}

function FloatingAsset({
  aspectRatio,
  duration,
  floatX = 0,
  floatY = 7,
  phase = 0,
  paused,
  reduceMotion,
  source,
  style,
  width,
}: FloatingAssetProps) {
  const motion = useLoopMotion(reduceMotion, duration, phase, paused);
  const translateX = motion.interpolate({ inputRange: [0, 1], outputRange: [-floatX, floatX] });
  const translateY = motion.interpolate({ inputRange: [0, 1], outputRange: [-floatY, floatY] });
  const rotate = motion.interpolate({ inputRange: [0, 1], outputRange: ['-1.2deg', '1.2deg'] });

  return (
    <Animated.View
      style={[
        styles.floatingAsset,
        style,
        { aspectRatio, width, transform: [{ translateX }, { translateY }, { rotate }] },
      ]}
    >
      <Image resizeMode="contain" source={source} style={styles.assetImage} />
    </Animated.View>
  );
}

function AnalysisLayers({ height, paused, reduceMotion, width }: SceneLayerProps) {
  const pulse = useLoopMotion(reduceMotion, 2100, 0.15, paused);

  return (
    <View style={StyleSheet.absoluteFill}>
      <FloatingAsset
        aspectRatio={358 / 295}
        duration={3100}
        floatX={3}
        floatY={5}
        phase={0.2}
        paused={paused}
        reduceMotion={reduceMotion}
        source={ASSETS.ai}
        style={{ right: width * 0.08, top: height * 0.015 }}
        width={width * 0.235}
      />
      <Animated.View
        style={[
          styles.aiPulse,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.42] }),
            right: width * 0.075,
            top: height * 0.01,
            transform: [
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] }) },
            ],
            width: width * 0.24,
          },
        ]}
      />
      <FloatingAsset
        aspectRatio={465 / 402}
        duration={2600}
        floatX={8}
        floatY={3}
        phase={0.45}
        paused={paused}
        reduceMotion={reduceMotion}
        source={ASSETS.magnifier}
        style={{ right: 0, top: height * 0.36 }}
        width={width * 0.38}
      />
      <FloatingAsset
        aspectRatio={350 / 428}
        duration={3900}
        floatX={3}
        floatY={7}
        phase={0.65}
        paused={paused}
        reduceMotion={reduceMotion}
        source={ASSETS.briefcase}
        style={{ bottom: height * 0.005, left: width * 0.04 }}
        width={width * 0.27}
      />
      <FloatingAsset
        aspectRatio={328 / 315}
        duration={3400}
        floatX={3}
        floatY={8}
        phase={0.35}
        paused={paused}
        reduceMotion={reduceMotion}
        source={ASSETS.stats}
        style={{ left: 0, top: height * 0.35 }}
        width={width * 0.16}
      />
      <FloatingAsset
        aspectRatio={310 / 300}
        duration={4200}
        floatX={4}
        floatY={6}
        phase={0.8}
        paused={paused}
        reduceMotion={reduceMotion}
        source={ASSETS.people}
        style={{ right: 0, top: height * 0.36 }}
        width={width * 0.155}
      />
    </View>
  );
}

function ConnectionLine({
  angle,
  end,
  left,
  reveal,
  start,
  top,
  width,
}: {
  angle: string;
  end: number;
  left: number;
  reveal: Animated.Value;
  start: number;
  top: number;
  width: number;
}) {
  const progress = revealFor(reveal, start, end);
  return (
    <Animated.View
      style={[
        styles.connectionLine,
        {
          left,
          opacity: progress,
          top,
          transform: [{ rotate: angle }, { scaleX: progress }],
          transformOrigin: 'left center',
          width,
        },
      ]}
    >
      <View style={styles.connectionDot} />
    </Animated.View>
  );
}

function revealFor(reveal: Animated.Value, start: number, end: number) {
  return reveal.interpolate({
    extrapolate: 'clamp',
    inputRange: [start, end],
    outputRange: [0, 1],
  });
}

function JobMatchCard({
  active,
  index,
  reveal,
  top,
  width,
}: {
  active?: boolean;
  index: number;
  reveal: Animated.Value;
  top: number;
  width: number;
}) {
  const progress = revealFor(reveal, 0.12 + index * 0.13, 0.48 + index * 0.13);
  const indicatorProgress = revealFor(reveal, 0.36 + index * 0.12, 0.62 + index * 0.12);
  return (
    <Animated.View
      style={[
        styles.matchCard,
        active && styles.matchCardActive,
        {
          opacity: progress,
          right: 0,
          top,
          transform: [
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) },
          ],
          width,
        },
      ]}
    >
      <View style={[styles.cardIcon, active && styles.cardIconActive]}>
        <MaterialIcons
          color={active ? WELCOME_COLORS.white : '#8DBDFF'}
          name="work-outline"
          size={18}
        />
      </View>
      <View style={styles.cardLines}>
        <View style={[styles.cardLine, styles.cardLineLong]} />
        <View style={[styles.cardLine, styles.cardLineShort]} />
      </View>
      <Animated.View
        style={{
          opacity: indicatorProgress,
          transform: [
            {
              scale: indicatorProgress.interpolate({
                inputRange: [0, 0.72, 1],
                outputRange: [0.72, 1.08, 1],
              }),
            },
          ],
        }}
      >
        <MaterialIcons
          color={active ? '#7FD4FF' : '#6C92CA'}
          name={active ? 'check-circle' : 'radio-button-unchecked'}
          size={22}
        />
      </Animated.View>
    </Animated.View>
  );
}

function MatchingLayers({ height, reveal, width }: SceneLayerProps) {
  const lineStart = width * 0.46;
  const lineWidth = width * 0.2;
  return (
    <View style={StyleSheet.absoluteFill}>
      <ConnectionLine angle="-23deg" end={0.38} left={lineStart} reveal={reveal} start={0.08} top={height * 0.38} width={lineWidth} />
      <ConnectionLine angle="0deg" end={0.47} left={lineStart} reveal={reveal} start={0.17} top={height * 0.51} width={lineWidth} />
      <ConnectionLine angle="23deg" end={0.56} left={lineStart} reveal={reveal} start={0.26} top={height * 0.64} width={lineWidth} />
      <Animated.View
        style={[
          styles.hubGlow,
          {
            left: lineStart - 6,
            opacity: revealFor(reveal, 0.04, 0.28),
            top: height * 0.49,
            transform: [{ scale: revealFor(reveal, 0.04, 0.28) }],
          },
        ]}
      />
      <JobMatchCard active index={0} reveal={reveal} top={height * 0.21} width={width * 0.46} />
      <JobMatchCard index={1} reveal={reveal} top={height * 0.41} width={width * 0.46} />
      <JobMatchCard index={2} reveal={reveal} top={height * 0.61} width={width * 0.46} />
    </View>
  );
}

function CandidateCard({
  index,
  reveal,
  top,
  width,
}: {
  index: number;
  reveal: Animated.Value;
  top: number;
  width: number;
}) {
  const progress = revealFor(reveal, 0.12 + index * 0.16, 0.47 + index * 0.16);
  const cardScale = reveal.interpolate({
    extrapolate: 'clamp',
    inputRange: [0.12 + index * 0.16, 0.4 + index * 0.16, 0.53 + index * 0.16],
    outputRange: [0.88, 1.035, 1],
  });
  const indicatorProgress = revealFor(reveal, 0.38 + index * 0.12, 0.64 + index * 0.12);
  return (
    <Animated.View
      style={[
        styles.candidateCard,
        {
          opacity: progress,
          right: 0,
          top,
          transform: [
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
            { scale: cardScale },
          ],
          width,
        },
      ]}
    >
      <View style={[styles.candidateAvatar, index === 1 && styles.candidateAvatarAlt]}>
        <MaterialIcons color={WELCOME_COLORS.white} name="person" size={24} />
      </View>
      <View style={styles.candidateLines}>
        <View style={[styles.cardLine, styles.candidateLineLong]} />
        <View style={[styles.cardLine, styles.candidateLineShort]} />
      </View>
      <Animated.View
        style={[
          styles.checkGlow,
          {
            opacity: indicatorProgress,
            transform: [
              {
                scale: indicatorProgress.interpolate({
                  inputRange: [0, 0.72, 1],
                  outputRange: [0.68, 1.12, 1],
                }),
              },
            ],
          },
        ]}
      >
        <MaterialIcons color={WELCOME_COLORS.white} name="check" size={15} />
      </Animated.View>
    </Animated.View>
  );
}

function RecruitmentLayers({ height, reveal, width }: SceneLayerProps) {
  const lineStart = width * 0.46;
  const lineWidth = width * 0.2;
  return (
    <View style={StyleSheet.absoluteFill}>
      <ConnectionLine angle="-25deg" end={0.4} left={lineStart} reveal={reveal} start={0.1} top={height * 0.39} width={lineWidth} />
      <ConnectionLine angle="0deg" end={0.5} left={lineStart} reveal={reveal} start={0.2} top={height * 0.52} width={lineWidth} />
      <ConnectionLine angle="25deg" end={0.6} left={lineStart} reveal={reveal} start={0.3} top={height * 0.65} width={lineWidth} />
      <Animated.View
        style={[
          styles.hubGlow,
          {
            left: lineStart - 6,
            opacity: revealFor(reveal, 0.06, 0.3),
            top: height * 0.5,
            transform: [{ scale: revealFor(reveal, 0.06, 0.3) }],
          },
        ]}
      />
      <CandidateCard index={0} reveal={reveal} top={height * 0.22} width={width * 0.44} />
      <CandidateCard index={1} reveal={reveal} top={height * 0.43} width={width * 0.44} />
      <CandidateCard index={2} reveal={reveal} top={height * 0.64} width={width * 0.44} />
    </View>
  );
}

function SceneLayers({
  height,
  paused,
  reduceMotion,
  reveal,
  scene,
  width,
}: SceneLayerProps & { scene: number }) {
  if (scene === 0) {
    return <AnalysisLayers height={height} paused={paused} reduceMotion={reduceMotion} reveal={reveal} width={width} />;
  }
  if (scene === 1) {
    return <MatchingLayers height={height} paused={paused} reduceMotion={reduceMotion} reveal={reveal} width={width} />;
  }
  return <RecruitmentLayers height={height} paused={paused} reduceMotion={reduceMotion} reveal={reveal} width={width} />;
}

export function WelcomeSceneController({
  height,
  onSceneChange,
  paused = false,
  reduceMotion,
  width,
}: Props) {
  const transition = useRef(new Animated.Value(0)).current;
  const fullyRevealed = useRef(new Animated.Value(1)).current;
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSceneRef = useRef(0);
  const pausedRef = useRef(paused);
  const transitioningRef = useRef(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [targetScene, setTargetScene] = useState<number | null>(null);
  const cvFloat = useLoopMotion(reduceMotion, 3200, 0.25, paused);
  const stageWidth = Math.min(width, 390);
  const compactTypography = height <= 220;
  const titleFontSize = compactTypography
    ? Math.min(30, stageWidth * 0.11)
    : Math.min(height < 300 ? 52 : 59, stageWidth * 0.18);
  const titleLineHeight = Math.round(titleFontSize * 1.08);
  const descriptionFontSize = compactTypography ? 13 : 15;
  const descriptionLineHeight = compactTypography ? 18 : 22;
  const copyGap = compactTypography ? 7 : 9;
  const copyViewportHeight =
    titleLineHeight * 3 + descriptionLineHeight * 3 + copyGap;
  const copyMarginTop = compactTypography ? 8 : 16;
  pausedRef.current = paused;

  const clearAutoTimer = useCallback(() => {
    if (autoTimer.current) {
      clearTimeout(autoTimer.current);
      autoTimer.current = null;
    }
  }, []);

  const goToScene = useCallback(
    (nextScene: number) => {
      const normalized = (nextScene + ONBOARDING_SLIDES.length) % ONBOARDING_SLIDES.length;
      if (transitioningRef.current || normalized === currentSceneRef.current) return;
      clearAutoTimer();

      if (reduceMotion) {
        currentSceneRef.current = normalized;
        setCurrentScene(normalized);
        onSceneChange(normalized);
        return;
      }

      transitioningRef.current = true;
      setTargetScene(normalized);
    },
    [clearAutoTimer, onSceneChange, reduceMotion],
  );

  useLayoutEffect(() => {
    if (targetScene === null) {
      // Reset only after React has committed the new current scene. Resetting in
      // the timing callback briefly reapplies the old scene's transform for one frame.
      transition.setValue(0);
      return;
    }

    transition.setValue(0);
    const animation = Animated.timing(transition, {
      duration: TRANSITION_MS,
      easing: Easing.bezier(0.22, 0.7, 0.2, 1),
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start(({ finished }) => {
      if (!finished) {
        transitioningRef.current = false;
        return;
      }
      currentSceneRef.current = targetScene;
      setCurrentScene(targetScene);
      setTargetScene(null);
      transitioningRef.current = false;
      onSceneChange(targetScene);
    });

    return () => animation.stop();
  }, [onSceneChange, targetScene, transition]);

  const resetAutoTimer = useCallback(() => {
    clearAutoTimer();
    if (paused || reduceMotion || transitioningRef.current) return;
    autoTimer.current = setTimeout(() => {
      if (!pausedRef.current) goToScene(currentSceneRef.current + 1);
    }, AUTO_ADVANCE_MS);
  }, [clearAutoTimer, goToScene, paused, reduceMotion]);

  useEffect(() => {
    if (targetScene === null) resetAutoTimer();
    return clearAutoTimer;
  }, [clearAutoTimer, currentScene, resetAutoTimer, targetScene]);

  useEffect(
    () => () => {
      clearAutoTimer();
      transition.stopAnimation();
    },
    [clearAutoTimer, transition],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: clearAutoTimer,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx <= -44) goToScene(currentSceneRef.current + 1);
          else if (gesture.dx >= 44) goToScene(currentSceneRef.current - 1);
          else resetAutoTimer();
        },
        onPanResponderTerminate: resetAutoTimer,
      }),
    [clearAutoTimer, goToScene, resetAutoTimer],
  );

  const currentConfig = currentScene === 0
    ? { rotate: '0deg', scale: 1, x: 0, y: 0 }
    : { rotate: '-5deg', scale: 0.86, x: -stageWidth * 0.155, y: 8 };
  const destination = targetScene ?? currentScene;
  const targetConfig = destination === 0
    ? { rotate: '0deg', scale: 1, x: 0, y: 0 }
    : { rotate: '-5deg', scale: 0.86, x: -stageWidth * 0.155, y: 8 };
  const cvTranslateY = Animated.add(
    transition.interpolate({ inputRange: [0, 1], outputRange: [currentConfig.y, targetConfig.y] }),
    cvFloat.interpolate({ inputRange: [0, 1], outputRange: [-4, 5] }),
  );
  const isCardMorph = currentScene === 1 && targetScene === 2;
  const outgoingStyle = targetScene === null
    ? styles.sceneVisible
    : {
        opacity: transition.interpolate({ inputRange: [0, 0.78], outputRange: [1, 0], extrapolate: 'clamp' as const }),
        transform: [
          {
            translateX: transition.interpolate({
              inputRange: [0, 1],
              outputRange: [0, isCardMorph ? -20 : -42],
            }),
          },
        ],
      };
  const incomingStyle = {
    opacity: transition.interpolate({ inputRange: [0.12, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [
      {
        translateX: transition.interpolate({
          inputRange: [0, 1],
          outputRange: [isCardMorph ? 20 : 46, 0],
        }),
      },
    ],
  };

  return (
    <View testID="welcome-story-controller" {...panResponder.panHandlers} style={styles.storyArea}>
      <View style={[styles.illustrationStage, { height, width: stageWidth }]}>
        <View pointerEvents="none" style={styles.platform}>
          <View style={styles.platformGlow} />
          <View style={styles.platformBase} />
          <View style={styles.platformRim} />
          <View style={styles.platformSurface} />
          <View style={styles.platformTopLight} />
        </View>
        <Animated.View
          pointerEvents="none"
          testID="welcome-shared-cv"
          style={[
            styles.sharedCv,
            {
              transform: [
                {
                  translateX: transition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [currentConfig.x, targetConfig.x],
                  }),
                },
                { translateY: cvTranslateY },
                {
                  scale: transition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [currentConfig.scale, targetConfig.scale],
                  }),
                },
                {
                  rotate: transition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [currentConfig.rotate, targetConfig.rotate],
                  }),
                },
              ],
              width: stageWidth * 0.62,
            },
          ]}
        >
          <Image resizeMode="contain" source={ASSETS.cv} style={styles.assetImage} />
        </Animated.View>

        <View pointerEvents="none" style={styles.sceneViewport}>
          <Animated.View
            testID={`welcome-scene-${currentScene + 1}`}
            style={[StyleSheet.absoluteFill, outgoingStyle]}
          >
            <SceneLayers
              height={height}
              paused={paused || targetScene !== null}
              reduceMotion={reduceMotion}
              reveal={fullyRevealed}
              scene={currentScene}
              width={stageWidth}
            />
          </Animated.View>

          {targetScene !== null ? (
            <Animated.View
              testID={`welcome-scene-${targetScene + 1}`}
              style={[StyleSheet.absoluteFill, incomingStyle]}
            >
              <SceneLayers
                height={height}
                paused
                reduceMotion={reduceMotion}
                reveal={transition}
                scene={targetScene}
                width={stageWidth}
              />
            </Animated.View>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.copyViewport,
          { height: copyViewportHeight, marginTop: copyMarginTop },
        ]}
      >
        <Animated.View style={[styles.copyLayer, outgoingStyle]}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { fontSize: titleFontSize, lineHeight: titleLineHeight }]}
          >
            {ONBOARDING_SLIDES[currentScene].title}
          </Text>
          <Text
            style={[
              styles.description,
              {
                fontSize: descriptionFontSize,
                lineHeight: descriptionLineHeight,
                marginTop: copyGap,
              },
            ]}
          >
            {ONBOARDING_SLIDES[currentScene].description}
          </Text>
        </Animated.View>

        {targetScene !== null ? (
          <Animated.View
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.copyLayer, incomingStyle]}
          >
            <Text
              accessibilityRole="header"
              style={[styles.title, { fontSize: titleFontSize, lineHeight: titleLineHeight }]}
            >
              {ONBOARDING_SLIDES[targetScene].title}
            </Text>
            <Text
              style={[
                styles.description,
                {
                  fontSize: descriptionFontSize,
                  lineHeight: descriptionLineHeight,
                  marginTop: copyGap,
                },
              ]}
            >
              {ONBOARDING_SLIDES[targetScene].description}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  storyArea: {
    alignItems: 'center',
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  illustrationStage: {
    alignSelf: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  platform: {
    bottom: 0,
    height: 52,
    left: '6%',
    position: 'absolute',
    right: '6%',
    zIndex: 0,
  },
  platformGlow: {
    backgroundColor: 'rgba(49, 197, 255, 0.16)',
    borderRadius: 999,
    bottom: 0,
    height: 18,
    left: '12%',
    position: 'absolute',
    right: '12%',
    shadowColor: '#35C7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.64,
    shadowRadius: 24,
  },
  platformBase: {
    backgroundColor: 'rgba(3, 18, 55, 0.96)',
    borderColor: 'rgba(37, 101, 195, 0.52)',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 4,
    height: 30,
    left: '3%',
    position: 'absolute',
    right: '3%',
    shadowColor: '#020A20',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.62,
    shadowRadius: 16,
    transform: [{ scaleY: 0.68 }],
  },
  platformRim: {
    backgroundColor: 'rgba(8, 39, 96, 0.94)',
    borderColor: 'rgba(75, 190, 255, 0.78)',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 14,
    height: 25,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: '#3FC2FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.54,
    shadowRadius: 12,
    transform: [{ scaleY: 0.58 }],
  },
  platformSurface: {
    backgroundColor: 'rgba(23, 67, 145, 0.68)',
    borderColor: 'rgba(147, 213, 255, 0.48)',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 20,
    height: 25,
    left: '4%',
    position: 'absolute',
    right: '4%',
    transform: [{ scaleY: 0.5 }],
  },
  platformTopLight: {
    backgroundColor: 'rgba(144, 218, 255, 0.24)',
    borderRadius: 999,
    bottom: 27,
    height: 7,
    left: '18%',
    position: 'absolute',
    right: '18%',
    shadowColor: '#79D7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 10,
  },
  sceneVisible: { opacity: 1, transform: [{ translateX: 0 }] },
  sceneViewport: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  floatingAsset: { position: 'absolute', zIndex: 3 },
  assetImage: { height: '100%', width: '100%' },
  sharedCv: {
    aspectRatio: 453 / 451,
    left: '19%',
    position: 'absolute',
    top: '15%',
    zIndex: 2,
  },
  aiPulse: {
    aspectRatio: 358 / 295,
    backgroundColor: '#35B7FF',
    borderRadius: 30,
    position: 'absolute',
    shadowColor: '#35B7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  connectionLine: {
    backgroundColor: '#56B6FF',
    borderRadius: 2,
    height: 2,
    position: 'absolute',
    shadowColor: '#56B6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 7,
    transformOrigin: 'left center',
    zIndex: 1,
  },
  connectionDot: {
    backgroundColor: WELCOME_COLORS.white,
    borderRadius: 5,
    height: 7,
    position: 'absolute',
    right: -3,
    top: -2.5,
    width: 7,
  },
  hubGlow: {
    backgroundColor: WELCOME_COLORS.white,
    borderColor: '#62C4FF',
    borderRadius: 7,
    borderWidth: 3,
    height: 14,
    position: 'absolute',
    shadowColor: '#3CA8FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    width: 14,
    zIndex: 4,
  },
  matchCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(66, 115, 182, 0.58)',
    borderColor: 'rgba(159, 208, 255, 0.36)',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 54,
    paddingHorizontal: 10,
    position: 'absolute',
    shadowColor: '#0D73E8',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    zIndex: 4,
  },
  matchCardActive: {
    backgroundColor: 'rgba(235, 247, 255, 0.96)',
    borderColor: 'rgba(116, 200, 255, 0.92)',
    shadowColor: '#42A5FF',
    shadowOpacity: 0.5,
    shadowRadius: 17,
  },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  cardIconActive: { backgroundColor: WELCOME_COLORS.blue },
  cardLines: { flex: 1 },
  cardLine: { backgroundColor: 'rgba(192, 222, 255, 0.72)', borderRadius: 99, height: 5 },
  cardLineLong: { marginBottom: 7, width: '88%' },
  cardLineShort: { width: '58%' },
  candidateCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(55, 105, 176, 0.7)',
    borderColor: 'rgba(150, 209, 255, 0.48)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    height: 57,
    paddingHorizontal: 9,
    position: 'absolute',
    shadowColor: '#0B70DB',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.26,
    shadowRadius: 12,
    zIndex: 4,
  },
  candidateAvatar: {
    alignItems: 'center',
    backgroundColor: '#337FDA',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 19,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  candidateAvatarAlt: { backgroundColor: '#2468BC' },
  candidateLines: { flex: 1 },
  candidateLineLong: { marginBottom: 7, width: '88%' },
  candidateLineShort: { width: '62%' },
  checkGlow: {
    alignItems: 'center',
    backgroundColor: WELCOME_COLORS.blue,
    borderColor: '#8CD8FF',
    borderRadius: 13,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    shadowColor: '#52B6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 7,
    width: 26,
  },
  copyViewport: {
    alignSelf: 'center',
    maxWidth: 440,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  copyLayer: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  title: {
    color: WELCOME_COLORS.white,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.7,
    maxWidth: 390,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontFamily: fontFamilies.regular,
    maxWidth: 390,
  },
});
