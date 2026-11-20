import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '../../../theme';
import type { RootStackParamList } from '../../../types/navigation';
import { KonekLogo } from '../components/KonekLogo';
import { LoginIllustration } from '../components/LoginIllustration';
import { WELCOME_BACKGROUND, WELCOME_COLORS } from '../components/welcome.constants';
import { ApiError, loginApi, saveAuthSession } from '../api/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type Role = 'candidate' | 'recruiter';

type LoginErrors = {
  identifier?: string;
  password?: string;
};

export function LoginScreen({ navigation }: Props) {
  const { height } = useWindowDimensions();
  const compact = height < 760;
  const [role, setRole] = useState<Role>('candidate');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const illustrationHeight = compact ? 180 : Math.min(252, height * 0.28);

  const clearError = (field: keyof LoginErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: LoginErrors = {};
    const normalizedEmail = identifier.trim().toLowerCase();

    if (!normalizedEmail) {
      nextErrors.identifier = 'Vui lòng nhập địa chỉ email.';
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.identifier = 'Địa chỉ email chưa đúng định dạng.';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleDevLoginHr = () => {
    navigation.reset({ index: 0, routes: [{ name: 'HrTabs' }] });
  };

  const handleDevLoginCandidate = () => {
    navigation.reset({ index: 0, routes: [{ name: 'CandidateTabs' }] });
  };

  const handleLogin = async () => {
    if (loading || !validateForm()) return;

    setLoading(true);
    setLoginError('');

    try {
      const data = await loginApi({
        email: identifier.trim().toLowerCase(),
        password,
      });

      await saveAuthSession(data);

      const destination = data.role === 'candidate'
        ? 'CandidateTabs'
        : data.needsCompany ? 'HrCreateCompany' : 'HrTabs';
      navigation.reset({
        index: 0,
        routes: [{ name: destination }],
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setLoginError('Email hoặc mật khẩu không chính xác.');
        } else if (error.status === 403) {
          setLoginError('Tài khoản đã bị khóa hoặc chưa được kích hoạt.');
        } else {
          setLoginError(error.message);
        }
        return;
      }

      if (error instanceof TypeError) {
        setLoginError('Không thể kết nối tới máy chủ. Hãy kiểm tra địa chỉ API và mạng.');
        return;
      }

      setLoginError(
        error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đăng nhập.',
      );
    } finally {
      setLoading(false);
    }
  };

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
            contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Pressable
                accessibilityLabel="Quay lại màn hình chào mừng"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.logoButton, pressed && styles.pressed]}
              >
                <KonekLogo inverse />
              </Pressable>

              <LoginIllustration height={illustrationHeight} />

              <View style={[styles.heroCopy, compact && styles.heroCopyCompact]}>
                <Text style={[styles.title, compact && styles.titleCompact]}>
                  Chào mừng trở lại!
                </Text>
                <Text style={styles.subtitle}>
                  Đăng nhập để tiếp tục hành trình cùng KONEK.
                </Text>
              </View>


              <View style={styles.form}>
                <View style={[styles.inputShell, errors.identifier && styles.inputShellError]}>
                  <View pointerEvents="none" style={styles.glassHighlight} />
                  <Ionicons color={stylesVars.icon} name="mail-outline" size={23} />
                  <TextInput
                    accessibilityLabel="Email hoặc số điện thoại"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onChangeText={(value) => {
                      setIdentifier(value);
                      clearError('identifier');
                    }}
                    placeholder="Email hoặc số điện thoại"
                    placeholderTextColor={stylesVars.placeholder}
                    returnKeyType="next"
                    selectionColor={WELCOME_COLORS.blue}
                    style={styles.input}
                    textContentType="emailAddress"
                    value={identifier}
                  />
                </View>
                <FieldError message={errors.identifier} />

                <View style={[styles.inputShell, errors.password && styles.inputShellError]}>
                  <Ionicons color={stylesVars.icon} name="lock-closed-outline" size={22} />
                  <TextInput
                    accessibilityLabel="Mật khẩu"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    onChangeText={(value) => {
                      setPassword(value);
                      clearError('password');
                    }}
                    onSubmitEditing={handleLogin}
                    placeholder="Mật khẩu"
                    placeholderTextColor={stylesVars.placeholder}
                    returnKeyType="done"
                    secureTextEntry={!showPassword}
                    selectionColor={WELCOME_COLORS.blue}
                    style={styles.input}
                    textContentType="password"
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setShowPassword((current) => !current)}
                    style={({ pressed }) => [styles.passwordToggle, pressed && styles.pressed]}
                  >
                    <Ionicons
                      color={stylesVars.icon}
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
                        <Ionicons color={WELCOME_COLORS.white} name="checkmark" size={17} />
                      ) : null}
                    </View>
                    <Text style={styles.optionText}>Ghi nhớ đăng nhập</Text>
                  </Pressable>

                  <Pressable
                    accessibilityLabel="Quên mật khẩu, sắp có"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: true }}
                    disabled
                    style={styles.forgotButton}
                  >
                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                  </Pressable>
                </View>

                {loginError ? (
                  <View style={styles.loginErrorBanner}>
                    <Ionicons color="#FCA5A5" name="alert-circle-outline" size={20} />
                    <Text accessibilityLiveRegion="polite" style={styles.loginErrorText}>
                      {loginError}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ busy: loading, disabled: loading }}
                  disabled={loading}
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && !loading && styles.primaryButtonPressed,
                    loading && styles.primaryButtonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={WELCOME_COLORS.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Đăng nhập</Text>
                  )}
                </Pressable>

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

                {__DEV__ ? (
                  <View style={styles.devExperienceSection}>
                    <View style={styles.devExperienceHeading}>
                      <View style={styles.devExperienceLine} />
                      <Text style={styles.devExperienceLabel}>Chế độ trải nghiệm</Text>
                      <View style={styles.devExperienceLine} />
                    </View>

                    <View style={styles.devExperienceButtons}>
                      <Pressable
                        accessibilityHint="Mở thẳng giao diện ứng viên mà không cần đăng nhập"
                        accessibilityLabel="Trải nghiệm với vai trò ứng viên"
                        accessibilityRole="button"
                        onPress={handleDevLoginCandidate}
                        style={({ pressed }) => [
                          styles.devExperienceButton,
                          pressed && styles.devExperienceButtonPressed,
                        ]}
                      >
                        <Ionicons
                          color={WELCOME_COLORS.white}
                          name="person-outline"
                          size={19}
                        />
                        <Text style={styles.devExperienceButtonText}>DEV Candidate</Text>
                      </Pressable>

                      <Pressable
                        accessibilityHint="Mở thẳng giao diện nhà tuyển dụng mà không cần đăng nhập"
                        accessibilityLabel="Trải nghiệm với vai trò nhà tuyển dụng"
                        accessibilityRole="button"
                        onPress={handleDevLoginHr}
                        style={({ pressed }) => [
                          styles.devExperienceButton,
                          pressed && styles.devExperienceButtonPressed,
                        ]}
                      >
                        <Ionicons
                          color={WELCOME_COLORS.white}
                          name="briefcase-outline"
                          size={19}
                        />
                        <Text style={styles.devExperienceButtonText}>DEV HR</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </View>
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
  onLongPress?: () => void;
  onPress: () => void;
  selected: boolean;
};

function RoleTab({ icon, label, onLongPress, onPress, selected }: RoleTabProps) {
  return (
    <Pressable
      accessibilityLabel={`Đăng nhập với vai trò ${label}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      delayLongPress={650}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleTab,
        selected && styles.roleTabSelected,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons color={selected ? WELCOME_COLORS.white : stylesVars.icon} name={icon} size={24} />
      <Text style={[styles.roleTabText, selected && styles.roleTabTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function DisabledSocialButton({
  color,
  icon,
  label,
}: {
  color: string;
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
      <Ionicons color={color} name={icon} size={28} />
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

const stylesVars = {
  icon: 'rgba(176, 208, 255, 0.82)',
  placeholder: 'rgba(204, 222, 248, 0.58)',
} as const;

const styles = StyleSheet.create({
  background: {
    backgroundColor: WELCOME_BACKGROUND.base,
    flex: 1,
  },
  backgroundImage: { opacity: 0.68 },
  backgroundTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 12, 40, 0.46)',
  },
  topRightGlow: {
    backgroundColor: 'rgba(143, 180, 255, 0.12)',
    borderBottomLeftRadius: 240,
    height: 190,
    position: 'absolute',
    right: 0,
    shadowColor: WELCOME_BACKGROUND.highlight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 38,
    top: 0,
    width: 240,
  },
  bottomShapeWash: {
    backgroundColor: 'rgba(23, 62, 138, 0.12)',
    borderTopRightRadius: 240,
    bottom: 0,
    height: 180,
    left: 0,
    position: 'absolute',
    width: '74%',
  },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  scrollContentCompact: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  content: {
    alignSelf: 'center',
    maxWidth: 520,
    width: '100%',
  },
  logoButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72 },
  heroCopy: {
    alignItems: 'center',
    marginTop: 8,
  },
  heroCopyCompact: { marginTop: 2 },
  title: {
    color: WELCOME_COLORS.white,
    fontFamily: fontFamilies.bold,
    fontSize: 32,
    letterSpacing: -0.7,
    lineHeight: 39,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    color: 'rgba(216, 230, 250, 0.76)',
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 7,
    maxWidth: 410,
    textAlign: 'center',
  },
  roleTabs: {
    backgroundColor: 'rgba(25, 66, 130, 0.52)',
    borderColor: 'rgba(145, 205, 255, 0.3)',
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 24,
    padding: 5,
    shadowColor: '#0E8BFF',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  roleTab: {
    alignItems: 'center',
    borderRadius: 27,
    flex: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 8,
  },
  roleTabSelected: {
    backgroundColor: '#0878F9',
    borderColor: 'rgba(113, 221, 255, 0.72)',
    borderWidth: 1,
    shadowColor: '#20A4FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  roleTabText: {
    color: 'rgba(206, 224, 250, 0.66)',
    fontFamily: fontFamilies.semibold,
    fontSize: 15,
  },
  roleTabTextSelected: { color: WELCOME_COLORS.white },
  form: { marginTop: 18 },
  inputShell: {
  alignItems: 'center',
  flexDirection: 'row',

  // Fill trắng 2% giống Figma
  backgroundColor: 'rgba(255, 255, 255, 0.02)',

  // Viền kính mảnh
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.18)',
  borderTopColor: 'rgba(255, 255, 255, 0.38)',
  borderBottomColor: 'rgba(143, 180, 255, 0.14)',

  // Figma radius 999
  borderRadius: 999,

  minHeight: 58,
  paddingHorizontal: 18,
  overflow: 'hidden',

  // Độ sâu nhẹ, không làm kính bị đục
  shadowColor: '#06132F',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.22,
  shadowRadius: 16,

  elevation: 3,
},
glassHighlight: {
  position: 'absolute',
  top: 0,
  left: 24,
  right: 24,
  height: 1,

  backgroundColor: 'rgba(255, 255, 255, 0.7)',

  shadowColor: '#FFFFFF',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.35,
  shadowRadius: 5,
},
  inputShellError: {
    borderColor: 'rgba(248, 113, 113, 0.9)',
  },
  input: {
    color: WELCOME_COLORS.white,
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  passwordToggle: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  errorSlot: {
    minHeight: 24,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#FCA5A5',
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 18,
    paddingTop: 3,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  rememberButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    minHeight: 44,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: 'rgba(26, 65, 125, 0.62)',
    borderColor: 'rgba(170, 210, 255, 0.62)',
    borderRadius: 6,
    borderWidth: 1.5,
    height: 23,
    justifyContent: 'center',
    width: 23,
  },
  checkboxChecked: {
    backgroundColor: '#0878F9',
    borderColor: '#5BC7FF',
  },
  optionText: {
    color: 'rgba(236, 244, 255, 0.88)',
    fontFamily: fontFamilies.regular,
    fontSize: 13,
  },
  forgotButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    opacity: 0.82,
  },
  forgotText: {
    color: '#59D5FF',
    fontFamily: fontFamilies.semibold,
    fontSize: 13,
  },
  loginErrorBanner: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(252, 165, 165, 0.3)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginBottom: 4,
    marginTop: 4,
    padding: 12,
  },
  loginErrorText: {
    color: '#FCA5A5',
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0878F9',
    borderColor: 'rgba(104, 224, 255, 0.86)',
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 60,
    paddingHorizontal: 20,
    shadowColor: '#0A8DFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.34,
    shadowRadius: 17,
  },
  primaryButtonPressed: {
    backgroundColor: '#0969DB',
    shadowOpacity: 0.2,
  },
  primaryButtonDisabled: { opacity: 0.58 },
  primaryButtonText: {
    color: WELCOME_COLORS.white,
    fontFamily: fontFamilies.bold,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  divider: {
    backgroundColor: 'rgba(167, 199, 240, 0.38)',
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: 'rgba(232, 241, 255, 0.84)',
    fontFamily: fontFamilies.regular,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(35, 79, 145, 0.52)',
    borderColor: 'rgba(151, 210, 255, 0.32)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    opacity: 0.72,
    shadowColor: '#051431',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  registerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 48,
  },
  registerHint: {
    color: 'rgba(224, 237, 255, 0.78)',
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  registerLink: {
    color: '#59D5FF',
    fontFamily: fontFamilies.bold,
  },
  devExperienceSection: {
    marginTop: 6,
  },
  devExperienceHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  devExperienceLine: {
    backgroundColor: 'rgba(167, 199, 240, 0.22)',
    flex: 1,
    height: 1,
  },
  devExperienceLabel: {
    color: 'rgba(204, 222, 248, 0.58)',
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  devExperienceButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  devExperienceButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(174, 215, 255, 0.28)',
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 10,
  },
  devExperienceButtonPressed: {
    backgroundColor: 'rgba(37, 99, 235, 0.22)',
    borderColor: 'rgba(91, 199, 255, 0.7)',
    opacity: 0.84,
  },
  devExperienceButtonText: {
    color: WELCOME_COLORS.white,
    fontFamily: fontFamilies.semibold,
    fontSize: 13,
  },
});
