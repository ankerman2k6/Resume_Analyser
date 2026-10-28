import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme';
import { spacing } from '../../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type Role = 'candidate' | 'recruiter';

type LoginErrors = {
  identifier?: string;
  password?: string;
};

const roleContent = {
  candidate: {
    badge: 'Dành cho Ứng viên',
    button: 'Đăng nhập với tư cách Ứng viên',
  },
  recruiter: {
    badge: 'Dành cho Nhà tuyển dụng',
    button: 'Đăng nhập với tư cách Nhà tuyển dụng',
  },
} as const;

export function LoginScreen({ navigation }: Props) {
  const [role, setRole] = useState<Role>('candidate');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const clearError = (field: keyof LoginErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: LoginErrors = {};
    const normalizedIdentifier = identifier.trim().replace(/\s/g, '');
    const isEmail = /^\S+@\S+\.\S+$/.test(identifier.trim());
    const isPhone = /^(0|\+84)\d{9}$/.test(normalizedIdentifier);

    if (!identifier.trim()) {
      nextErrors.identifier = 'Vui lòng nhập email hoặc số điện thoại.';
    } else if (!isEmail && !isPhone) {
      nextErrors.identifier = 'Email hoặc số điện thoại chưa đúng định dạng.';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validateForm()) {
      return;
    }

    const loginPayload = {
      role,
      identifier: identifier.trim(),
      password,
      rememberLogin,
    };

    console.log('Login payload:', loginPayload);

    if (role === 'recruiter') {
      Alert.alert(
        'Khu vực Nhà tuyển dụng',
        'Luồng màn hình dành cho Nhà tuyển dụng chưa được kết nối trong phiên bản hiện tại.',
      );
      return;
    }

    navigation.replace('CandidateTabs');
  };

  const selectedContent = roleContent[role];

  return (
    <ImageBackground
      source={require('../../../assets/images/auth-background.jpg')}
      resizeMode="cover"
      style={styles.background}
    >
      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <Pressable
                accessibilityLabel="Quay lại màn hình trước"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Ionicons color={colors.light.text.inverse} name="chevron-back" size={22} />
                <Text style={styles.backText}>Quay lại</Text>
              </Pressable>
            </View>

            <View style={styles.contentPanel}>
              <Text style={styles.title}>Chào mừng trở lại!</Text>
              <Text style={styles.subtitle}>
                Đăng nhập để tiếp tục quản lý sự nghiệp hoặc chiến dịch tuyển dụng của bạn.
              </Text>

              <View accessibilityRole="radiogroup" style={styles.roleTabs}>
                <RoleTab
                  icon="briefcase-outline"
                  label="Ứng viên"
                  onPress={() => setRole('candidate')}
                  selected={role === 'candidate'}
                />
                <RoleTab
                  icon="business-outline"
                  label="Nhà tuyển dụng"
                  onPress={() => setRole('recruiter')}
                  selected={role === 'recruiter'}
                />
              </View>

              <View style={styles.formCard}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Email hoặc Số điện thoại</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{selectedContent.badge}</Text>
                  </View>
                </View>

                <View style={[styles.inputShell, errors.identifier && styles.inputShellError]}>
                  <Ionicons color={colors.light.text.secondary} name="at-outline" size={24} />
                  <TextInput
                    accessibilityLabel="Email hoặc số điện thoại"
                    autoCapitalize="none"
                    autoComplete="username"
                    onChangeText={(value) => {
                      setIdentifier(value);
                      clearError('identifier');
                    }}
                    placeholder="name@email.com hoặc 090..."
                    placeholderTextColor={colors.light.text.secondary}
                    returnKeyType="next"
                    style={styles.input}
                    textContentType="username"
                    value={identifier}
                  />
                </View>
                <FieldError message={errors.identifier} />

                <Text style={styles.fieldLabel}>Mật khẩu</Text>
                <View style={[styles.inputShell, errors.password && styles.inputShellError]}>
                  <Ionicons
                    color={colors.light.text.secondary}
                    name="lock-closed-outline"
                    size={23}
                  />
                  <TextInput
                    accessibilityLabel="Mật khẩu"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    onChangeText={(value) => {
                      setPassword(value);
                      clearError('password');
                    }}
                    onSubmitEditing={handleLogin}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor={colors.light.text.secondary}
                    returnKeyType="done"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    textContentType="password"
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setShowPassword((current) => !current)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons
                      color={colors.light.text.secondary}
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                    />
                  </Pressable>
                </View>
                <FieldError message={errors.password} />

                <View style={styles.optionsRow}>
                  <Pressable
                    accessibilityLabel="Ghi nhớ đăng nhập"
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: rememberLogin }}
                    onPress={() => setRememberLogin((current) => !current)}
                    style={({ pressed }) => [styles.rememberButton, pressed && styles.pressed]}
                  >
                    <View style={[styles.checkbox, rememberLogin && styles.checkboxChecked]}>
                      {rememberLogin ? (
                        <Ionicons
                          color={colors.light.text.inverse}
                          name="checkmark"
                          size={17}
                        />
                      ) : null}
                    </View>
                    <Text style={styles.optionText}>Ghi nhớ đăng nhập</Text>
                  </Pressable>

                  <Text style={styles.comingSoonText}>Quên mật khẩu? Sắp có</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>{selectedContent.button}</Text>
                  <Ionicons color={colors.light.text.inverse} name="arrow-forward" size={23} />
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>ĐĂNG NHẬP NHANH, SẮP CÓ</Text>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialRow}>
                  <DisabledSocialButton icon="logo-google" label="Google" />
                  <DisabledSocialButton icon="logo-linkedin" label="LinkedIn" />
                  <DisabledSocialButton icon="logo-apple" label="Apple" />
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('Register')}
                  style={({ pressed }) => [styles.registerButton, pressed && styles.pressed]}
                >
                  <Text style={styles.registerHint}>
                    Chưa có tài khoản?
                    <Text style={styles.registerLink}> Đăng ký ngay</Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

type RoleTabProps = {
  icon: 'briefcase-outline' | 'business-outline';
  label: string;
  onPress: () => void;
  selected: boolean;
};

function RoleTab({ icon, label, onPress, selected }: RoleTabProps) {
  return (
    <Pressable
      accessibilityLabel={`Đăng nhập với vai trò ${label}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleTab,
        selected && styles.roleTabSelected,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        color={selected ? colors.light.brand.secondary : colors.light.text.secondary}
        name={icon}
        size={24}
      />
      <Text style={[styles.roleTabText, selected && styles.roleTabTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function DisabledSocialButton({
  icon,
  label,
}: {
  icon: 'logo-google' | 'logo-linkedin' | 'logo-apple';
  label: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label}, sắp có`}
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      disabled
      style={styles.socialButton}
    >
      <Ionicons color={colors.light.text.secondary} name={icon} size={25} />
    </Pressable>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <Text accessibilityLiveRegion="polite" style={styles.errorText}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1},
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: {
    minHeight: 184,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(7, 27, 73, 0.86)',
    borderRadius: 24,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  backText: {
    color: colors.light.text.inverse,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: { opacity: 0.72 },
  contentPanel: {
    backgroundColor: colors.light.background.primary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexGrow: 1,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  title: {
    color: colors.light.text.primary,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.light.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  roleTabs: {
    backgroundColor: '#ECF2FF',
    borderRadius: 16,
    flexDirection: 'row',
    marginTop: spacing.lg,
    padding: spacing.xs,
  },
  roleTab: {
    alignItems: 'center',
    borderRadius: 13,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.sm,
  },
  roleTabSelected: {
    backgroundColor: colors.light.background.surface,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  roleTabText: {
    color: colors.light.text.secondary,
    fontSize: 15,
    fontWeight: '700',
  },
  roleTabTextSelected: { color: colors.light.text.primary },
  formCard: {
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  fieldLabel: {
    color: colors.light.text.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  roleBadge: {
    backgroundColor: colors.light.brand.accent,
    borderRadius: 16,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  roleBadgeText: {
    color: colors.light.brand.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.light.background.input,
    borderColor: colors.light.border.subtle,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  inputShellError: { borderColor: colors.light.status.danger },
  input: {
    color: colors.light.text.primary,
    flex: 1,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
  },
  passwordToggle: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  errorText: {
    color: colors.light.status.danger,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  rememberButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.light.text.secondary,
    borderRadius: 5,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: colors.light.brand.secondary,
    borderColor: colors.light.brand.secondary,
  },
  optionText: {
    color: colors.light.text.secondary,
    fontSize: 13,
  },
  comingSoonText: {
    color: colors.light.text.secondary,
    fontSize: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.primary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  primaryButtonPressed: { backgroundColor: colors.light.brand.secondary },
  primaryButtonText: {
    color: colors.light.text.inverse,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  divider: {
    backgroundColor: colors.light.border.subtle,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.light.text.secondary,
    fontSize: 10,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: colors.light.background.subtle,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    opacity: 0.55,
  },
  registerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 48,
  },
  registerHint: {
    color: colors.light.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  registerLink: {
    color: colors.light.brand.secondary,
    fontWeight: '800',
  },
});
