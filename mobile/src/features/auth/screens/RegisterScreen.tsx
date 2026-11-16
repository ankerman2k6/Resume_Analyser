import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '../../../theme';
import type { RootStackParamList } from '../../../types/navigation';
import { KonekLogo } from '../components/KonekLogo';
import { WELCOME_BACKGROUND, WELCOME_COLORS } from '../components/welcome.constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
type Role = 'candidate' | 'recruiter';

type FieldErrors = Partial<
  Record<
    'name' | 'email' | 'phone' | 'password' | 'confirmPassword' | 'accepted',
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
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};
    const normalizedPhone = phone.replace(/\s/g, '');

    if (!name.trim()) nextErrors.name = 'Vui lòng nhập họ và tên.';

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

    if (!accepted) nextErrors.accepted = 'Bạn cần đồng ý với điều khoản dịch vụ.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validateForm()) return;

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
      [{ text: 'Đăng nhập', onPress: () => navigation.replace('Login') }],
    );
  };

  const roleName = role === 'candidate' ? 'Ứng viên' : 'Nhà tuyển dụng';

  return (
    <ImageBackground
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
      source={require('../../../assets/images/welcome/welcome-background.jpg')}
      style={styles.background}
    >
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.backgroundTint} />
      <View pointerEvents="none" style={styles.topRightGlow} />
      <View pointerEvents="none" style={styles.bottomShapeWash} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Pressable
                accessibilityLabel="Quay lại màn hình trước"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.logoButton, pressed && styles.pressed]}
              >
                <KonekLogo inverse />
              </Pressable>

              <View style={styles.headingBlock}>
                <Text style={styles.title}>Tạo tài khoản</Text>
                <Text style={styles.subtitle}>
                  Bắt đầu hành trình kết nối cùng KONEK.
                </Text>
              </View>

              <Text style={styles.groupLabel}>Bạn tham gia với vai trò</Text>
              <View accessibilityRole="radiogroup" style={styles.roleSelector}>
                <RoleTab
                  icon="person-outline"
                  label="Ứng viên"
                  onPress={() => setRole('candidate')}
                  selected={role === 'candidate'}
                />
                <RoleTab
                  icon="briefcase-outline"
                  label="Nhà tuyển dụng"
                  onPress={() => setRole('recruiter')}
                  selected={role === 'recruiter'}
                />
              </View>

              <View style={styles.form}>
                <FieldLabel label="Họ và tên đầy đủ" required />
                <InputShell error={errors.name} icon="person-outline">
                  <TextInput
                    accessibilityLabel="Họ và tên đầy đủ"
                    autoCapitalize="words"
                    autoComplete="name"
                    onChangeText={(value) => {
                      setName(value);
                      clearError('name');
                    }}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor={glassColors.placeholder}
                    returnKeyType="next"
                    selectionColor={WELCOME_COLORS.blue}
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
                    placeholder="Nhập email"
                    placeholderTextColor={glassColors.placeholder}
                    returnKeyType="next"
                    selectionColor={WELCOME_COLORS.blue}
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
                <InputShell error={errors.phone} icon="call-outline">
                  <TextInput
                    accessibilityLabel="Số điện thoại liên hệ"
                    autoComplete="tel"
                    keyboardType="phone-pad"
                    onChangeText={(value) => {
                      setPhone(value);
                      clearError('phone');
                    }}
                    placeholder="0912 345 678"
                    placeholderTextColor={glassColors.placeholder}
                    returnKeyType="next"
                    selectionColor={WELCOME_COLORS.blue}
                    style={styles.input}
                    textContentType="telephoneNumber"
                    value={phone}
                  />
                </InputShell>
                <FieldError message={errors.phone} />

                <FieldLabel label="Mật khẩu" required />
                <InputShell error={errors.password} icon="lock-closed-outline">
                  <TextInput
                    accessibilityLabel="Mật khẩu"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    onChangeText={(value) => {
                      setPassword(value);
                      clearError('password');
                    }}
                    placeholder="Tối thiểu 8 ký tự"
                    placeholderTextColor={glassColors.placeholder}
                    secureTextEntry={!showPassword}
                    selectionColor={WELCOME_COLORS.blue}
                    style={styles.input}
                    textContentType="newPassword"
                    value={password}
                  />
                  <PasswordToggle
                    onPress={() => setShowPassword((current) => !current)}
                    visible={showPassword}
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
                <InputShell error={errors.confirmPassword} icon="shield-checkmark-outline">
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
                    placeholderTextColor={glassColors.placeholder}
                    returnKeyType="done"
                    secureTextEntry={!showConfirmPassword}
                    selectionColor={WELCOME_COLORS.blue}
                    style={styles.input}
                    textContentType="newPassword"
                    value={confirmPassword}
                  />
                  <PasswordToggle
                    onPress={() => setShowConfirmPassword((current) => !current)}
                    visible={showConfirmPassword}
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
                  style={({ pressed }) => [styles.consentRow, pressed && styles.pressed]}
                >
                  <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                    {accepted ? (
                      <Ionicons color={WELCOME_COLORS.white} name="checkmark" size={18} />
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
                  <Ionicons color={WELCOME_COLORS.white} name="arrow-forward" size={22} />
                </Pressable>

                <Text style={styles.actionHint}>
                  Sau khi đăng ký, bạn có thể cập nhật hồ sơ trong ứng dụng.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Login')}
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
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

type RoleTabProps = {
  icon: 'person-outline' | 'briefcase-outline';
  label: string;
  onPress: () => void;
  selected: boolean;
};

function RoleTab({ icon, label, onPress, selected }: RoleTabProps) {
  return (
    <Pressable
      accessibilityLabel={`Đăng ký với vai trò ${label}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleTab,
        selected && styles.roleTabSelected,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons color={selected ? '#8FD9FF' : glassColors.icon} name={icon} size={22} />
      <Text style={[styles.roleTabText, selected && styles.roleTabTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
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
    <View style={[styles.inputShell, error && styles.inputShellError]}>
      <Ionicons color={glassColors.icon} name={icon} size={22} />
      {children}
    </View>
  );
}

function PasswordToggle({ onPress, visible }: { onPress: () => void; visible: boolean }) {
  return (
    <Pressable
      accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.passwordToggle, pressed && styles.pressed]}
    >
      <Ionicons
        color={glassColors.icon}
        name={visible ? 'eye-off-outline' : 'eye-outline'}
        size={23}
      />
    </Pressable>
  );
}

function FieldError({ message }: { message?: string }) {
  return (
    <View style={styles.errorSlot}>
      {message ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const glassColors = {
  fill: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.2)',
  borderHighlight: 'rgba(255, 255, 255, 0.32)',
  icon: 'rgba(200, 222, 255, 0.78)',
  placeholder: 'rgba(220, 233, 252, 0.52)',
} as const;

const styles = StyleSheet.create({
  background: {
    backgroundColor: WELCOME_BACKGROUND.base,
    flex: 1,
  },
  backgroundImage: { opacity: 0.72 },
  backgroundTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(1, 10, 34, 0.3)',
  },
  topRightGlow: {
    backgroundColor: 'rgba(143, 180, 255, 0.08)',
    borderBottomLeftRadius: 240,
    height: 190,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 240,
  },
  bottomShapeWash: {
    backgroundColor: 'rgba(23, 62, 138, 0.08)',
    borderTopRightRadius: 240,
    bottom: 0,
    height: 180,
    left: 0,
    position: 'absolute',
    width: '72%',
  },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  content: {
    alignSelf: 'center',
    maxWidth: 520,
    width: '100%',
  },
  logoButton: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 44,
  },
  pressed: { opacity: 0.72 },
  headingBlock: {
    marginTop: 18,
  },
  title: {
    color: WELCOME_COLORS.white,
    fontFamily: fontFamilies.bold,
    fontSize: 32,
    letterSpacing: -0.7,
    lineHeight: 39,
  },
  subtitle: {
    color: 'rgba(222, 235, 255, 0.74)',
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 7,
  },
  groupLabel: {
    color: 'rgba(239, 246, 255, 0.9)',
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 24,
  },
  roleSelector: {
    backgroundColor: glassColors.fill,
    borderColor: glassColors.border,
    borderRadius: 28,
    borderTopColor: glassColors.borderHighlight,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 9,
    padding: 5,
    shadowColor: '#020A20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  roleTab: {
    alignItems: 'center',
    borderRadius: 23,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 8,
  },
  roleTabSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: 'rgba(102, 196, 255, 0.62)',
    borderWidth: 1,
  },
  roleTabText: {
    color: 'rgba(220, 233, 252, 0.62)',
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
  },
  roleTabTextSelected: { color: WELCOME_COLORS.white },
  form: { marginTop: 12 },
  fieldLabel: {
    color: 'rgba(242, 247, 255, 0.9)',
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 7,
    marginTop: 12,
  },
  required: { color: '#FCA5A5' },
  inputShell: {
    alignItems: 'center',
    backgroundColor: glassColors.fill,
    borderColor: glassColors.border,
    borderRadius: 17,
    borderTopColor: glassColors.borderHighlight,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 15,
    shadowColor: '#020A20',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  inputShellError: {
    borderColor: 'rgba(248, 113, 113, 0.9)',
    borderTopColor: 'rgba(252, 165, 165, 0.9)',
  },
  input: {
    color: WELCOME_COLORS.white,
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 11,
    paddingVertical: 0,
  },
  passwordToggle: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  errorSlot: {
    minHeight: 22,
    paddingHorizontal: 3,
  },
  errorText: {
    color: '#FCA5A5',
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 18,
    paddingTop: 3,
  },
  helperText: {
    color: 'rgba(203, 220, 245, 0.62)',
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  passwordStrengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strengthTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    height: 5,
    marginTop: 7,
    overflow: 'hidden',
  },
  strengthValue: {
    backgroundColor: 'rgba(143, 180, 255, 0.38)',
    height: '100%',
    width: '28%',
  },
  strengthValueValid: {
    backgroundColor: '#38BDF8',
    width: '100%',
  },
  consentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    minHeight: 48,
    paddingVertical: 4,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: glassColors.fill,
    borderColor: glassColors.borderHighlight,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 23,
    justifyContent: 'center',
    width: 23,
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#7DD3FC',
  },
  consentText: {
    color: 'rgba(229, 239, 255, 0.78)',
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0878F9',
    borderColor: 'rgba(105, 220, 255, 0.84)',
    borderRadius: 29,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 58,
    paddingHorizontal: 18,
    shadowColor: '#0878F9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  primaryButtonPressed: {
    backgroundColor: '#0969DB',
    shadowOpacity: 0.12,
  },
  primaryButtonText: {
    color: WELCOME_COLORS.white,
    flexShrink: 1,
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  actionHint: {
    color: 'rgba(203, 220, 245, 0.58)',
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 48,
  },
  loginHint: {
    color: 'rgba(224, 237, 255, 0.76)',
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  loginLink: {
    color: '#59D5FF',
    fontFamily: fontFamilies.bold,
  },
});
