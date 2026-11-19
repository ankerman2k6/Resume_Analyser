import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fontFamilies } from '../../../theme';
import { WELCOME_COLORS } from './welcome.constants';

type Props = {
  visible: boolean;
  reduceMotion: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
};

type ActionRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  primary?: boolean;
  onPress: () => void;
};

function ActionRow({ icon, label, primary, onPress }: ActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        primary ? styles.actionPrimary : styles.actionSecondary,
        pressed && styles.actionPressed,
      ]}
    >
      <MaterialIcons
        color={primary ? WELCOME_COLORS.white : WELCOME_COLORS.navy}
        name={icon}
        size={28}
      />
      <Text style={[styles.actionLabel, primary && styles.actionLabelPrimary]}>{label}</Text>
    </Pressable>
  );
}

export function WelcomeActionModal({
  visible,
  reduceMotion,
  onClose,
  onLogin,
  onRegister,
  onGuest,
}: Props) {
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      if (reduceMotion) {
        progress.setValue(1);
        return;
      }
      progress.setValue(0);
      Animated.spring(progress, {
        damping: 18,
        mass: 0.75,
        stiffness: 190,
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
      return;
    }

    if (!mounted) return;
    if (reduceMotion) {
      progress.setValue(0);
      setMounted(false);
      return;
    }
    Animated.timing(progress, {
      duration: 120,
      easing: Easing.in(Easing.cubic),
      toValue: 0,
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [mounted, progress, reduceMotion, visible]);

  if (!mounted) return null;

  const runAfterClose = (action: () => void) => {
    onClose();
    setTimeout(action, reduceMotion ? 0 : 130);
  };

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={mounted}
    >
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable
            accessibilityLabel="Đóng menu bắt đầu"
            accessibilityRole="button"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.glassPanel,
            {
              opacity: progress,
              transform: [
                {
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: reduceMotion ? [1, 1] : [0.95, 1],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: reduceMotion ? [0, 0] : [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View pointerEvents="none" style={styles.edgeHighlight} />
          <View pointerEvents="none" style={styles.opticalGlow} />
          <View style={styles.handle} />
          <View style={styles.actions}>
            <ActionRow
              icon="person-add-alt"
              label="Đăng ký"
              onPress={() => runAfterClose(onRegister)}
              primary
            />
            <ActionRow
              icon="person-outline"
              label="Đăng nhập"
              onPress={() => runAfterClose(onLogin)}
            />
            <ActionRow
              icon="play-arrow"
              label="Trải nghiệm app"
              onPress={() => runAfterClose(onGuest)}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  backdrop: {
    backgroundColor: 'rgba(7, 20, 42, 0.42)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  glassPanel: {
    backgroundColor: 'rgba(224, 236, 252, 0.94)',
    borderColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 34,
    borderWidth: 1.5,
    maxWidth: 420,
    overflow: 'hidden',
    paddingBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 18,
    position: 'relative',
    shadowColor: '#04122A',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.32,
    shadowRadius: 36,
    width: '100%',
    elevation: 24,
  },
  edgeHighlight: {
    borderColor: 'rgba(255, 255, 255, 0.84)',
    borderRadius: 32,
    borderWidth: 1,
    bottom: 4,
    left: 4,
    position: 'absolute',
    right: 4,
    top: 4,
  },
  opticalGlow: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 110,
    height: 180,
    position: 'absolute',
    right: -70,
    top: -100,
    transform: [{ rotate: '-24deg' }],
    width: 180,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 99,
    height: 7,
    marginBottom: 20,
    width: 62,
  },
  actions: { gap: 12 },
  action: {
    alignItems: 'center',
    borderRadius: 26,
    flexDirection: 'row',
    gap: 18,
    height: 70,
    justifyContent: 'flex-start',
    paddingHorizontal: 28,
  },
  actionPrimary: {
    backgroundColor: '#0D4EBB',
    shadowColor: '#0D4EBB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  actionSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
    borderColor: 'rgba(255, 255, 255, 0.84)',
    borderWidth: 1,
  },
  actionPressed: { opacity: 0.78 },
  actionLabel: {
    color: WELCOME_COLORS.navy,
    fontFamily: fontFamilies.semibold,
    fontSize: 20,
    lineHeight: 28,
  },
  actionLabelPrimary: { color: WELCOME_COLORS.white },
});
