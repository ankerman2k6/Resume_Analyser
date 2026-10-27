import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../theme';
import { spacing } from '../../../theme/spacing';

export function ProfileScreen() {
  const [name, setName] = useState('Nguyễn Minh An');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>CANDIDATE PROFILE</Text>
        <Text style={styles.title}>Hồ sơ cá nhân</Text>
        <Text style={styles.subtitle}>Màn hình mẫu cho luồng xem và chỉnh sửa dữ liệu hồ sơ.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Họ và tên</Text>
          {isEditing ? <TextInput onChangeText={setName} value={name} style={styles.input} /> : <Text style={styles.value}>{name}</Text>}
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>candidate@example.com</Text>
          <Pressable accessibilityRole="button" onPress={() => setIsEditing((current) => !current)} style={styles.button}>
            <Text style={styles.buttonText}>{isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa hồ sơ'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.light.background.primary, flex: 1 },
  content: { padding: spacing.md },
  eyebrow: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.light.text.primary, fontSize: 28, fontWeight: '800', marginTop: spacing.sm },
  subtitle: { color: colors.light.text.secondary, lineHeight: 21, marginBottom: spacing.lg, marginTop: spacing.sm },
  card: { backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1, padding: spacing.md },
  label: { color: colors.light.text.secondary, fontSize: 13, fontWeight: '700', marginTop: spacing.md },
  value: { color: colors.light.text.primary, fontSize: 16, marginTop: spacing.sm },
  input: { borderBottomColor: colors.light.border.focus, borderBottomWidth: 1, color: colors.light.text.primary, fontSize: 16, marginTop: spacing.sm, paddingVertical: spacing.sm },
  button: { alignItems: 'center', backgroundColor: colors.light.brand.primary, borderRadius: 8, marginTop: spacing.lg, padding: 13 },
  buttonText: { color: colors.light.text.inverse, fontWeight: '800' },
});
