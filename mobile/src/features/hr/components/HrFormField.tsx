import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing, typography } from "../../../theme";

type FormFieldProps = {
  editable?: boolean;
  error?: string;
  onboarding?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  helperText?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "url";
  label: string;
  maxLength: number;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value: string;
};

export function HrFormField({
  editable = true,
  error,
  onboarding = false,
  autoCapitalize = "sentences",
  keyboardType = "default",
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
      <Text style={[styles.label, onboarding && styles.onboardingLabel]}>
        {label}
        {required && <Text style={styles.requiredMarker}> *</Text>}
      </Text>
      <TextInput
        editable={editable}
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.light.text.secondary}
        style={[styles.input, onboarding && styles.onboardingInput, multiline && styles.multilineInput, !!error && styles.invalid]}
        value={value}
        returnKeyType="next"
      />
      {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.light.text.primary,
    fontSize: 13,
    fontWeight: "600",
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
    textAlignVertical: "top",
  },
  helperText: {
    color: colors.light.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  onboardingLabel: { ...typography.titleSmall },
  onboardingInput: { ...typography.bodyLarge, borderRadius: radii.lg },
  invalid: { borderColor: colors.light.feedback.dangerText },
  error: { ...typography.bodySmall, color: colors.light.feedback.dangerText },
});
