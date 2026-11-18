import {
  useFocusEffect,
  useNavigation,
  type NavigationProp,
} from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radii, spacing, typography } from "../../../../theme";
import type { RootStackParamList } from "../../../../types/navigation";
import { HrFormField } from "../../components/HrFormField";
import type { HrSettingsLocation } from "../../settings/api/hrSettingsApi";
import { hrCompanyApi } from "../api/hrCompanyApi";

const initialCompany = {
  name: "",
  industry: "",
  size: "",
  website: "",
  description: "",
};
const companyFields = {
  name: {
    label: "Tên doanh nghiệp",
    placeholder: "Nhập tên doanh nghiệp",
    maxLength: 160,
  },
  industry: {
    label: "Ngành nghề",
    placeholder: "Ví dụ: Thiết kế sản phẩm",
    maxLength: 120,
  },
  size: {
    label: "Quy mô doanh nghiệp",
    placeholder: "Ví dụ: 11–50 nhân viên",
    maxLength: 120,
  },
  website: {
    label: "Website",
    placeholder: "https://congty.vn",
    maxLength: 2048,
  },
  description: {
    label: "Mô tả doanh nghiệp",
    placeholder: "Giới thiệu về doanh nghiệp",
    maxLength: 2000,
  },
};
const locationFields = {
  address: {
    label: "Địa chỉ",
    placeholder: "Số nhà, tên đường",
    maxLength: 240,
  },
  city: {
    label: "Thành phố",
    placeholder: "Nhập tỉnh, thành phố",
    maxLength: 120,
  },
  country: { label: "Quốc gia", placeholder: "Nhập quốc gia", maxLength: 120 },
};
type CompanyKey = keyof typeof initialCompany;
type LocationKey = keyof HrSettingsLocation;
const locationKeys: LocationKey[] = ["address", "city", "country"];
const requiredCompanyKeys: CompanyKey[] = [
  "name",
  "industry",
  "size",
  "description",
];
const newLocation = (id: number) => ({
  id,
  address: "",
  city: "",
  country: "",
});
const photoTypes = ["image/jpeg", "image/png"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const palette = colors.light;

function releaseLogo(asset?: DocumentPicker.DocumentPickerAsset | null) {
  if (Platform.OS === "web" && asset?.uri.startsWith("blob:"))
    URL.revokeObjectURL(asset.uri);
}

export function HrCreateCompanyScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [step, setStep] = useState<1 | 2>(1);
  const [company, setCompany] = useState(initialCompany);
  const [locations, setLocations] = useState([newLocation(0)]);
  const nextLocationId = useRef(1);
  const [logo, setLogo] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [logoError, setLogoError] = useState("");
  const [picking, setPicking] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submitLock = useRef(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => () => releaseLogo(logo), [logo]);

  const changeStep = useCallback((destination: 1 | 2) => {
    Keyboard.dismiss();
    setStep(destination);
    setAttempted(false);
    setError("");
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (submitLock.current) return true;
          if (step === 1) return false;
          changeStep(1);
          return true;
        },
      );
      return () => subscription.remove();
    }, [step, changeStep]),
  );

  async function pickLogo() {
    if (picking) return;
    setLogoError("");
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: photoTypes,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      const supported = asset.mimeType
        ? photoTypes.includes(asset.mimeType)
        : /\.(png|jpe?g)$/i.test(asset.name);
      if (
        !supported ||
        (asset.size !== undefined && asset.size > MAX_LOGO_BYTES)
      ) {
        releaseLogo(asset);
        setLogoError("Vui lòng chọn ảnh PNG hoặc JPEG tối đa 2 MB.");
        return;
      }
      setLogo(asset);
    } catch {
      setLogoError("Không mở được ảnh. Vui lòng chọn lại.");
    } finally {
      setPicking(false);
    }
  }

  const next = () => {
    if (requiredCompanyKeys.some((key) => !company[key].trim())) {
      setAttempted(true);
      return;
    }
    changeStep(2);
  };

  async function save() {
    if (submitLock.current) return;
    setAttempted(true);
    if (
      locations.some((location) =>
        locationKeys.some((key) => !location[key].trim()),
      )
    )
      return;
    setError("");
    submitLock.current = true;
    setSaving(true);
    try {
      await hrCompanyApi.create(
        {
          name: company.name.trim(),
          industry: company.industry.trim(),
          size: company.size.trim(),
          website: company.website.trim(),
          description: company.description.trim(),
          locations: locations.map(({ address, city, country }) => ({
            address: address.trim(),
            city: city.trim(),
            country: country.trim(),
          })),
        },
        logo,
      );
      navigation.reset({ index: 0, routes: [{ name: "HrTabs" }] });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể tạo công ty. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
      submitLock.current = false;
    }
  }

  function renderCompanyField(key: CompanyKey) {
    const required = key !== "website";
    return (
      <HrFormField
        key={key}
        {...companyFields[key]}
        onboarding
        required={required}
        value={company[key]}
        autoCapitalize={key === "website" ? "none" : "sentences"}
        keyboardType={key === "website" ? "url" : "default"}
        multiline={key === "description"}
        onChangeText={(value) =>
          setCompany((current) => ({ ...current, [key]: value }))
        }
        error={
          attempted && required && !company[key].trim()
            ? "Vui lòng điền trường này."
            : undefined
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.form}>
            <View style={styles.titleGroup}>
              <Text style={styles.secondary}>Nhà tuyển dụng</Text>
              <Text accessibilityRole="header" style={styles.title}>
                Tạo công ty
              </Text>
            </View>
            <View
              style={styles.row}
              accessible
              accessibilityLabel={`Bước ${step} trên 2`}
            >
              <Text style={styles.secondary}>Bước {step}/2</Text>
              <View style={[styles.bar, styles.activeBar]} />
              <View style={[styles.bar, step === 2 && styles.activeBar]} />
            </View>
            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.heading}>
                {step === 1 ? "Thông tin doanh nghiệp" : "Địa điểm làm việc"}
              </Text>
              {step === 1 ? (
                <>
                  {renderCompanyField("name")}
                  {renderCompanyField("industry")}
                  {renderCompanyField("size")}
                  {renderCompanyField("website")}
                  <View style={styles.field}>
                    <Text style={styles.label}>Logo doanh nghiệp</Text>
                    <View style={styles.row}>
                      {logo ? (
                        <Image
                          source={{ uri: logo.uri }}
                          accessibilityLabel="Logo đã chọn"
                          resizeMode="contain"
                          style={styles.logo}
                        />
                      ) : (
                        <View style={[styles.logo, styles.initial]}>
                          <Text style={styles.initialText}>
                            {Array.from(
                              company.name.trim(),
                            )[0]?.toLocaleUpperCase("vi") || "–"}
                          </Text>
                        </View>
                      )}
                      <Pressable
                        style={styles.outline}
                        accessibilityRole="button"
                        disabled={picking}
                        onPress={pickLogo}
                      >
                        <Text style={styles.buttonText}>
                          {logo ? "Đổi ảnh" : "Chọn ảnh"}
                        </Text>
                      </Pressable>
                      {logo && (
                        <Pressable
                          style={styles.textButton}
                          accessibilityRole="button"
                          onPress={() => {
                            setLogo(null);
                            setLogoError("");
                          }}
                        >
                          <Text style={styles.remove}>Gỡ ảnh</Text>
                        </Pressable>
                      )}
                    </View>
                    <Text style={styles.help}>PNG hoặc JPEG, tối đa 2 MB.</Text>
                    {!!logoError && (
                      <Text
                        accessibilityLiveRegion="polite"
                        style={styles.error}
                      >
                        {logoError}
                      </Text>
                    )}
                  </View>
                  {renderCompanyField("description")}
                </>
              ) : (
                <>
                  {locations.map((location, index) => (
                    <View key={location.id} style={styles.group}>
                      <View style={styles.between}>
                        <Text style={styles.label}>Địa điểm {index + 1}</Text>
                        {locations.length > 1 && (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Xóa địa điểm ${index + 1}`}
                            disabled={saving}
                            style={styles.textButton}
                            onPress={() =>
                              setLocations((current) =>
                                current.filter(
                                  (item) => item.id !== location.id,
                                ),
                              )
                            }
                          >
                            <Text style={styles.remove}>Xóa</Text>
                          </Pressable>
                        )}
                      </View>
                      {locationKeys.map((key) => (
                        <HrFormField
                          {...locationFields[key]}
                          key={key}
                          onboarding
                          required
                          editable={!saving}
                          value={location[key]}
                          autoCapitalize="words"
                          error={
                            attempted && !location[key].trim()
                              ? "Vui lòng điền trường này."
                              : undefined
                          }
                          onChangeText={(value) =>
                            setLocations((current) =>
                              current.map((item) =>
                                item.id === location.id
                                  ? { ...item, [key]: value }
                                  : item,
                              ),
                            )
                          }
                        />
                      ))}
                    </View>
                  ))}
                  <Pressable
                    accessibilityRole="button"
                    disabled={saving}
                    style={styles.outline}
                    onPress={() => {
                      const location = newLocation(nextLocationId.current++);
                      setLocations((current) => [...current, location]);
                    }}
                  >
                    <Text style={styles.buttonText}>+ Thêm địa điểm</Text>
                  </Pressable>
                </>
              )}
            </View>
            {!!error && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            )}
            <View style={styles.row}>
              {step === 2 && (
                <Pressable
                  accessibilityRole="button"
                  style={styles.outline}
                  disabled={saving}
                  onPress={() => changeStep(1)}
                >
                  <Text style={styles.buttonText}>Quay lại</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: saving || picking,
                  busy: saving,
                }}
                disabled={saving || picking}
                style={[styles.primary, (saving || picking) && styles.disabled]}
                onPress={step === 1 ? next : save}
              >
                {saving && (
                  <ActivityIndicator
                    color={palette.text.inverse}
                    size="small"
                  />
                )}
                <Text style={styles.primaryText}>
                  {step === 1
                    ? "Tiếp tục"
                    : saving
                      ? "Đang tạo công ty…"
                      : "Tạo công ty"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1, backgroundColor: palette.background.surface },
  scroll: { alignItems: "center" },
  form: {
    width: "100%",
    maxWidth: 440,
    padding: 20,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  titleGroup: { gap: spacing.xs },
  secondary: { ...typography.titleSmall, color: palette.text.secondary },
  title: { ...typography.headlineLarge, color: palette.text.primary },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bar: {
    height: 4,
    borderRadius: radii.full,
    flex: 1,
    backgroundColor: palette.border.subtle,
  },
  activeBar: { backgroundColor: palette.brand.secondary },
  section: {
    borderTopWidth: 1,
    borderTopColor: palette.border.subtle,
    paddingTop: 20,
    gap: spacing.md,
  },
  heading: { ...typography.headlineSmall, color: palette.text.primary },
  field: { gap: spacing.xs },
  group: { gap: spacing.md },
  label: { ...typography.titleSmall, color: palette.text.primary },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: palette.background.subtle,
  },
  initial: { justifyContent: "center", alignItems: "center" },
  initialText: { ...typography.headlineSmall, color: palette.brand.primary },
  help: { ...typography.bodySmall, color: palette.text.secondary },
  error: { ...typography.bodyMedium, color: palette.feedback.dangerText },
  textButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  remove: { ...typography.titleSmall, color: palette.feedback.dangerText },
  outline: {
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border.subtle,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
  },
  buttonText: { ...typography.titleSmall, color: palette.text.primary },
  primary: {
    minHeight: 46,
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.brand.secondary,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primaryText: { ...typography.titleMedium, color: palette.text.inverse },
  disabled: { opacity: 0.65 },
});
