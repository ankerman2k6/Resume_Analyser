import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import {
  BackdropFilter,
  Canvas,
  Group,
  ImageFilter,
  LinearGradient,
  Path,
  Rect,
  RoundedRect,
  Skia,
  Text as SkiaText,
  rect,
  rrect,
  useFont,
  vec,
} from '@shopify/react-native-skia';
import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  ReduceMotion,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { RegistrationRole } from './RoleSegmentedControl';

type Props = {
  disabled?: boolean;
  onChange: (role: RegistrationRole) => void;
  style?: StyleProp<ViewStyle>;
  value: RegistrationRole;
};

const FIGMA = {
  frameWidth: 850,
  frameHeight: 101,
  indicatorCandidateX: 10,
  indicatorRecruiterX: 410,
  indicatorY: 11,
  indicatorWidth: 425,
  indicatorHeight: 80,
} as const;

const SPRING = {
  damping: 17.14,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
  stiffness: 261.2,
} as const;

const CONTROL_HEIGHT = 58;

const CANDIDATE_ICON = Skia.Path.MakeFromSVGString(
  'M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L21 10v7h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 16.09l-5 2.73-5-2.73v-3.82L12 15l5-2.73v3.82z',
);
const RECRUITER_ICON = Skia.Path.MakeFromSVGString(
  'M20 6h-4V4c0-1.11-.89-2-2-2h-4C8.89 2 8 2.89 8 4v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2zm6 13H4v-5h6v1h4v-1h6v5zm0-7H4V8h16v4z',
);

const GLASS_EFFECT = Skia.RuntimeEffect.Make(`
  uniform shader image;
  uniform float2 origin;
  uniform float2 size;
  uniform float radius;
  uniform float refraction;
  uniform float dispersion;

  float roundedRectSdf(float2 p, float2 halfSize, float r) {
    float2 q = abs(p - halfSize) - (halfSize - float2(r));
    return length(max(q, float2(0.0))) + min(max(q.x, q.y), 0.0) - r;
  }

  half4 main(float2 xy) {
    float2 local = xy - origin;
    float2 halfSize = size * 0.5;
    float sdf = roundedRectSdf(local, halfSize, radius);
    float edgeDistance = max(-sdf, 0.0);
    float edge = 1.0 - smoothstep(1.0, radius * 0.76, edgeDistance);
    float2 direction = normalize(local - halfSize + float2(0.001));
    float bend = refraction * edge * edge;
    float2 samplePoint = xy - direction * bend;
    float split = dispersion * edge * edge;

    half4 center = image.eval(samplePoint);
    half red = image.eval(samplePoint + direction * split).r;
    half blue = image.eval(samplePoint - direction * split).b;
    half4 color = half4(red, center.g, blue, center.a);

    float2 normal = normalize((local - halfSize) / max(halfSize, float2(1.0)));
    float upperLeft = max(dot(normal, normalize(float2(-1.0, -1.0))), 0.0);
    color.rgb += half3(upperLeft * edge * 0.24);
    color.rgb = mix(color.rgb, half3(1.0), 0.02);
    return color;
  }
`);

export function RoleSegmentedControl({
  disabled = false,
  onChange,
  style,
  value,
}: Props) {
  const [width, setWidth] = useState(0);
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const reduceMotion = useReducedMotion();
  const indicatorX = useSharedValue(0);
  const font = useFont(Inter_600SemiBold, 14);

  const scaleX = width / FIGMA.frameWidth;
  const scaleY = CONTROL_HEIGHT / FIGMA.frameHeight;
  const baseX = FIGMA.indicatorCandidateX * scaleX;
  const recruiterX = FIGMA.indicatorRecruiterX * scaleX;
  const indicatorY = FIGMA.indicatorY * scaleY;
  const indicatorWidth = FIGMA.indicatorWidth * scaleX;
  const indicatorHeight = FIGMA.indicatorHeight * scaleY;
  const indicatorRadius = indicatorHeight / 2;

  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency,
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (width <= 0) return;
    const destination = value === 'candidate' ? 0 : recruiterX - baseX;
    indicatorX.value = reduceMotion
      ? destination
      : withSpring(destination, {
          ...SPRING,
          reduceMotion: ReduceMotion.System,
        });
  }, [baseX, indicatorX, recruiterX, reduceMotion, value, width]);

  const transform = useDerivedValue(() => [{ translateX: indicatorX.value }]);
  const clip = rrect(
    rect(baseX, indicatorY, indicatorWidth, indicatorHeight),
    indicatorRadius,
    indicatorRadius,
  );

  const glassFilter = useMemo(() => {
    if (!GLASS_EFFECT || indicatorWidth <= 0 || reduceTransparency) return null;
    const builder = Skia.RuntimeShaderBuilder(GLASS_EFFECT);
    builder.setUniform('origin', [baseX, indicatorY]);
    builder.setUniform('size', [indicatorWidth, indicatorHeight]);
    builder.setUniform('radius', [indicatorRadius]);
    // Figma's 80/50 are semantic controls. These are tuned sampling distances.
    builder.setUniform('refraction', [value === 'candidate' ? 6.4 : 4.2]);
    builder.setUniform('dispersion', [1.25]);
    return Skia.ImageFilter.MakeRuntimeShader(builder, 'image', null);
  }, [baseX, indicatorHeight, indicatorRadius, indicatorWidth, indicatorY, reduceTransparency, value]);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth !== width) setWidth(nextWidth);
  };

  const candidateSelected = value === 'candidate';

  return (
    <View
      accessibilityRole="radiogroup"
      onLayout={onLayout}
      style={[styles.container, style]}
    >
      {width > 0 ? (
        <Canvas pointerEvents="none" style={StyleSheet.absoluteFill}>
          <RoundedRect
            color="rgba(255,255,255,0.02)"
            height={CONTROL_HEIGHT}
            r={CONTROL_HEIGHT / 2}
            width={width}
            x={0}
            y={0}
          />
          <RoundedRect
            height={CONTROL_HEIGHT - 1}
            r={(CONTROL_HEIGHT - 1) / 2}
            style="stroke"
            strokeWidth={1}
            width={width - 1}
            x={0.5}
            y={0.5}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.52)', 'rgba(143,180,255,0.16)', 'rgba(255,255,255,0.08)']}
              end={vec(width, CONTROL_HEIGHT)}
              start={vec(0, 0)}
            />
          </RoundedRect>

          {font ? (
            <RoleVisual
              centerX={width * 0.25}
              font={font}
              icon={CANDIDATE_ICON}
              label="Ứng viên"
              selected={candidateSelected}
            />
          ) : null}
          {font ? (
            <RoleVisual
              centerX={width * 0.75}
              font={font}
              icon={RECRUITER_ICON}
              label="Nhà tuyển dụng"
              selected={!candidateSelected}
            />
          ) : null}

          <Group clip={clip} transform={transform}>
            {glassFilter ? (
              <BackdropFilter filter={<ImageFilter filter={glassFilter} />} />
            ) : null}
            <RoundedRect
              color={reduceTransparency ? 'rgba(8,30,74,0.92)' : 'rgba(255,255,255,0.10)'}
              height={indicatorHeight}
              r={indicatorRadius}
              width={indicatorWidth}
              x={baseX}
              y={indicatorY}
            />
            <RoundedRect
              height={indicatorHeight - 1}
              r={indicatorRadius - 0.5}
              style="stroke"
              strokeWidth={1}
              width={indicatorWidth - 1}
              x={baseX + 0.5}
              y={indicatorY + 0.5}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.62)', 'rgba(143,180,255,0.10)', 'rgba(255,255,255,0.12)']}
                end={vec(baseX + indicatorWidth, indicatorY + indicatorHeight)}
                start={vec(baseX, indicatorY)}
              />
            </RoundedRect>
            <Rect
              color="rgba(255,255,255,0.30)"
              height={1}
              width={Math.max(0, indicatorWidth - 38)}
              x={baseX + 19}
              y={indicatorY + 1}
            />
          </Group>
        </Canvas>
      ) : null}

      <RolePressable
        disabled={disabled}
        label="Ứng viên"
        onPress={() => onChange('candidate')}
        selected={candidateSelected}
      />
      <RolePressable
        disabled={disabled}
        label="Nhà tuyển dụng"
        onPress={() => onChange('recruiter')}
        selected={!candidateSelected}
      />
    </View>
  );
}

function RoleVisual({
  centerX,
  font,
  icon,
  label,
  selected,
}: {
  centerX: number;
  font: NonNullable<ReturnType<typeof useFont>>;
  icon: ReturnType<typeof Skia.Path.MakeFromSVGString>;
  label: string;
  selected: boolean;
}) {
  const labelWidth = font.measureText(label).width;
  const iconSize = 21;
  const gap = 8;
  const contentWidth = iconSize + gap + labelWidth;
  const startX = centerX - contentWidth / 2;
  const labelColor = selected ? '#FFFFFF' : 'rgba(220,233,252,0.72)';
  const iconColor = selected ? '#8FD9FF' : 'rgba(200,222,255,0.82)';

  return (
    <Group>
      {icon ? (
        <Group transform={[{ translateX: startX }, { translateY: 18.5 }, { scale: iconSize / 24 }]}>
          <Path color={iconColor} path={icon} />
        </Group>
      ) : null}
      <SkiaText
        color={labelColor}
        font={font}
        text={label}
        x={startX + iconSize + gap}
        y={36.5}
      />
    </Group>
  );
}

function RolePressable({
  disabled,
  label,
  onPress,
  selected,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={`Đăng ký với vai trò ${label}`}
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: CONTROL_HEIGHT,
    marginTop: 9,
    overflow: 'hidden',
  },
  option: { flex: 1, height: CONTROL_HEIGHT },
  pressed: { opacity: 0.78 },
});
