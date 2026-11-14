import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError, ApiNetworkError } from '../../../../core/apiClient';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { RootStackParamList } from '../../../../types/navigation';
import { hrApi, type JobPayload } from '../../api/hrApi';

type Props = NativeStackScreenProps<RootStackParamList, 'HrCreateJob'>;
type SubmitAction = 'draft' | 'publish';
type ErrorKey = 'title' | 'category' | 'level' | 'employmentType' | 'location' | 'salary' | 'experience' | 'deadline' | 'description' | 'skills';
type FormErrors = Partial<Record<ErrorKey, string>>;

const atsTitleSuggestions = ['Senior React Architect', 'Staff Software Engineer'];

const levelOptions = [
  { label: 'Thực tập', value: 'intern' },
  { label: 'Junior', value: 'junior' },
  { label: 'Middle', value: 'middle' },
  { label: 'Senior', value: 'senior' },
  { label: 'Lead', value: 'lead' },
];

const employmentOptions = [
  { label: 'Toàn thời gian', value: 'full_time' },
  { label: 'Bán thời gian', value: 'part_time' },
  { label: 'Hợp đồng', value: 'contract' },
  { label: 'Thực tập', value: 'internship' },
  { label: 'Freelance', value: 'freelance' },
];

const experienceOptions = [
  { label: 'Chưa yêu cầu', value: 'none' },
  { label: '1 - 2 năm', value: '1-2' },
  { label: '3 - 5 năm', value: '3-5' },
  { label: '5 - 8 năm', value: '5-8' },
  { label: 'Trên 8 năm', value: '8-plus' },
];

const experienceValues: Record<string, { minYears?: number; maxYears?: number }> = {
  none: {},
  '1-2': { minYears: 1, maxYears: 2 },
  '3-5': { minYears: 3, maxYears: 5 },
  '5-8': { minYears: 5, maxYears: 8 },
  '8-plus': { minYears: 8 },
};

function parseDeadline(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day, 23, 59, 59, 999);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) return undefined;
  return date;
}

function uniqueTags(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function submitErrorMessage(error: unknown) {
  if (error instanceof ApiNetworkError) {
    if (error.kind === 'timeout') return 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.';
    if (error.kind === 'cancelled') return 'Yêu cầu đã bị hủy. Vui lòng gửi lại.';
    return 'Không thể kết nối máy chủ. Hãy kiểm tra Wi-Fi và địa chỉ API.';
  }
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Thông tin tin tuyển dụng chưa hợp lệ. Vui lòng kiểm tra lại.';
    if (error.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (error.status === 403) return 'Tài khoản chưa có quyền hoặc chưa liên kết với công ty.';
    if (error.status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
  }
  return 'Không thể tạo tin tuyển dụng. Vui lòng thử lại.';
}

function FormField({
  children,
  error,
  hint,
  label,
  required = false,
}: {
  children: ReactNode;
  error?: string;
  hint?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}{required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      </View>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function FormInput({ error, multiline, style, ...props }: TextInputProps & { error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      multiline={multiline}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      placeholderTextColor="#94A3B8"
      style={[
        styles.input,
        multiline && styles.textarea,
        focused && styles.inputFocused,
        error && styles.inputError,
        style,
      ]}
    />
  );
}

function SelectField({
  error,
  label,
  onChange,
  options,
  required = false,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selectedLabel = options.find((option) => option.value === value)?.label ?? 'Chọn';

  return (
    <FormField error={error} label={label} required={required}>
      <Pressable
        accessibilityLabel={`${label}: ${selectedLabel}`}
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selectControl, error && styles.inputError, pressed && styles.pressed]}
      >
        <Text numberOfLines={1} style={styles.selectText}>{selectedLabel}</Text>
        <Ionicons color={colors.light.text.secondary} name="chevron-down" size={18} />
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Đóng danh sách lựa chọn"
            onPress={() => setOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.selectSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.selectSheetHeader}>
              <Text style={styles.selectSheetTitle}>{label}</Text>
              <Pressable accessibilityLabel="Đóng" onPress={() => setOpen(false)} style={styles.closeButton}>
                <Ionicons color={colors.light.text.primary} name="close" size={20} />
              </Pressable>
            </View>
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.selectOption,
                    selected && styles.selectOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.selectOptionText, selected && styles.selectOptionTextSelected]}>{option.label}</Text>
                  {selected ? <Ionicons color={colors.light.brand.secondary} name="checkmark" size={20} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </FormField>
  );
}

function SectionTitle({ badge, icon, subtitle, title }: { badge?: string; icon: keyof typeof Ionicons.glyphMap; subtitle: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons color={colors.light.brand.secondary} name={icon} size={17} />
      </View>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {badge ? <Text style={styles.sectionBadge}>{badge}</Text> : null}
    </View>
  );
}

export function HrCreateJobScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const submitLock = useRef(false);
  const createdDraftId = useRef<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [negotiable, setNegotiable] = useState(false);
  const [experienceRange, setExperienceRange] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState('');
  const [benefits, setBenefits] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<SubmitAction>();

  const addSkills = (values: string[]) => {
    setSkills((current) => uniqueTags([...current, ...values]));
  };

  const updateSkillDraft = (value: string) => {
    if (!value.includes(',')) {
      setSkillDraft(value);
      return;
    }
    const parts = value.split(',');
    addSkills(parts.slice(0, -1));
    setSkillDraft(parts.at(-1) ?? '');
  };

  const commitSkillDraft = () => {
    addSkills([skillDraft]);
    setSkillDraft('');
  };

  const submit = async (action: SubmitAction) => {
    if (submitLock.current) return;

    const finalSkills = uniqueTags([...skills, skillDraft]);
    const nextErrors: FormErrors = {};
    const parsedDeadline = parseDeadline(deadline);
    const minSalary = salaryMin.trim() ? Number(salaryMin) : undefined;
    const maxSalary = salaryMax.trim() ? Number(salaryMax) : undefined;
    const experience = experienceValues[experienceRange] ?? {};

    if (!title.trim()) nextErrors.title = 'Vui lòng nhập tiêu đề công việc.';
    if (!category.trim()) nextErrors.category = 'Vui lòng nhập phân hệ hoặc chuyên môn.';
    if (!level) nextErrors.level = 'Vui lòng chọn cấp bậc.';
    if (!employmentType) nextErrors.employmentType = 'Vui lòng chọn hình thức.';
    if (!remote && !location.trim()) nextErrors.location = 'Vui lòng nhập địa điểm làm việc.';
    if (!parsedDeadline || parsedDeadline.getTime() <= Date.now()) {
      nextErrors.deadline = 'Hạn ứng tuyển phải đúng định dạng và ở tương lai.';
    }
    if (!description.trim()) nextErrors.description = 'Vui lòng nhập mô tả công việc.';
    if (finalSkills.length === 0) nextErrors.skills = 'Vui lòng thêm ít nhất một kỹ năng.';
    if (!negotiable && ((minSalary != null && (!Number.isFinite(minSalary) || minSalary < 0))
      || (maxSalary != null && (!Number.isFinite(maxSalary) || maxSalary < 0))
      || (minSalary != null && maxSalary != null && minSalary > maxSalary))) {
      nextErrors.salary = 'Khoảng lương chưa hợp lệ.';
    }

    setErrors(nextErrors);
    setSkills(finalSkills);
    setSkillDraft('');
    if (Object.keys(nextErrors).length > 0 || !parsedDeadline) {
      Alert.alert('Thông tin chưa đầy đủ', 'Vui lòng kiểm tra các trường được đánh dấu bên dưới.');
      return;
    }

    const payload: JobPayload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      employmentType,
      location: {
        city: location.trim() || undefined,
        country: 'Việt Nam',
        remote,
      },
      salary: {
        min: negotiable ? undefined : minSalary,
        max: negotiable ? undefined : maxSalary,
        currency,
        negotiable,
      },
      experience: {
        ...experience,
        level,
      },
      requirements: { requiredSkills: finalSkills },
      benefits: benefits.split(/\r?\n|;/).map((item) => item.replace(/^[-•]\s*/, '').trim()).filter(Boolean),
      deadline: parsedDeadline.toISOString(),
    };

    submitLock.current = true;
    setSubmitting(action);
    try {
      let jobId = createdDraftId.current;
      if (jobId) {
        await hrApi.updateJob(jobId, payload);
      } else {
        const created = await hrApi.createJob(payload);
        jobId = created.id;
        createdDraftId.current = created.id;
      }
      if (action === 'publish') {
        try {
          await hrApi.updateJobStatus(jobId, 'published');
        } catch (publishError) {
          submitLock.current = false;
          setSubmitting(undefined);
          Alert.alert(
            'Tin đã được lưu nháp',
            `Không thể đăng tin ngay. ${submitErrorMessage(publishError)} Bạn có thể chỉnh sửa và thử lại.`,
          );
          return;
        }
      }
      Alert.alert(
        action === 'publish' ? 'Đăng tin thành công' : 'Đã lưu bản nháp',
        action === 'publish'
          ? 'Tin tuyển dụng đã được công khai cho ứng viên.'
          : 'Bạn có thể đăng tin từ màn Quản lý công việc.',
        [{ text: 'Hoàn tất', onPress: () => navigation.goBack() }],
      );
    } catch (requestError) {
      submitLock.current = false;
      setSubmitting(undefined);
      Alert.alert('Không thể lưu tin', submitErrorMessage(requestError));
    }
  };

  return (
    <View style={styles.page}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionCard}>
            <SectionTitle
              badge="Bắt buộc"
              icon="briefcase-outline"
              subtitle="Thông số tuyển dụng chuẩn hoá KONEK"
              title="1. Thông tin vị trí"
            />
            <FormField error={errors.title} label="Tiêu đề công việc" required>
              <FormInput
                autoCapitalize="sentences"
                error={errors.title}
                maxLength={120}
                onChangeText={setTitle}
                placeholder="VD: Senior Frontend Engineer (React/TypeScript)"
                value={title}
              />
              <ScrollView
                contentContainerStyle={styles.atsSuggestions}
                horizontal
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
              >
                <View style={styles.atsLabel}>
                  <Ionicons color={colors.light.status.warning} name="bulb-outline" size={14} />
                  <Text style={styles.atsLabelText}>Gợi ý ATS:</Text>
                </View>
                {atsTitleSuggestions.map((suggestion) => (
                  <Pressable
                    accessibilityRole="button"
                    key={suggestion}
                    onPress={() => setTitle(suggestion)}
                    style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </FormField>
            <FormField error={errors.category} label="Phân hệ & Chuyên môn" required>
              <FormInput
                error={errors.category}
                maxLength={100}
                onChangeText={setCategory}
                placeholder="Ví dụ: Kỹ thuật phần mềm & AI"
                value={category}
              />
            </FormField>
            <View style={styles.inlineInputs}>
              <View style={styles.halfField}>
                <SelectField error={errors.level} label="Cấp bậc" onChange={setLevel} options={levelOptions} required value={level} />
              </View>
              <View style={styles.halfField}>
                <SelectField
                  error={errors.employmentType}
                  label="Hình thức"
                  onChange={setEmploymentType}
                  options={employmentOptions}
                  required
                  value={employmentType}
                />
              </View>
            </View>
            <FormField error={errors.location} label="Địa điểm làm việc & Chi nhánh" required>
              <View style={styles.iconInputWrap}>
                <Ionicons color={colors.light.brand.secondary} name="location-outline" size={19} style={styles.inputIcon} />
                <FormInput
                  editable={!remote}
                  error={errors.location}
                  onChangeText={setLocation}
                  placeholder={remote ? 'Làm việc từ xa' : 'Nhập địa chỉ hoặc chi nhánh'}
                  style={styles.iconInput}
                  value={location}
                />
              </View>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: remote }}
                onPress={() => setRemote((current) => !current)}
                style={styles.checkboxRow}
              >
                <View style={[styles.checkbox, remote && styles.checkboxChecked]}>
                  {remote ? <Ionicons color={colors.light.text.inverse} name="checkmark" size={14} /> : null}
                </View>
                <Text style={styles.checkboxLabel}>Cho phép làm việc từ xa</Text>
              </Pressable>
            </FormField>
            <View style={styles.salaryPanel}>
              <View style={styles.salaryHeader}>
                <View style={styles.salaryTitleRow}>
                  <Ionicons color={colors.light.brand.secondary} name="cash-outline" size={18} />
                  <Text style={styles.salaryTitle}>Mức lương (Gross / tháng)</Text>
                </View>
                <View style={styles.currencyRow}>
                  {['VND', 'USD'].map((item) => (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: currency === item }}
                      key={item}
                      onPress={() => setCurrency(item)}
                      style={[styles.currencyChip, currency === item && styles.currencyChipSelected]}
                    >
                      <Text style={[styles.currencyText, currency === item && styles.currencyTextSelected]}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <FormField error={errors.salary} label="Khoảng lương">
                <View style={styles.inlineInputs}>
                  <FormInput editable={!negotiable} error={errors.salary} keyboardType="numeric" onChangeText={setSalaryMin} placeholder="Tối thiểu" style={styles.inlineInput} value={salaryMin} />
                  <FormInput editable={!negotiable} error={errors.salary} keyboardType="numeric" onChangeText={setSalaryMax} placeholder="Tối đa" style={styles.inlineInput} value={salaryMax} />
                </View>
              </FormField>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: negotiable }}
                onPress={() => setNegotiable((current) => !current)}
                style={styles.checkboxRow}
              >
                <View style={[styles.checkbox, negotiable && styles.checkboxChecked]}>
                  {negotiable ? <Ionicons color={colors.light.text.inverse} name="checkmark" size={14} /> : null}
                </View>
                <Text style={styles.checkboxLabel}>Mức lương thỏa thuận</Text>
              </Pressable>
              <Text style={styles.helperText}>Backend chưa hỗ trợ cờ ẩn/hiện mức lương riêng.</Text>
            </View>
            <View style={styles.inlineInputs}>
              <View style={styles.halfField}>
                <SelectField label="Kinh nghiệm" onChange={setExperienceRange} options={experienceOptions} value={experienceRange} />
              </View>
              <View style={styles.halfField}>
                <FormField error={errors.deadline} label="Hạn ứng tuyển" required>
                  <FormInput error={errors.deadline} keyboardType="numbers-and-punctuation" maxLength={10} onChangeText={setDeadline} placeholder="DD/MM/YYYY" value={deadline} />
                </FormField>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <SectionTitle
              icon="document-text-outline"
              subtitle="Chi tiết để ứng viên hiểu rõ kỳ vọng"
              title="2. Mô tả & Kỹ năng"
            />
            <FormField error={errors.description} hint="Markdown hỗ trợ" label="Mô tả công việc (JD)" required>
              <FormInput
                error={errors.description}
                maxLength={5000}
                multiline
                onChangeText={setDescription}
                placeholder="Nhập trách nhiệm chính và công việc cụ thể…"
                value={description}
              />
            </FormField>
            <FormField error={errors.skills} hint="Từ khóa ATS" label="Kỹ năng cốt lõi (Core Skills)" required>
              <View style={[styles.tagInput, errors.skills && styles.inputError]}>
                <View style={styles.tags}>
                  {skills.map((skill) => (
                    <View key={skill} style={styles.tag}>
                      <Text style={styles.tagText}>{skill}</Text>
                      <Pressable
                        accessibilityLabel={`Bỏ kỹ năng ${skill}`}
                        onPress={() => setSkills((current) => current.filter((item) => item !== skill))}
                      >
                        <Ionicons color={colors.light.brand.secondary} name="close" size={14} />
                      </Pressable>
                    </View>
                  ))}
                </View>
                <TextInput
                  onChangeText={updateSkillDraft}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !skillDraft && skills.length > 0) {
                      setSkills((current) => current.slice(0, -1));
                    }
                  }}
                  onSubmitEditing={commitSkillDraft}
                  placeholder="Nhập kỹ năng rồi nhấn Enter"
                  placeholderTextColor="#94A3B8"
                  returnKeyType="done"
                  style={styles.tagTextInput}
                  value={skillDraft}
                />
              </View>
              <Text style={styles.helperText}>Có thể ngăn cách nhiều kỹ năng bằng dấu phẩy.</Text>
            </FormField>
            <FormField label="Quyền lợi & Đãi ngộ ứng viên">
              <FormInput
                maxLength={3000}
                multiline
                onChangeText={setBenefits}
                placeholder={'Mỗi quyền lợi nhập trên một dòng\nVí dụ: Thưởng hiệu suất, bảo hiểm sức khỏe'}
                value={benefits}
              />
            </FormField>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Pressable
            accessibilityRole="button"
            disabled={Boolean(submitting)}
            onPress={() => void submit('draft')}
            style={({ pressed }) => [styles.draftButton, pressed && styles.pressed, submitting && styles.disabled]}
          >
            {submitting === 'draft'
              ? <ActivityIndicator color={colors.light.brand.primary} size="small" />
              : <Ionicons color={colors.light.brand.primary} name="save-outline" size={18} />}
            <Text style={styles.draftButtonText}>{submitting === 'draft' ? 'Đang lưu…' : 'Lưu nháp'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={Boolean(submitting)}
            onPress={() => void submit('publish')}
            style={({ pressed }) => [styles.publishButton, pressed && styles.pressed, submitting && styles.disabled]}
          >
            {submitting === 'publish'
              ? <ActivityIndicator color={colors.light.text.inverse} size="small" />
              : <Ionicons color={colors.light.text.inverse} name="paper-plane" size={17} />}
            <Text style={styles.publishButtonText}>{submitting === 'publish' ? 'Đang đăng…' : 'Đăng tin ngay'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { backgroundColor: colors.light.background.primary, flex: 1 },
  formContent: { gap: 14, padding: spacing.md, paddingBottom: spacing.lg },
  intro: { paddingHorizontal: 2, paddingVertical: 4 },
  introEyebrow: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  introTitle: { color: colors.light.text.primary, fontSize: 22, fontWeight: '700', marginTop: 4 },
  introSubtitle: { color: colors.light.text.secondary, fontSize: 14, lineHeight: 20, marginTop: 6 },
  sectionCard: { backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderRadius: 18, borderWidth: 1, gap: 16, padding: spacing.md, shadowColor: colors.light.brand.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  sectionHeader: { alignItems: 'center', borderBottomColor: colors.light.border.subtle, borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingBottom: 14 },
  sectionIcon: { alignItems: 'center', backgroundColor: colors.light.brand.accent, borderRadius: 10, height: 34, justifyContent: 'center', width: 34 },
  sectionCopy: { flex: 1 },
  sectionTitle: { color: colors.light.text.primary, fontSize: 17, fontWeight: '700' },
  sectionSubtitle: { color: colors.light.text.secondary, fontSize: 12, marginTop: 3 },
  sectionBadge: { backgroundColor: colors.light.background.subtle, borderRadius: 6, color: colors.light.text.secondary, fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 5 },
  field: { gap: 7 },
  labelRow: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  label: { color: colors.light.text.primary, fontSize: 14, fontWeight: '600' },
  fieldHint: { color: colors.light.text.secondary, fontSize: 11 },
  required: { color: colors.light.status.danger },
  input: { backgroundColor: colors.light.background.input, borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1, color: colors.light.text.primary, fontSize: 16, minHeight: 46, paddingHorizontal: 13, paddingVertical: 10 },
  inputFocused: { borderColor: colors.light.border.focus, shadowColor: colors.light.border.focus, shadowOpacity: 0.1, shadowRadius: 3 },
  inputError: { borderColor: colors.light.status.danger },
  textarea: { minHeight: 124, textAlignVertical: 'top' },
  fieldError: { color: colors.light.status.danger, fontSize: 12, lineHeight: 17 },
  selectControl: { alignItems: 'center', backgroundColor: colors.light.background.input, borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 6, justifyContent: 'space-between', minHeight: 46, paddingHorizontal: 12 },
  selectText: { color: colors.light.text.primary, flex: 1, fontSize: 14 },
  modalOverlay: { backgroundColor: 'rgba(15, 23, 42, 0.42)', flex: 1, justifyContent: 'flex-end' },
  selectSheet: { backgroundColor: colors.light.background.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 6, padding: spacing.md },
  selectSheetHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  selectSheetTitle: { color: colors.light.text.primary, fontSize: 17, fontWeight: '700' },
  closeButton: { alignItems: 'center', backgroundColor: colors.light.background.subtle, borderRadius: 12, height: 40, justifyContent: 'center', width: 40 },
  selectOption: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 12 },
  selectOptionSelected: { backgroundColor: colors.light.brand.accent },
  selectOptionText: { color: colors.light.text.primary, flex: 1, fontSize: 14 },
  selectOptionTextSelected: { color: colors.light.brand.secondary, fontWeight: '700' },
  atsSuggestions: { alignItems: 'center', gap: 6, paddingVertical: 2 },
  atsLabel: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  atsLabelText: { color: colors.light.text.secondary, fontSize: 11 },
  suggestionChip: { backgroundColor: colors.light.background.subtle, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  suggestionText: { color: colors.light.text.secondary, fontSize: 11, fontWeight: '500' },
  inlineInputs: { flexDirection: 'row', gap: 10 },
  inlineInput: { flex: 1 },
  halfField: { flex: 1, minWidth: 0 },
  iconInputWrap: { justifyContent: 'center', position: 'relative' },
  inputIcon: { left: 12, position: 'absolute', zIndex: 1 },
  iconInput: { paddingLeft: 40 },
  checkboxRow: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 8, minHeight: 32 },
  checkboxRowCompact: { alignItems: 'center', flexDirection: 'row', gap: 7, marginLeft: 'auto' },
  checkbox: { alignItems: 'center', borderColor: colors.light.border.subtle, borderRadius: 5, borderWidth: 1, height: 20, justifyContent: 'center', width: 20 },
  checkboxChecked: { backgroundColor: colors.light.brand.secondary, borderColor: colors.light.brand.secondary },
  checkboxLabel: { color: colors.light.text.secondary, fontSize: 13 },
  salaryPanel: { backgroundColor: colors.light.background.subtle, borderRadius: 14, gap: 10, padding: 12 },
  salaryHeader: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  salaryTitleRow: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 7 },
  salaryTitle: { color: colors.light.text.primary, flex: 1, fontSize: 13, fontWeight: '700' },
  currencyRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  currencyChip: { borderColor: colors.light.border.subtle, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  currencyChipSelected: { backgroundColor: colors.light.brand.accent, borderColor: colors.light.border.focus },
  currencyText: { color: colors.light.text.secondary, fontSize: 12, fontWeight: '700' },
  currencyTextSelected: { color: colors.light.brand.secondary },
  tagInput: { backgroundColor: colors.light.background.input, borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1, minHeight: 48, padding: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { alignItems: 'center', backgroundColor: colors.light.brand.accent, borderRadius: 999, flexDirection: 'row', gap: 4, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '600' },
  tagTextInput: { color: colors.light.text.primary, fontSize: 16, minHeight: 38, paddingHorizontal: 4, paddingVertical: 8 },
  helperText: { color: colors.light.text.secondary, fontSize: 12, lineHeight: 17 },
  footer: { backgroundColor: colors.light.background.surface, borderTopColor: colors.light.border.subtle, borderTopWidth: 1, flexDirection: 'row', gap: 10, paddingHorizontal: spacing.md, paddingTop: 10 },
  draftButton: { alignItems: 'center', borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 46, paddingHorizontal: 12 },
  draftButtonText: { color: colors.light.brand.primary, fontSize: 14, fontWeight: '700' },
  publishButton: { alignItems: 'center', backgroundColor: colors.light.brand.secondary, borderRadius: 12, flex: 1.35, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 46, paddingHorizontal: 12 },
  publishButtonText: { color: colors.light.text.inverse, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.72 },
});
