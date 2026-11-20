import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { fontFamilies } from '../../../theme';

export type RegistrationRole = 'candidate' | 'recruiter';

type Props = {
  disabled?: boolean;
  onChange: (role: RegistrationRole) => void;
  style?: StyleProp<ViewStyle>;
  value: RegistrationRole;
};

/** Web/unsupported fallback. Native platforms use the Skia implementation. */
export function RoleSegmentedControl({
  disabled = false,
  onChange,
  style,
  value,
}: Props) {
  const [width, setWidth] = useState(0);
  const progress = useRef(new Animated.Value(value === 'candidate' ? 0 : 1)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
      toValue: value === 'candidate' ? 0 : 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, value]);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth !== width) setWidth(nextWidth);
  };

  const travel = width * (400 / 850);

  return (
    <View
      accessibilityRole="radiogroup"
      onLayout={onLayout}
      style={[styles.container, style]}
    >
      {width > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              left: width * (10 / 850),
              width: width * (425 / 850),
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, travel],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
      <RoleOption
        disabled={disabled}
        icon="person-outline"
        label="Ứng viên"
        onPress={() => onChange('candidate')}
        selected={value === 'candidate'}
      />
      <RoleOption
        disabled={disabled}
        icon="briefcase-outline"
        label="Nhà tuyển dụng"
        onPress={() => onChange('recruiter')}
        selected={value === 'recruiter'}
      />
    </View>
  );
}

function RoleOption({
  disabled,
  icon,
  label,
  onPress,
  selected,
}: {
  disabled: boolean;
  icon: 'person-outline' | 'briefcase-outline';
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
    >
      <Ionicons
        color={selected ? '#8FD9FF' : 'rgba(200, 222, 255, 0.78)'}
        name={icon}
        size={22}
      />
      <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    borderTopColor: 'rgba(255, 255, 255, 0.38)',
    borderWidth: 1,
    flexDirection: 'row',
    height: 58,
    marginTop: 9,
    overflow: 'hidden',
  },
  indicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 999,
    borderTopColor: 'rgba(255, 255, 255, 0.46)',
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 6,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    top: 6,
  },
  option: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 8,
  },
  label: {
    color: 'rgba(220, 233, 252, 0.68)',
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
  },
  labelSelected: { color: '#FFFFFF' },
  pressed: { opacity: 0.78 },
});
