import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  Alert,
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
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { HrTabParamList, RootStackParamList } from '../../../../types/navigation';

type Profile = {
  fullName: string;
  email: string;
  phone: string;
  position: string;
};

const initialProfile: Profile = {
  fullName: 'Nguyễn Hoàng Nam',
  email: '',
  phone: '090 123 4567',
  position: '',
};

type Company = {
  name: string;
  description: string;
  industry: string;
  size: string;
  website: string;
  logoUrl: string;
};

type Location = {
  address: string;
  city: string;
  country: string;
};

const initialCompany: Company = {
  name: '',
  description: '',
  industry: '',
  size: '',
  website: '',
  logoUrl: '',
};

const createEmptyLocation = (): Location => ({
  address: '',
  city: '',
  country: '',
});

const requiredProfileFields = ['fullName', 'email'] as const;

const getRequiredFieldMessage = (profile: Profile, company: Company) => {
  if (requiredProfileFields.some((field) => !profile[field].trim())) {
    return 'Vui lòng nhập họ tên và email.';
  }
  if (!company.name.trim()) {
    return 'Vui lòng nhập tên doanh nghiệp.';
  }
  return null;
};

export function HrSettingsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<HrTabParamList>>();
  const rootNavigation =
    navigation.getParent<NavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState(initialProfile);
  const [company, setCompany] = useState(initialCompany);
  const [locations, setLocations] = useState([createEmptyLocation()]);
  const [hasSaved, setHasSaved] = useState(false);

  const updateField = (field: keyof Profile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setHasSaved(false);
  };

  const updateCompanyField = (field: keyof Company, value: string) => {
    setCompany((current) => ({ ...current, [field]: value }));
    setHasSaved(false);
  };

  const updateLocationField = (
    index: number,
    field: keyof Location,
    value: string,
  ) => {
    setLocations((current) =>
      current.map((location, locationIndex) =>
        locationIndex === index
          ? { ...location, [field]: value }
          : location,
      ),
    );
    setHasSaved(false);
  };

  const saveProfile = () => {
    const requiredFieldMessage = getRequiredFieldMessage(profile, company);
    if (requiredFieldMessage) {
      Alert.alert('Thiếu thông tin', requiredFieldMessage);
      return;
    }

    setHasSaved(true);
    Alert.alert(
      'Đã lưu thay đổi',
      'Thông tin được cập nhật trong phiên hiện tại (bản mô phỏng).',
    );
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
      rootNavigation?.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      Alert.alert(
        'Không thể đăng xuất',
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi xóa thông tin phiên.',
      );
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Đăng xuất tài khoản',
      'Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc trên thiết bị này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            void logout();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Text style={styles.pageTitle}>Cài đặt</Text>
            <Text style={styles.pageDescription}>
              Quản lý thông tin cá nhân và hồ sơ doanh nghiệp của bạn.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.cardHeading}>
              <View style={styles.headingIcon}>
                <Ionicons
                  color={colors.light.brand.secondary}
                  name="person-outline"
                  size={19}
                />
              </View>
              <View style={styles.headingCopy}>
                <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
                <Text style={styles.cardSubtitle}>
                  Thông tin liên hệ của người đại diện tuyển dụng.
                </Text>
              </View>
            </View>

            <View style={styles.fields}>
              <FormField
                autoCapitalize="words"
                label="Họ và tên"
                maxLength={120}
                onChangeText={(value) => updateField('fullName', value)}
                placeholder="Nhập họ và tên"
                required
                value={profile.fullName}
              />
              <FormField
                autoCapitalize="none"
                keyboardType="email-address"
                label="Email"
                maxLength={254}
                onChangeText={(value) => updateField('email', value)}
                placeholder="name@company.com"
                required
                value={profile.email}
              />
              <FormField
                keyboardType="phone-pad"
                label="Số điện thoại"
                maxLength={30}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="Nhập số điện thoại"
                value={profile.phone}
              />
              <FormField
                autoCapitalize="words"
                label="Chức vụ"
                maxLength={120}
                onChangeText={(value) => updateField('position', value)}
                placeholder="Ví dụ: Chuyên viên tuyển dụng"
                value={profile.position}
              />
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.cardHeading}>
              <View style={styles.headingIcon}>
                <Ionicons
                  color={colors.light.brand.secondary}
                  name="business-outline"
                  size={19}
                />
              </View>
              <View style={styles.headingCopy}>
                <Text style={styles.cardTitle}>Thông tin doanh nghiệp</Text>
                <Text style={styles.cardSubtitle}>
                  Giới thiệu doanh nghiệp để ứng viên hiểu hơn về bạn.
                </Text>
              </View>
            </View>

            <View style={styles.fields}>
              <FormField
                autoCapitalize="words"
                label="Tên doanh nghiệp"
                maxLength={160}
                onChangeText={(value) => updateCompanyField('name', value)}
                placeholder="Nhập tên doanh nghiệp"
                required
                value={company.name}
              />
              <FormField
                label="Ngành nghề"
                maxLength={120}
                onChangeText={(value) => updateCompanyField('industry', value)}
                placeholder="Ví dụ: Công nghệ thông tin"
                value={company.industry}
              />
              <FormField
                label="Quy mô doanh nghiệp"
                maxLength={120}
                onChangeText={(value) => updateCompanyField('size', value)}
                placeholder="Ví dụ: 50–200 nhân viên"
                value={company.size}
              />
              <FormField
                autoCapitalize="none"
                keyboardType="url"
                label="Website"
                maxLength={2048}
                onChangeText={(value) => updateCompanyField('website', value)}
                placeholder="https://congty.com"
                value={company.website}
              />
              <FormField
                autoCapitalize="none"
                keyboardType="url"
                label="Đường dẫn logo"
                maxLength={2048}
                onChangeText={(value) => updateCompanyField('logoUrl', value)}
                placeholder="https://congty.com/logo.png"
                helperText="Dán đường dẫn logo công khai của doanh nghiệp."
                value={company.logoUrl}
              />
              <FormField
                label="Mô tả doanh nghiệp"
                maxLength={2000}
                multiline
                onChangeText={(value) =>
                  updateCompanyField('description', value)
                }
                placeholder="Chia sẻ về lĩnh vực hoạt động, văn hóa và môi trường làm việc..."
                value={company.description}
              />
            </View>

            <View style={styles.locationsSection}>
              <View style={styles.locationHeader}>
                <View style={styles.locationHeaderCopy}>
                  <Text style={styles.locationSectionTitle}>
                    Địa điểm doanh nghiệp
                  </Text>
                  <Text style={styles.locationDescription}>
                    Thêm địa chỉ văn phòng hoặc địa điểm làm việc.
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setLocations((current) => [
                      ...current,
                      createEmptyLocation(),
                    ]);
                    setHasSaved(false);
                  }}
                  style={styles.addLocationButton}
                >
                  <Ionicons
                    color={colors.light.brand.secondary}
                    name="add"
                    size={18}
                  />
                  <Text style={styles.addLocationText}>Thêm địa điểm</Text>
                </Pressable>
              </View>

              {locations.map((location, index) => (
                <View key={index} style={styles.locationCard}>
                  <View style={styles.locationTitleRow}>
                    <Text style={styles.locationTitle}>
                      Địa điểm {index + 1}
                    </Text>
                    {locations.length > 1 && (
                      <Pressable
                        accessibilityLabel={`Xóa địa điểm ${index + 1}`}
                        accessibilityRole="button"
                        onPress={() => {
                          setLocations((current) =>
                            current.filter(
                              (_, locationIndex) => locationIndex !== index,
                            ),
                          );
                          setHasSaved(false);
                        }}
                        style={styles.removeLocationButton}
                      >
                        <Text style={styles.removeLocationText}>Xóa</Text>
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.fields}>
                    <FormField
                      label="Địa chỉ"
                      maxLength={240}
                      onChangeText={(value) =>
                        updateLocationField(index, 'address', value)
                      }
                      placeholder="Số nhà, tên đường"
                      value={location.address}
                    />
                    <FormField
                      autoCapitalize="words"
                      label="Thành phố"
                      maxLength={120}
                      onChangeText={(value) =>
                        updateLocationField(index, 'city', value)
                      }
                      placeholder="Nhập thành phố"
                      value={location.city}
                    />
                    <FormField
                      autoCapitalize="words"
                      label="Quốc gia"
                      maxLength={120}
                      onChangeText={(value) =>
                        updateLocationField(index, 'country', value)
                      }
                      placeholder="Nhập quốc gia"
                      value={location.country}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {hasSaved && (
            <View style={styles.savedNotice}>
              <Ionicons
                color={colors.light.status.success}
                name="checkmark-circle"
                size={16}
              />
              <Text style={styles.savedNoticeText}>
                Thông tin đã được lưu.
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={saveProfile}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              color={colors.light.text.inverse}
              name="save-outline"
              size={18}
            />
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          </Pressable>

          <View style={styles.logoutCard}>
            <View style={styles.logoutHeading}>
              <View style={styles.logoutIcon}>
                <Ionicons
                  color={colors.light.status.danger}
                  name="log-out-outline"
                  size={19}
                />
              </View>
              <Text style={styles.logoutTitle}>Đăng xuất tài khoản</Text>
            </View>
            <Text style={styles.logoutDescription}>
              Đăng xuất khỏi phiên làm việc hiện tại trên thiết bị này.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={confirmLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                color={colors.light.status.danger}
                name="log-out-outline"
                size={18}
              />
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormFieldProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  helperText?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  label: string;
  maxLength: number;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value: string;
};

function FormField({
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  helperText,
  label,
  maxLength,
  multiline = false,
  onChangeText,
  placeholder,
  required = false,
  value,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredMarker}> *</Text>}
      </Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.light.text.secondary}
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        returnKeyType="next"
      />
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.light.background.primary,
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  intro: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  pageTitle: {
    color: colors.light.text.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  pageDescription: {
    color: colors.light.text.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    padding: spacing.md,
  },
  cardHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headingIcon: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.accent,
    borderRadius: 9,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headingCopy: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.light.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: colors.light.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  fields: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.light.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  requiredMarker: {
    color: colors.light.status.danger,
  },
  input: {
    backgroundColor: colors.light.background.input,
    borderColor: colors.light.border.subtle,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.light.text.primary,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    color: colors.light.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  locationsSection: {
    borderTopColor: colors.light.border.subtle,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.md,
  },
  locationHeader: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  locationHeaderCopy: {
    gap: 3,
  },
  locationSectionTitle: {
    color: colors.light.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  locationDescription: {
    color: colors.light.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  addLocationButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    minHeight: 36,
  },
  addLocationText: {
    color: colors.light.brand.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  locationCard: {
    backgroundColor: colors.light.background.primary,
    borderColor: colors.light.border.subtle,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  locationTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationTitle: {
    color: colors.light.text.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  removeLocationButton: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  removeLocationText: {
    color: colors.light.status.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  savedNotice: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  savedNoticeText: {
    color: colors.light.status.success,
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.secondary,
    borderRadius: 9,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  saveButtonText: {
    color: colors.light.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  logoutCard: {
    backgroundColor: colors.light.background.surface,
    borderColor: '#FECACA',
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  logoutHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  logoutIcon: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  logoutTitle: {
    color: colors.light.status.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  logoutDescription: {
    color: colors.light.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  logoutButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#FECACA',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  logoutButtonText: {
    color: colors.light.status.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
