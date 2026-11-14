import { ImageBackground, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme';
import { spacing } from '../../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ImageBackground
      source={require('../../../assets/images/auth-background.jpg')}
      resizeMode="cover"
      style={styles.background}
    >
      <StatusBar style="light" />
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.brand}>RESUME ANALYSER</Text>
          <View style={styles.copy}>
            <Text style={styles.title}>Chào mừng trở lại!</Text>
            <Text style={styles.subtitle}>Quản lý hồ sơ và tìm cơ hội phù hợp với bạn.</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('CandidateTabs')}
              style={[styles.loginButton, { backgroundColor: colors.light.brand.secondary }]}
            >
              <Text style={styles.loginText}>Khám phá việc làm (Ứng viên)</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>Đăng nhập</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
            >
              <Text style={styles.registerText}>Đăng ký</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrim: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, backgroundColor: 'rgba(8, 22, 58, 0.16)' },
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between', padding: spacing.lg },
  brand: { color: colors.light.text.inverse, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 },
  copy: { gap: spacing.sm },
  title: { color: colors.light.text.inverse, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.light.text.inverse, fontSize: 15, lineHeight: 22, opacity: 0.9 },
  actions: { gap: spacing.md },
  loginButton: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  loginText: { color: colors.light.text.inverse, fontSize: 15, fontWeight: '700' },
  registerButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  registerText: { color: colors.light.text.inverse, fontSize: 15, fontWeight: '700' },
});
