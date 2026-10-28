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

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

type Role = 'candidate' | 'recruiter';

type FieldErrors = Partial<
  Record<
    | 'name'
    | 'email'
    | 'phone'
    | 'password'
    | 'confirmPassword'
    | 'accepted',
    string
  >
>;

export function RegisterScreen({ navigation }: Props) {
  const [role, setRole] = useState<Role>('candidate');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};
    const normalizedPhone = phone.replace(/\s/g, '');

    if (!name.trim()) {
      nextErrors.name = 'Vui lòng nhập họ và tên.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Địa chỉ email chưa đúng định dạng.';
    }

    if (!normalizedPhone) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại liên hệ.';
    } else if (!/^(0|\+84)\d{9}$/.test(normalizedPhone)) {
      nextErrors.phone = 'Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có đủ chữ số.';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 8) {
      nextErrors.password = 'Mật khẩu cần có ít nhất 8 ký tự.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    if (!accepted) {
      nextErrors.accepted = 'Bạn cần đồng ý với điều khoản dịch vụ.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validateForm()) {
      return;
    }

    const registerPayload = {
      role,
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\s/g, ''),
      password,
    };

    console.log('Register payload:', registerPayload);

    Alert.alert(
      'Tạo tài khoản thành công',
      'Bạn có thể đăng nhập bằng tài khoản vừa tạo.',
      [
        {
          text: 'Đăng nhập',
          onPress: () => navigation.replace('Login'),
        },
      ],
    );
  };

  const roleName =
    role === 'candidate' ? 'Ứng viên' : 'Nhà tuyển dụng';

  return (
    <ImageBackground source={require('../../../assets/images/auth-background.jpg')} resizeMode="cover" style={styles.background}
    >
      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
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
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons color={colors.light.text.inverse} name="chevron-back" size={22}
                />
                <Text style={styles.backText}>Quay lại</Text>
              </Pressable>
            </View>

            <View style={styles.formPanel}>
              <Text style={styles.title}>Tạo tài khoản</Text>

              <Text style={styles.subtitle}>
                Chọn vai trò của bạn để bắt đầu trải nghiệm tuyển dụng phù hợp.
              </Text>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Chọn vai trò tham gia
                  <Text style={styles.required}> *</Text>
                </Text>

                <Text style={styles.sectionHint}>
                  Có thể chuyển đổi sau
                </Text>
              </View>

              <RoleCard
                description="Tìm kiếm cơ hội nghề nghiệp, quản lý hồ sơ và tối ưu CV."
                icon="briefcase-outline"
                label="Ứng viên tìm việc"
                onPress={() => setRole('candidate')}
                selected={role === 'candidate'}
                tag="Cá nhân"
              />

              <RoleCard
                description="Đăng tin tuyển dụng, quản lý ứng viên và lịch phỏng vấn."
                icon="business-outline"
                label="Nhà tuyển dụng"
                onPress={() => setRole('recruiter')}
                selected={role === 'recruiter'}
                tag="Doanh nghiệp"
              />

              <View style={styles.form}>
                <FieldLabel label="Họ và tên đầy đủ" required />

                <InputShell
                  error={errors.name}
                  icon="person-outline"
                >
                  <TextInput
                    accessibilityLabel="Họ và tên đầy đủ"
                    autoCapitalize="words"
                    autoComplete="name"
                    onChangeText={(value) => {
                      setName(value);
                      clearError('name');
                    }}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor={colors.light.text.secondary}
                    returnKeyType="next"
                    style={styles.input}
                    textContentType="name"
                    value={name}
                  />
                </InputShell>

                <FieldError message={errors.name} />

                <FieldLabel label="Địa chỉ email cá nhân" required />

                <InputShell error={errors.email} icon="mail-outline">
                  <TextInput
                    accessibilityLabel="Địa chỉ email cá nhân"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onChangeText={(value) => {
                      setEmail(value);
                      clearError('email');
                    }}
                    placeholder="name@example.com"
                    placeholderTextColor={colors.light.text.secondary}
                    returnKeyType="next"
                    style={styles.input}
                    textContentType="emailAddress"
                    value={email}
                  />
                </InputShell>

                <FieldError message={errors.email} />

                <Text style={styles.helperText}>
                  Dùng email cá nhân để nhận thông báo tuyển dụng và phỏng vấn.
                </Text>

                <FieldLabel label="Số điện thoại liên hệ" required />

                <InputShell
                  error={errors.phone}
                  icon="call-outline"
                >
                  <TextInput
                    accessibilityLabel="Số điện thoại liên hệ"
                    autoComplete="tel"
                    keyboardType="phone-pad"
                    onChangeText={(value) => {
                      setPhone(value);
                      clearError('phone');
                    }}
                    placeholder="0912 345 678"
                    placeholderTextColor={colors.light.text.secondary}
                    returnKeyType="next"
                    style={styles.input}
                    textContentType="telephoneNumber"
                    value={phone}
                  />
                </InputShell>

                <FieldError message={errors.phone} />

                <FieldLabel label="Mật khẩu" required />

                <InputShell
                  error={errors.password}
                  icon="lock-closed-outline"
                >
                  <TextInput
                    accessibilityLabel="Mật khẩu"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    onChangeText={(value) => {
                      setPassword(value);
                      clearError('password');
                    }}
                    placeholder="Tối thiểu 8 ký tự"
                    placeholderTextColor={colors.light.text.secondary}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    textContentType="newPassword"
                    value={password}
                  />

                  <PasswordToggle
                    visible={showPassword}
                    onPress={() => setShowPassword((current) => !current)}
                  />
                </InputShell>

                <FieldError message={errors.password} />

                <View style={styles.passwordStrengthHeader}>
                  <Text style={styles.helperText}>Độ an toàn mật khẩu</Text>

                  <Text style={styles.helperText}>
                    {password.length >= 8 ? 'Đạt yêu cầu' : 'Chưa đạt'}
                  </Text>
                </View>

                <View style={styles.strengthTrack}>
                  <View
                    style={[
                      styles.strengthValue,
                      password.length >= 8 && styles.strengthValueValid,
                    ]}
                  />
                </View>

                <FieldLabel label="Xác nhận mật khẩu" required />

                <InputShell
                  error={errors.confirmPassword}
                  icon="refresh-circle-outline"
                >
                  <TextInput
                    accessibilityLabel="Xác nhận mật khẩu"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      clearError('confirmPassword');
                    }}
                    onSubmitEditing={handleRegister}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor={colors.light.text.secondary}
                    returnKeyType="done"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    textContentType="newPassword"
                    value={confirmPassword}
                  />

                  <PasswordToggle
                    visible={showConfirmPassword}
                    onPress={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                  />
                </InputShell>

                <FieldError message={errors.confirmPassword} />

                <Pressable
                  accessibilityLabel="Đồng ý với điều khoản dịch vụ"
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: accepted }}
                  onPress={() => {
                    setAccepted((current) => !current);
                    clearError('accepted');
                  }}
                  style={({ pressed }) => [
                    styles.consentRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      accepted && styles.checkboxChecked,
                    ]}
                  >
                    {accepted ? (
                      <Ionicons
                        color={colors.light.text.inverse}
                        name="checkmark"
                        size={18}
                      />
                    ) : null}
                  </View>

                  <Text style={styles.consentText}>
                    Tôi đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư.
                  </Text>
                </Pressable>

                <FieldError message={errors.accepted} />

                <Pressable
                  accessibilityRole="button"
                  onPress={handleRegister}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    Hoàn tất đăng ký {roleName}
                  </Text>

                  <Ionicons
                    color={colors.light.text.inverse}
                    name="arrow-forward"
                    size={22}
                  />
                </Pressable>

                <Text style={styles.actionHint}>
                  Sau khi đăng ký, bạn có thể cập nhật hồ sơ trong ứng dụng.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Login')}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.loginHint}>
                  Đã có tài khoản?
                  <Text style={styles.loginLink}> Đăng nhập ngay</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

type RoleCardProps = {
  description: string;
  icon: 'briefcase-outline' | 'business-outline';
  label: string;
  onPress: () => void;
  selected: boolean;
  tag: string;
};

function RoleCard({description,  icon, label, onPress, selected,tag,}: RoleCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${label}. ${description}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleCard,
        selected && styles.roleCardSelected,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.roleIconContainer,
          selected && styles.roleIconContainerSelected,
        ]}
      >
        <Ionicons
          color={selected ? colors.light.brand.secondary : colors.light.text.secondary}
          name={icon}
          size={28}
        />
      </View>

      <View style={styles.roleContent}>
        <View style={styles.roleTitleRow}>
          <Text style={styles.roleTitle}>{label}</Text>

          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{tag}</Text>
          </View>
        </View>

        <Text style={styles.roleDescription}>{description}</Text>
      </View>

      <View
        style={[
          styles.radio,
          selected && styles.radioSelected,
        ]}
      >
        {selected ? (
          <Ionicons
            color={colors.light.text.inverse}
            name="checkmark"
            size={18}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

function FieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

function InputShell({
  children,
  error,
  icon,
}: {
  children: React.ReactNode;
  error?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View
      style={[
        styles.inputShell,
        error ? styles.inputShellError : null,
      ]}
    >
      <Ionicons
        color={colors.light.text.secondary}
        name={icon}
        size={22}
      />

      {children}
    </View>
  );
}

function PasswordToggle({
  onPress,
  visible,
}: {
  onPress: () => void;
  visible: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={styles.passwordToggle}
    >
      <Ionicons
        color={colors.light.text.secondary}
        name={visible ? 'eye-off-outline' : 'eye-outline'}
        size={23}
      />
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
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    minHeight: 185,
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
  pressed: {
    opacity: 0.72,
  },
  formPanel: {
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
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.light.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.light.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHint: {
    color: colors.light.text.secondary,
    fontSize: 12,
  },
  required: {
    color: colors.light.status.danger,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 120,
    padding: spacing.md,
  },
  roleCardSelected: {
    backgroundColor: colors.light.brand.accent,
    borderColor: colors.light.brand.secondary,
  },
  roleIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.light.background.subtle,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  roleIconContainerSelected: {
    backgroundColor: colors.light.background.surface,
  },
  roleContent: {
    flex: 1,
  },
  roleTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleTitle: {
    color: colors.light.text.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  roleTag: {
    backgroundColor: colors.light.background.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  roleTagText: {
    color: colors.light.brand.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  roleDescription: {
    color: colors.light.text.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  radio: {
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  radioSelected: {
    backgroundColor: colors.light.brand.secondary,
  },
  form: {
    marginTop: spacing.lg,
  },
  fieldLabel: {
    color: colors.light.text.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.light.background.input,
    borderColor: colors.light.border.subtle,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  inputShellError: {
    borderColor: colors.light.status.danger,
  },
  input: {
    color: colors.light.text.primary,
    flex: 1,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
  },
  passwordToggle: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  helperText: {
    color: colors.light.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.light.status.danger,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  passwordStrengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strengthTrack: {
    backgroundColor: '#DBEAFE',
    borderRadius: 4,
    height: 6,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  strengthValue: {
    backgroundColor: colors.light.status.warning,
    height: '100%',
    width: '28%',
  },
  strengthValueValid: {
    backgroundColor: colors.light.status.success,
    width: '100%',
  },
  consentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    minHeight: 48,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.light.border.focus,
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
  consentText: {
    color: colors.light.text.secondary,
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.secondary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  primaryButtonPressed: {
    backgroundColor: colors.light.brand.primary,
  },
  primaryButtonText: {
    color: colors.light.text.inverse,
    fontSize: 16,
    fontWeight: '800',
  },
  actionHint: {
    color: colors.light.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  loginButton: {
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginHint: {
    color: colors.light.text.secondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.light.brand.secondary,
    fontWeight: '800',
  },
});