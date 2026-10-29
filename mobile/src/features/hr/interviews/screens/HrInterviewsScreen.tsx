import {
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';

export function HrInterviewsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Trang lịch phỏng vấn, Popup phỏng vấn cho HR
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor:
      colors.light.background.primary,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.light.text.primary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
});