import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme';
import { spacing } from '../../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Tạo tài khoản ứng viên</Text>
        <Text style={styles.subtitle}>Thông tin này chỉ là form demo cho flow báo cáo.</Text>
        <TextInput onChangeText={setName} value={name} placeholder="Họ và tên" style={styles.input} />
        <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} value={email} placeholder="Email" style={styles.input} />
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Tạo tài khoản</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.light.background.primary, flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  title: { color: colors.light.text.primary, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.light.text.secondary, lineHeight: 21, marginBottom: spacing.lg, marginTop: spacing.sm },
  input: { backgroundColor: colors.light.background.input, borderColor: colors.light.border.subtle, borderRadius: 8, borderWidth: 1, marginTop: spacing.sm, padding: 13 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.light.brand.primary, borderRadius: 8, marginTop: spacing.lg, padding: 14 },
  primaryText: { color: colors.light.text.inverse, fontWeight: '800' },
});
