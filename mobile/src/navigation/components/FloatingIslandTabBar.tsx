import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { colors, fontFamilies, radii } from '../../theme';

const ISLAND_HEIGHT = 65;
const INDICATOR_VERTICAL_INSET = 10;
const INDICATOR_EDGE_INSET = 6;
const INDICATOR_HORIZONTAL_PADDING = 14;
const ICON_SIZE = 20;
const ICON_LABEL_GAP = 5;
const SCROLL_DIRECTION_THRESHOLD = 14;
const BOTTOM_REVEAL_GUARD = 20;

type FloatingTabBarController = {
  hide: () => void;
  show: () => void;
  visibility: SharedValue<number>;
};

const FloatingTabBarContext = createContext<FloatingTabBarController | null>(
  null,
);

export function FloatingTabBarProvider({ children }: PropsWithChildren) {
  const visibility = useSharedValue(1);
  const targetVisibility = useRef<0 | 1>(1);

  const hide = useCallback(() => {
    if (targetVisibility.current === 0) return;
    targetVisibility.current = 0;
    visibility.value = withTiming(0, {
      duration: 220,
      reduceMotion: ReduceMotion.System,
    });
  }, [visibility]);

  const show = useCallback(() => {
    if (targetVisibility.current === 1) return;
    targetVisibility.current = 1;
    visibility.value = withTiming(1, {
      duration: 240,
      reduceMotion: ReduceMotion.System,
    });
  }, [visibility]);

  return (
    <FloatingTabBarContext.Provider value={{ hide, show, visibility }}>
      {children}
    </FloatingTabBarContext.Provider>
  );
}

export function useFloatingTabBarScrollHandler() {
  const controller = useContext(FloatingTabBarContext);
  const isDragging = useRef(false);
  const lastOffset = useRef(0);
  const accumulatedDistance = useRef(0);
  const lastDirection = useRef<-1 | 0 | 1>(0);

  const resetDirection = useCallback(() => {
    accumulatedDistance.current = 0;
    lastDirection.current = 0;
  }, []);

  const getScrollMetrics = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxOffset = Math.max(0, contentSize.height - layoutMeasurement.height);
    const offset = Math.min(Math.max(0, contentOffset.y), maxOffset);
    return { maxOffset, offset };
  }, []);

  const onScrollBeginDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isDragging.current = true;
      lastOffset.current = getScrollMetrics(event).offset;
      resetDirection();
    },
    [getScrollMetrics, resetDirection],
  );

  const onScrollEndDrag = useCallback(() => {
    isDragging.current = false;
    resetDirection();
  }, [resetDirection]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!controller || !isDragging.current) return;

      const { maxOffset, offset } = getScrollMetrics(event);
      const delta = offset - lastOffset.current;
      lastOffset.current = offset;

      if (offset <= 8) {
        accumulatedDistance.current = 0;
        lastDirection.current = 0;
        controller.show();
        return;
      }

      if (Math.abs(delta) < 1) return;

      const direction: -1 | 1 = delta > 0 ? 1 : -1;
      if (direction !== lastDirection.current) {
        lastDirection.current = direction;
        accumulatedDistance.current = 0;
      }

      accumulatedDistance.current += Math.abs(delta);
      if (accumulatedDistance.current < SCROLL_DIRECTION_THRESHOLD) return;

      accumulatedDistance.current = 0;
      if (direction > 0) {
        controller.hide();
        return;
      }

      // Do not reveal while iOS/Android elastically rebounds at the bottom.
      // The user must deliberately drag away from the bottom edge first.
      if (maxOffset > 0 && offset > maxOffset - BOTTOM_REVEAL_GUARD) return;
      controller.show();
    },
    [controller, getScrollMetrics],
  );

  return useMemo(
    () => ({ onScroll, onScrollBeginDrag, onScrollEndDrag }),
    [onScroll, onScrollBeginDrag, onScrollEndDrag],
  );
}

type IslandTabItemProps = {
  activeContentOffset: number;
  accessibilityLabel?: string;
  focused: boolean;
  icon: ReactNode;
  label: string;
  onContentWidth: (routeKey: string, width: number) => void;
  onLongPress: () => void;
  onPress: () => void;
  routeKey: string;
  testID?: string;
};

function IslandTabItem({
  activeContentOffset,
  accessibilityLabel,
  focused,
  icon,
  label,
  onContentWidth,
  onLongPress,
  onPress,
  routeKey,
  testID,
}: IslandTabItemProps) {
  const reducedMotion = useReducedMotion();
  const selectedProgress = useSharedValue(focused ? 1 : 0);
  const [labelWidth, setLabelWidth] = useState(0);

  useEffect(() => {
    if (labelWidth <= 0) return;
    onContentWidth(routeKey, ICON_SIZE + ICON_LABEL_GAP + labelWidth);
  }, [labelWidth, onContentWidth, routeKey]);

  useEffect(() => {
    if (reducedMotion) {
      selectedProgress.value = focused ? 1 : 0;
      return;
    }

    selectedProgress.value = withTiming(focused ? 1 : 0, {
      duration: 220,
      reduceMotion: ReduceMotion.System,
    });
  }, [focused, reducedMotion, selectedProgress]);

  const labelStyle = useAnimatedStyle(() => ({
    marginLeft: ICON_LABEL_GAP * selectedProgress.value,
    opacity: selectedProgress.value,
    transform: [{ translateX: 4 * (1 - selectedProgress.value) }],
    width: labelWidth * selectedProgress.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: activeContentOffset * selectedProgress.value },
    ],
  }));

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      hitSlop={4}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
      testID={testID}
    >
      <Animated.View style={[styles.tabContent, contentStyle]}>
        {icon}
        <Animated.View style={[styles.labelClip, labelStyle]}>
          <Text numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        </Animated.View>
        <Text
          accessible={false}
          onLayout={(event) => {
            setLabelWidth(Math.ceil(event.nativeEvent.layout.width));
          }}
          style={[styles.label, styles.measurementLabel]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function getIndicatorGeometry(
  index: number,
  contentWidth: number,
  islandWidth: number,
  slotWidth: number,
) {
  if (islandWidth <= 0 || slotWidth <= 0) {
    return { width: 0, x: 0 };
  }

  const width = Math.min(
    islandWidth - INDICATOR_EDGE_INSET * 2,
    contentWidth + INDICATOR_HORIZONTAL_PADDING * 2,
  );
  const centeredX = index * slotWidth + (slotWidth - width) / 2;
  const x = Math.min(
    Math.max(INDICATOR_EDGE_INSET, centeredX),
    islandWidth - width - INDICATOR_EDGE_INSET,
  );

  return { width, x };
}

function getLabel(
  options: BottomTabBarProps['descriptors'][string]['options'],
  routeName: string,
) {
  if (typeof options.tabBarLabel === 'string') return options.tabBarLabel;
  if (typeof options.title === 'string') return options.title;
  return routeName;
}

export function FloatingIslandTabBar({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const controller = useContext(FloatingTabBarContext);
  const visibility = controller?.visibility;
  const reducedMotion = useReducedMotion();
  const [islandWidth, setIslandWidth] = useState(0);
  const [contentWidths, setContentWidths] = useState<Record<string, number>>({});
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(ICON_SIZE + INDICATOR_HORIZONTAL_PADDING * 2);
  const slotWidth = islandWidth / state.routes.length;
  const activeRouteKey = state.routes[state.index]?.key;
  const indicatorReady = Boolean(activeRouteKey && contentWidths[activeRouteKey]);

  const handleContentWidth = useCallback((routeKey: string, width: number) => {
    setContentWidths((current) => {
      if (current[routeKey] === width) return current;
      return { ...current, [routeKey]: width };
    });
  }, []);

  useEffect(() => {
    controller?.show();

    if (islandWidth <= 0 || slotWidth <= 0) return;

    const routeKey = state.routes[state.index]?.key;
    const contentWidth = contentWidths[routeKey] ?? ICON_SIZE;
    const { width: targetWidth, x: targetX } = getIndicatorGeometry(
      state.index,
      contentWidth,
      islandWidth,
      slotWidth,
    );

    if (reducedMotion) {
      indicatorX.value = targetX;
      indicatorWidth.value = targetWidth;
      return;
    }

    const springConfig = {
      damping: 18,
      mass: 0.85,
      overshootClamping: false,
      reduceMotion: ReduceMotion.System,
      stiffness: 190,
    } as const;

    indicatorX.value = withSpring(targetX, springConfig);
    indicatorWidth.value = withSpring(targetWidth, springConfig);
  }, [
    contentWidths,
    controller,
    indicatorWidth,
    indicatorX,
    islandWidth,
    reducedMotion,
    slotWidth,
    state.index,
    state.routes,
  ]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const visibilityStyle = useAnimatedStyle(() => {
    const visibilityProgress = visibility?.value ?? 1;
    return {
      transform: [
        {
          translateY:
            (1 - visibilityProgress) * (ISLAND_HEIGHT + insets.bottom + 20),
        },
      ],
    };
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    setIslandWidth(event.nativeEvent.layout.width);
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.safeArea,
        { paddingBottom: Math.max(insets.bottom, 8) },
        visibilityStyle,
      ]}
    >
      <View onLayout={handleLayout} style={styles.island}>
        {islandWidth > 0 && indicatorReady ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.indicator, indicatorStyle]}
          >
            <View style={styles.indicatorHighlight} />
          </Animated.View>
        ) : null}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const color = focused
            ? colors.light.text.inverse
            : 'rgba(207, 222, 247, 0.68)';
          const label = getLabel(options, route.name);
          const contentWidth = contentWidths[route.key] ?? ICON_SIZE;
          const indicatorGeometry = getIndicatorGeometry(
            index,
            contentWidth,
            islandWidth,
            slotWidth,
          );
          const slotCenter = index * slotWidth + slotWidth / 2;
          const activeContentOffset =
            indicatorGeometry.x + indicatorGeometry.width / 2 - slotCenter;
          const icon = options.tabBarIcon?.({
            color,
            focused,
            size: 22,
          });

          const onPress = () => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: 'tabPress',
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              target: route.key,
              type: 'tabLongPress',
            });
          };

          return (
            <IslandTabItem
              activeContentOffset={activeContentOffset}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              focused={focused}
              icon={icon}
              key={route.key}
              label={label}
              onContentWidth={handleContentWidth}
              onLongPress={onLongPress}
              onPress={onPress}
              routeKey={route.key}
              testID={options.tabBarButtonTestID}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    paddingHorizontal: 14,
    paddingTop: 8,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  island: {
    alignItems: 'stretch',
    alignSelf: 'center',
    backgroundColor: '#071B46',
    borderColor: 'rgba(143, 180, 255, 0.22)',
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: ISLAND_HEIGHT,
    maxWidth: 520,
    overflow: 'hidden',
    shadowColor: '#071B46',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    width: '100%',
    elevation: 10,
  },
  indicator: {
    backgroundColor: colors.light.brand.secondary,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: INDICATOR_VERTICAL_INSET,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: INDICATOR_VERTICAL_INSET,
  },
  indicatorHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: radii.full,
    height: 1,
    left: 14,
    position: 'absolute',
    right: 14,
    top: 1,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    height: ISLAND_HEIGHT,
    justifyContent: 'center',
    zIndex: 1,
  },
  tabPressed: {
    opacity: 0.76,
  },
  tabContent: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
  },
  labelClip: {
    overflow: 'hidden',
  },
  measurementLabel: {
    left: -1000,
    opacity: 0,
    position: 'absolute',
  },
  label: {
    color: colors.light.text.inverse,
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    lineHeight: 16,
  },
});
