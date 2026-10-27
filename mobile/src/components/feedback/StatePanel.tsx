import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import { spacing } from '../../theme/spacing';

type StatePanelProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StatePanel({ title, description, actionLabel, onAction }: StatePanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.xl },
  title: { color: colors.light.text.primary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  description: { color: colors.light.text.secondary, lineHeight: 21, marginTop: spacing.sm, textAlign: 'center' },
  action: { backgroundColor: colors.light.brand.primary, borderRadius: 8, marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  actionText: { color: colors.light.text.inverse, fontWeight: '700' },
});
