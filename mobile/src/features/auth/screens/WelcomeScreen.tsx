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
  brand: { color: colors.light.text.inverse, fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginTop: spacing.sm },
  copy: { alignItems: 'center', paddingHorizontal: spacing.md },
  title: { color: colors.light.text.inverse, fontSize: 34, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: 'rgba(255, 255, 255, 0.88)', fontSize: 16, lineHeight: 23, marginTop: spacing.sm, textAlign: 'center' },
  actions: { alignItems: 'stretch', backgroundColor: colors.light.background.surface, borderRadius: 18, flexDirection: 'row', overflow: 'hidden' },
  loginButton: { alignItems: 'center', backgroundColor: colors.light.brand.primary, flex: 1, paddingVertical: 16 },
  registerButton: { alignItems: 'center', backgroundColor: colors.light.background.surface, flex: 1, paddingVertical: 16 },
  loginText: { color: colors.light.text.inverse, fontWeight: '800' },
  registerText: { color: colors.light.brand.secondary, fontWeight: '800' },
});
