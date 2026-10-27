import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme';
import { spacing } from '../../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('candidate@example.com');
  const [password, setPassword] = useState('password');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>RESUME ANALYSER</Text>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Bắt đầu quản lý hồ sơ và tìm cơ hội phù hợp.</Text>
        <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} value={email} placeholder="Email" style={styles.input} />
        <TextInput onChangeText={setPassword} value={password} placeholder="Mật khẩu" secureTextEntry style={styles.input} />
        <Pressable accessibilityRole="button" onPress={() => navigation.replace('CandidateTabs')} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Đăng nhập</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Register')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Tạo tài khoản mới</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.light.background.primary, flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  eyebrow: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.light.text.primary, fontSize: 32, fontWeight: '800', marginTop: spacing.sm },
  subtitle: { color: colors.light.text.secondary, fontSize: 16, lineHeight: 23, marginBottom: spacing.lg, marginTop: spacing.sm },
  input: { backgroundColor: colors.light.background.input, borderColor: colors.light.border.subtle, borderRadius: 8, borderWidth: 1, color: colors.light.text.primary, marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 13 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.light.brand.primary, borderRadius: 8, marginTop: spacing.lg, padding: 14 },
  primaryText: { color: colors.light.text.inverse, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', marginTop: spacing.md, padding: spacing.sm },
  secondaryText: { color: colors.light.brand.secondary, fontWeight: '700' },
});
