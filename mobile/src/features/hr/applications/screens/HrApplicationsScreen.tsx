import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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

type Candidate = {
  id: string;
  jobId: string;
  name: string;
  title: string;
  location: string;
  appliedAt: string;
  matchScore: number;
  skills: string[];
  experience: string;
  cvName: string;
  cvMeta: string;
  avatarUrl: string;
  email: string;
  phone: string;
  stage: 'Duyệt hồ sơ' | 'Mới nộp' | 'Lên lịch PV';
  isUnread?: boolean;
};

type StatusFilter = 'Tất cả' | 'Mới nộp' | 'Phù hợp' | 'Lên lịch PV';

const jobs = [
  { id: 'frontend', title: 'Senior Frontend Engineer', total: 24 },
  { id: 'backend', title: 'Backend Java Developer', total: 16 },
  { id: 'product', title: 'Product Designer', total: 9 },
] as const;

const initialCandidates: Candidate[] = [
  {
    id: 'candidate-001', jobId: 'frontend', name: 'Nguyễn Văn An', title: 'Senior Frontend Engineer',
    location: 'Hà Nội (Hybrid)', appliedAt: '2 giờ trước', matchScore: 92,
    skills: ['ReactJS', 'TypeScript', 'Tailwind CSS', 'Next.js'], experience: '5 năm KN',
    cvName: 'CV_Nguyen_Van_An.pdf', cvMeta: '1,8 MB · Đã phân tích AI',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg', email: 'an.nguyen.fe@gmail.com',
    phone: '(+84) 982 345 678', stage: 'Duyệt hồ sơ', isUnread: true,
  },
  {
    id: 'candidate-002', jobId: 'frontend', name: 'Trần Thị Mai Anh', title: 'Senior Frontend Engineer',
    location: 'TP. Hồ Chí Minh', appliedAt: '5 giờ trước', matchScore: 86,
    skills: ['ReactJS', 'Redux Toolkit', 'REST API'], experience: '4 năm KN',
    cvName: 'CV_Tran_Thi_Mai_Anh.pdf', cvMeta: '2,4 MB · Đã phân tích AI',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg', email: 'maianh.tran@gmail.com',
    phone: '(+84) 906 218 550', stage: 'Mới nộp',
  },
  {
    id: 'candidate-003', jobId: 'frontend', name: 'Lê Hoàng Long', title: 'Senior Frontend Engineer',
    location: 'Đà Nẵng (Remote)', appliedAt: '1 ngày trước', matchScore: 78,
    skills: ['Vue.js', 'ReactJS', 'GraphQL'], experience: '3,5 năm KN',
    cvName: 'CV_Le_Hoang_Long.pdf', cvMeta: '1,2 MB · Đã phân tích AI',
    avatarUrl: 'https://randomuser.me/api/portraits/men/52.jpg', email: 'long.le.dev@gmail.com',
    phone: '(+84) 935 409 821', stage: 'Lên lịch PV',
  },
  {
    id: 'candidate-004', jobId: 'backend', name: 'Phạm Minh Đức', title: 'Backend Java Developer',
    location: 'Hà Nội', appliedAt: '3 giờ trước', matchScore: 89,
    skills: ['Java', 'Spring Boot', 'PostgreSQL'], experience: '4 năm KN',
    cvName: 'CV_Pham_Minh_Duc.pdf', cvMeta: '1,5 MB · Đã phân tích AI',
    avatarUrl: 'https://randomuser.me/api/portraits/men/41.jpg', email: 'duc.pham.java@gmail.com',
    phone: '(+84) 912 672 310', stage: 'Mới nộp', isUnread: true,
  },
  {
    id: 'candidate-005', jobId: 'backend', name: 'Vũ Thuỳ Linh', title: 'Backend Java Developer',
    location: 'Đà Nẵng (Remote)', appliedAt: '1 ngày trước', matchScore: 81,
    skills: ['Java', 'Kafka', 'MongoDB'], experience: '3 năm KN',
    cvName: 'CV_Vu_Thuy_Linh.pdf', cvMeta: '1,9 MB · Đã phân tích AI',
    avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg', email: 'linh.vu.backend@gmail.com',
    phone: '(+84) 903 581 244', stage: 'Duyệt hồ sơ',
  },
  {
    id: 'candidate-006', jobId: 'product', name: 'Đỗ Ngọc Hà', title: 'Product Designer',
    location: 'TP. Hồ Chí Minh (Hybrid)', appliedAt: '6 giờ trước', matchScore: 94,
    skills: ['Figma', 'Design System', 'UX Research'], experience: '5 năm KN',
    cvName: 'Portfolio_Do_Ngoc_Ha.pdf', cvMeta: '3,1 MB · Đã phân tích AI',
    avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg', email: 'ha.do.design@gmail.com',
    phone: '(+84) 979 224 106', stage: 'Mới nộp', isUnread: true,
  },
];

const statusFilters: StatusFilter[] = ['Tất cả', 'Mới nộp', 'Phù hợp', 'Lên lịch PV'];

export function HrApplicationsScreen() {
  const [candidateData, setCandidateData] = useState(initialCandidates);
  const [selectedJobId, setSelectedJobId] = useState<(typeof jobs)[number]['id']>(jobs[0].id);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('Tất cả');
  const [query, setQuery] = useState('');
  const [sortDescending, setSortDescending] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [minimumMatch, setMinimumMatch] = useState(0);
  const [scheduledCandidate, setScheduledCandidate] = useState<Candidate | null>(null);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  const candidatesForJob = candidateData.filter((candidate) => candidate.jobId === selectedJobId);

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');

    return candidateData
      .filter((candidate) => candidate.jobId === selectedJobId)
      .filter((candidate) => {
        if (activeFilter === 'Mới nộp') return candidate.stage === 'Mới nộp';
        if (activeFilter === 'Phù hợp') return candidate.matchScore >= 85;
        if (activeFilter === 'Lên lịch PV') return candidate.stage === 'Lên lịch PV';
        return true;
      })
      .filter((candidate) => !onlyUnread || candidate.isUnread)
      .filter((candidate) => candidate.matchScore >= minimumMatch)
      .filter((candidate) => {
        if (!normalizedQuery) return true;
        const searchableText = [candidate.name, candidate.title, candidate.location, ...candidate.skills]
          .join(' ')
          .toLocaleLowerCase('vi');
        return searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => sortDescending ? b.matchScore - a.matchScore : a.matchScore - b.matchScore);
  }, [activeFilter, candidateData, minimumMatch, onlyUnread, query, selectedJobId, sortDescending]);

  const getFilterCount = (filter: StatusFilter) => {
    if (filter === 'Mới nộp') return candidatesForJob.filter((candidate) => candidate.stage === 'Mới nộp').length;
    if (filter === 'Phù hợp') return candidatesForJob.filter((candidate) => candidate.matchScore >= 85).length;
    if (filter === 'Lên lịch PV') return candidatesForJob.filter((candidate) => candidate.stage === 'Lên lịch PV').length;
    return candidatesForJob.length;
  };

  const openJobPicker = () => {
    Alert.alert(
      'Chọn vị trí tuyển dụng',
      'Danh sách ứng viên sẽ được lọc theo vị trí.',
      [
        ...jobs.map((job) => ({
          onPress: () => {
            setSelectedJobId(job.id);
            setActiveFilter('Tất cả');
            setQuery('');
          },
          text: `${job.title} (${job.total})`,
        })),
        { style: 'cancel' as const, text: 'Huỷ' },
      ],
    );
  };

  const updateCandidateStage = (candidateId: string, stage: Candidate['stage']) => {
    setCandidateData((current) => current.map((candidate) => (
      candidate.id === candidateId ? { ...candidate, stage } : candidate
    )));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appHeader}>
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>KONEK</Text>
          <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>NHÀ TUYỂN DỤNG</Text></View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Mở thông báo"
            accessibilityRole="button"
            onPress={() => Alert.alert('Thông báo', 'Bạn không có thông báo mới.')}
            style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}
          >
            <Ionicons color={colors.light.text.primary} name="notifications-outline" size={20} />
            <View style={styles.notificationDot} />
          </Pressable>
          <Pressable
            accessibilityLabel="Mở tài khoản"
            accessibilityRole="button"
            onPress={() => Alert.alert('Tài khoản nhà tuyển dụng', 'Trang hồ sơ tài khoản sẽ được nối sau.')}
            style={({ pressed }) => [styles.accountIcon, pressed && styles.pressed]}
          >
            <Ionicons color={colors.light.text.inverse} name="person-outline" size={18} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeading}>
          <Text style={styles.pageTitle}>Ứng viên</Text>
          <Text style={styles.pageSubtitle}>Sàng lọc hồ sơ phù hợp cho từng vị trí tuyển dụng.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>VỊ TRÍ ĐANG TUYỂN</Text>
          <Pressable
            accessibilityRole="button"
            onPress={openJobPicker}
            style={({ pressed }) => [styles.jobSelect, pressed && styles.controlPressed]}
          >
            <View style={styles.jobSelectCopy}>
              <Text numberOfLines={1} style={styles.jobTitle}>{selectedJob.title}</Text>
              <Text style={styles.jobCount}>{selectedJob.total} hồ sơ</Text>
            </View>
            <Ionicons color={colors.light.text.secondary} name="chevron-down" size={18} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Ionicons color={colors.light.text.secondary} name="search-outline" size={19} />
            <TextInput
              accessibilityLabel="Tìm ứng viên"
              onChangeText={setQuery}
              placeholder="Tìm theo tên, kỹ năng (React, Go)..."
              placeholderTextColor={colors.light.text.secondary}
              style={styles.searchInput}
              value={query}
            />
            {query ? (
              <Pressable accessibilityLabel="Xoá tìm kiếm" hitSlop={8} onPress={() => setQuery('')}>
                <Ionicons color={colors.light.text.secondary} name="close-circle" size={18} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            accessibilityLabel="Bộ lọc nâng cao"
            accessibilityRole="button"
            onPress={() => setShowAdvancedFilters((current) => !current)}
            style={({ pressed }) => [
              styles.filterButton,
              showAdvancedFilters && styles.filterButtonActive,
              pressed && styles.controlPressed,
            ]}
          >
            <Ionicons color={colors.light.text.primary} name="options-outline" size={20} />
          </Pressable>
        </View>

        {showAdvancedFilters ? (
          <View style={styles.advancedFilters}>
            <Text style={styles.advancedFilterTitle}>Lọc nhanh</Text>
            <View style={styles.advancedFilterOptions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setOnlyUnread((current) => !current)}
                style={[styles.advancedFilterChip, onlyUnread && styles.advancedFilterChipActive]}
              >
                <Text style={[styles.advancedFilterText, onlyUnread && styles.advancedFilterTextActive]}>Chưa xem</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setMinimumMatch((current) => current === 85 ? 0 : 85)}
                style={[styles.advancedFilterChip, minimumMatch === 85 && styles.advancedFilterChipActive]}
              >
                <Text style={[styles.advancedFilterText, minimumMatch === 85 && styles.advancedFilterTextActive]}>AI Match ≥ 85%</Text>
              </Pressable>
              {(onlyUnread || minimumMatch > 0) ? (
                <Pressable onPress={() => { setOnlyUnread(false); setMinimumMatch(0); }}>
                  <Text style={styles.clearFilterText}>Xoá lọc</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        <ScrollView contentContainerStyle={styles.filterList} horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((filter) => (
            <Pressable
              accessibilityRole="button"
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={({ pressed }) => [
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>{filter}</Text>
              <Text style={[styles.filterCount, activeFilter === filter && styles.filterCountActive]}>{getFilterCount(filter)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.listMeta}>
          <Text style={styles.resultText}>Hiển thị <Text style={styles.resultStrong}>{filteredCandidates.length} ứng viên</Text></Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setSortDescending((current) => !current)}
            style={({ pressed }) => [styles.sortLabel, pressed && styles.pressed]}
          >
            <Text style={styles.sortText}>AI Match {sortDescending ? 'cao nhất' : 'thấp nhất'}</Text>
            <Ionicons color={colors.light.text.secondary} name="swap-vertical-outline" size={14} />
          </Pressable>
        </View>

        <View style={styles.candidateList}>
          {filteredCandidates.length ? filteredCandidates.map((candidate) => (
            <CandidateCard
              candidate={candidate}
              key={candidate.id}
              onChangeStage={(stage) => updateCandidateStage(candidate.id, stage)}
              onSchedule={() => setScheduledCandidate(candidate)}
            />
          )) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Không tìm thấy ứng viên phù hợp</Text>
              <Text style={styles.emptyStateText}>Thử đổi từ khoá hoặc bỏ bớt bộ lọc đang áp dụng.</Text>
              <Pressable
                onPress={() => {
                  setQuery(''); setActiveFilter('Tất cả'); setOnlyUnread(false); setMinimumMatch(0);
                }}
              >
                <Text style={styles.clearFilterText}>Xoá tìm kiếm và bộ lọc</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {scheduledCandidate ? (
        <InterviewScheduleModal
          candidate={scheduledCandidate}
          onClose={() => setScheduledCandidate(null)}
          onConfirm={() => {
            updateCandidateStage(scheduledCandidate.id, 'Lên lịch PV');
            setScheduledCandidate(null);
            Alert.alert('Đã lên lịch phỏng vấn', `Lời mời đã được tạo cho ${scheduledCandidate.name}.`);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function CandidateCard({
  candidate,
  onChangeStage,
  onSchedule,
}: {
  candidate: Candidate;
  onChangeStage: (stage: Candidate['stage']) => void;
  onSchedule: () => void;
}) {
  const openStagePicker = () => {
    Alert.alert(
      `Cập nhật ${candidate.name}`,
      'Chọn trạng thái xử lý hồ sơ.',
      [
        { onPress: () => onChangeStage('Mới nộp'), text: 'Mới nộp' },
        { onPress: () => onChangeStage('Duyệt hồ sơ'), text: 'Duyệt hồ sơ' },
        { onPress: () => onChangeStage('Lên lịch PV'), text: 'Lên lịch PV' },
        { style: 'cancel', text: 'Huỷ' },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.candidateHeader}>
        <Image source={{ uri: candidate.avatarUrl }} style={styles.avatar} />
        <View style={styles.candidateIdentity}>
          <Text numberOfLines={1} style={styles.candidateName}>{candidate.name}</Text>
          <Text numberOfLines={1} style={styles.candidateTitle}>{candidate.title}</Text>
          <View style={styles.candidateMetaRow}>
            <Ionicons color={colors.light.text.secondary} name="location-outline" size={13} />
            <Text numberOfLines={1} style={styles.candidateMeta}>{candidate.appliedAt} · {candidate.location}</Text>
          </View>
        </View>
        {candidate.isUnread ? <View style={styles.unreadDot} /> : null}
      </View>

      <View accessibilityLabel={`Điểm phù hợp ${candidate.matchScore}%`} style={styles.matchTrack}>
        <View style={[styles.matchValue, { width: `${candidate.matchScore}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.skillList} horizontal showsHorizontalScrollIndicator={false}>
        {candidate.skills.map((skill) => (
          <View key={skill} style={styles.skillChip}><Text style={styles.skillText}>{skill}</Text></View>
        ))}
      </ScrollView>

      <View style={styles.experienceBadge}><Text style={styles.experienceText}>{candidate.experience}</Text></View>

      <View style={styles.cvRow}>
        <View style={styles.pdfIcon}><Ionicons color={colors.light.status.danger} name="document-text-outline" size={18} /></View>
        <View style={styles.cvCopy}>
          <Text numberOfLines={1} style={styles.cvName}>{candidate.cvName}</Text>
          <Text numberOfLines={1} style={styles.cvMeta}>{candidate.cvMeta}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Xem CV', `Bản xem trước ${candidate.cvName} sẽ được nối với API tài liệu.`)}
          style={({ pressed }) => [styles.viewCvButton, pressed && styles.controlPressed]}
        >
          <Ionicons color={colors.light.brand.secondary} name="eye-outline" size={14} />
          <Text style={styles.viewCvText}>Xem CV</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Tải ${candidate.cvName}`}
          accessibilityRole="button"
          onPress={() => Alert.alert('Tải CV', `Tính năng tải ${candidate.cvName} sẽ hoạt động khi có URL tệp từ API.`)}
          style={({ pressed }) => [styles.downloadButton, pressed && styles.controlPressed]}
        >
          <Ionicons color={colors.light.text.primary} name="download-outline" size={17} />
        </Pressable>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onSchedule}
          style={({ pressed }) => [styles.scheduleButton, pressed && styles.scheduleButtonPressed]}
        >
          <Ionicons color={colors.light.text.inverse} name="calendar-outline" size={17} />
          <Text numberOfLines={2} style={styles.scheduleButtonText}>Lên lịch phỏng vấn</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={openStagePicker}
          style={({ pressed }) => [styles.stageButton, pressed && styles.controlPressed]}
        >
          <Text numberOfLines={1} style={styles.stageButtonText}>{candidate.stage}</Text>
          <Ionicons color={colors.light.text.primary} name="chevron-down" size={15} />
        </Pressable>
      </View>
    </View>
  );
}

function InterviewScheduleModal({
  candidate,
  onClose,
  onConfirm,
}: {
  candidate: Candidate;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [round, setRound] = useState('Vòng 2');
  const [interviewType, setInterviewType] = useState<'online' | 'office'>('online');
  const [date, setDate] = useState('07/11');
  const [time, setTime] = useState('14:30 - 15:30');
  const [note, setNote] = useState(
    `Chào ${candidate.name}, KONEK trân trọng mời bạn tham gia buổi phỏng vấn kỹ thuật vòng 2 cho vị trí ${candidate.title}.`,
  );
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [sendReminder, setSendReminder] = useState(true);

  const rounds = [
    { id: 'Vòng 1', title: 'Vòng 1: Phỏng vấn Sơ bộ / HR', description: 'Đánh giá độ phù hợp văn hoá và thông tin chung' },
    { id: 'Vòng 2', title: 'Vòng 2: Chuyên môn / Tech Lead', description: 'Architecture, React, Performance & Live Coding' },
    { id: 'Vòng 3', title: 'Vòng 3: Văn hoá / Ban Giám Đốc', description: 'Định hướng phát triển dài hạn và trao đổi offer' },
  ];
  const dates = [
    { id: '05/11', day: 'T5', date: '05' },
    { id: '06/11', day: 'T6', date: '06' },
    { id: '07/11', day: 'T7', date: '07' },
    { id: '08/11', day: 'CN', date: '08' },
    { id: '09/11', day: 'T2', date: '09' },
  ];
  const timeSlots = ['09:00 - 10:00', '10:30 - 11:30', '14:30 - 15:30', '16:00 - 17:00'];

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeadingCopy}>
              <Text style={styles.modalTitle}>Lên lịch phỏng vấn</Text>
              <Text style={styles.modalSubtitle}>Xếp lịch trao đổi trực tiếp hoặc online cùng ứng viên</Text>
            </View>
            <Pressable accessibilityLabel="Đóng" hitSlop={8} onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons color={colors.light.text.secondary} name="close" size={20} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalCandidateCard}>
              <Image source={{ uri: candidate.avatarUrl }} style={styles.modalAvatar} />
              <View style={styles.modalCandidateCopy}>
                <View style={styles.modalCandidateNameRow}>
                  <Text style={styles.modalCandidateName}>{candidate.name}</Text>
                  <View style={styles.availableDot} />
                </View>
                <Text style={styles.modalCandidateTitle}>{candidate.title}</Text>
                <View style={styles.contactRow}>
                  <Ionicons color={colors.light.text.secondary} name="mail-outline" size={13} />
                  <Text numberOfLines={1} style={styles.contactText}>{candidate.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons color={colors.light.text.secondary} name="call-outline" size={13} />
                  <Text style={styles.contactText}>{candidate.phone}</Text>
                </View>
              </View>
            </View>

            <FormSection icon="git-branch-outline" title="Vòng phỏng vấn">
              <View style={styles.optionStack}>
                {rounds.map((item, index) => {
                  const selected = round === item.id;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={item.id}
                      onPress={() => setRound(item.id)}
                      style={[styles.roundOption, selected && styles.roundOptionSelected]}
                    >
                      <View style={[styles.roundNumber, selected && styles.roundNumberSelected]}>
                        <Text style={[styles.roundNumberText, selected && styles.roundNumberTextSelected]}>{index + 1}</Text>
                      </View>
                      <View style={styles.roundCopy}>
                        <Text style={styles.roundTitle}>{item.title}</Text>
                        <Text style={styles.roundDescription}>{item.description}</Text>
                      </View>
                      {selected ? <Ionicons color={colors.light.brand.secondary} name="checkmark-circle" size={18} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </FormSection>

            <FormSection icon="videocam-outline" title="Hình thức phỏng vấn">
              <View style={styles.segmentedControl}>
                <Pressable
                  onPress={() => setInterviewType('online')}
                  style={[styles.segmentButton, interviewType === 'online' && styles.segmentButtonActive]}
                >
                  <Ionicons color={interviewType === 'online' ? colors.light.brand.secondary : colors.light.text.secondary} name="videocam" size={15} />
                  <Text style={[styles.segmentText, interviewType === 'online' && styles.segmentTextActive]}>Trực tuyến</Text>
                </Pressable>
                <Pressable
                  onPress={() => setInterviewType('office')}
                  style={[styles.segmentButton, interviewType === 'office' && styles.segmentButtonActive]}
                >
                  <Ionicons color={interviewType === 'office' ? colors.light.brand.secondary : colors.light.text.secondary} name="business" size={15} />
                  <Text style={[styles.segmentText, interviewType === 'office' && styles.segmentTextActive]}>Tại văn phòng</Text>
                </Pressable>
              </View>
              <View style={styles.meetingInfo}>
                <Ionicons color={colors.light.brand.secondary} name={interviewType === 'online' ? 'link-outline' : 'location-outline'} size={17} />
                <View style={styles.meetingInfoCopy}>
                  <Text style={styles.meetingInfoTitle}>
                    {interviewType === 'online' ? 'Google Meet tự động tạo qua KONEK AI Sync' : 'Văn phòng KONEK, phòng phỏng vấn tầng 6'}
                  </Text>
                  <Text style={styles.meetingInfoText}>
                    {interviewType === 'online' ? 'meet.google.com/xyz-kone-abc' : 'Tòa nhà KONEK, Cầu Giấy, Hà Nội'}
                  </Text>
                </View>
              </View>
            </FormSection>

            <FormSection icon="calendar-outline" title="Chọn ngày phỏng vấn" trailing="Tháng 11, 2026">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dateList}>
                  {dates.map((item) => {
                    const selected = date === item.id;
                    return (
                      <Pressable key={item.id} onPress={() => setDate(item.id)} style={[styles.dateOption, selected && styles.dateOptionSelected]}>
                        <Text style={[styles.dateDay, selected && styles.dateTextSelected]}>{item.day}</Text>
                        <Text style={[styles.dateNumber, selected && styles.dateTextSelected]}>{item.date}</Text>
                        {selected ? <Text style={styles.dateToday}>Ngày chọn</Text> : <View style={styles.dateAvailableDot} />}
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </FormSection>

            <FormSection icon="time-outline" title="Khung giờ phỏng vấn" trailing="Thời lượng: 60 phút">
              <View style={styles.timeGrid}>
                {timeSlots.map((slot) => {
                  const selected = time === slot;
                  return (
                    <Pressable key={slot} onPress={() => setTime(slot)} style={[styles.timeOption, selected && styles.timeOptionSelected]}>
                      <Text style={[styles.timeText, selected && styles.timeTextSelected]}>{slot}</Text>
                      {selected ? <Ionicons color={colors.light.text.inverse} name="checkmark" size={14} /> : <Text style={styles.availableText}>Trống</Text>}
                    </Pressable>
                  );
                })}
              </View>
            </FormSection>

            <FormSection icon="people-outline" title="Hội đồng phỏng vấn (2)" trailing="Thêm người">
              <View style={styles.interviewerList}>
                <InterviewerRow
                  avatar="https://randomuser.me/api/portraits/women/12.jpg"
                  name="Trang Hoàng"
                  role="HR Lead · Người tổ chức"
                />
                <InterviewerRow
                  avatar="https://randomuser.me/api/portraits/men/22.jpg"
                  name="Lê Hoàng Long"
                  role="Tech Lead · Người đánh giá chính"
                />
              </View>
            </FormSection>

            <FormSection icon="create-outline" title="Nội dung thư mời gửi ứng viên">
              <TextInput
                multiline
                onChangeText={setNote}
                placeholder="Nhập nội dung thư mời"
                placeholderTextColor={colors.light.text.secondary}
                style={styles.invitationInput}
                textAlignVertical="top"
                value={note}
              />
              <Text style={styles.customizeHint}>Bạn có thể tuỳ chỉnh nội dung trước khi gửi.</Text>
            </FormSection>

            <View style={styles.checkList}>
              <CheckRow checked={addToCalendar} label="Đồng bộ & gửi thư mời qua Google Calendar" onPress={() => setAddToCalendar((current) => !current)} />
              <CheckRow checked={sendReminder} label="Tự động gửi SMS nhắc nhở ứng viên trước 2 giờ" onPress={() => setSendReminder((current) => !current)} />
            </View>

            <Pressable onPress={onConfirm} style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmButtonPressed]}>
              <Ionicons color={colors.light.text.inverse} name="send-outline" size={17} />
              <Text style={styles.confirmButtonText}>Xác nhận & Gửi lời mời</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Huỷ bỏ</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FormSection({
  children,
  icon,
  title,
  trailing,
}: {
  children: ReactNode;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  trailing?: string;
}) {
  return (
    <View style={styles.formSection}>
      <View style={styles.formSectionHeader}>
        <View style={styles.formSectionTitleRow}>
          <Ionicons color={colors.light.text.secondary} name={icon} size={16} />
          <Text style={styles.formSectionTitle}>{title}</Text>
        </View>
        {trailing ? <Text style={styles.formSectionTrailing}>{trailing}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function InterviewerRow({ avatar, name, role }: { avatar: string; name: string; role: string }) {
  return (
    <View style={styles.interviewerRow}>
      <Image source={{ uri: avatar }} style={styles.interviewerAvatar} />
      <View style={styles.interviewerCopy}>
        <Text style={styles.interviewerName}>{name}</Text>
        <Text style={styles.interviewerRole}>{role}</Text>
      </View>
      <Text style={styles.interviewerAvailable}>Sẵn sàng</Text>
    </View>
  );
}

function CheckRow({ checked, label, onPress }: { checked: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={styles.checkRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons color={colors.light.text.inverse} name="checkmark" size={13} /> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.light.background.primary, flex: 1 },
  appHeader: {
    alignItems: 'center', backgroundColor: colors.light.background.surface,
    borderBottomColor: colors.light.border.subtle, borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row', justifyContent: 'space-between', minHeight: 58,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  brandName: { color: colors.light.text.primary, fontSize: 14, fontWeight: '900', letterSpacing: 0.3 },
  roleBadge: { backgroundColor: colors.light.brand.accent, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4 },
  roleBadgeText: { color: colors.light.brand.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  headerIcon: { alignItems: 'center', height: 36, justifyContent: 'center', position: 'relative', width: 36 },
  notificationDot: {
    backgroundColor: colors.light.status.danger, borderColor: colors.light.background.surface,
    borderRadius: 4, borderWidth: 1, height: 7, position: 'absolute', right: 7, top: 7, width: 7,
  },
  accountIcon: {
    alignItems: 'center', backgroundColor: colors.light.brand.primary, borderRadius: 18,
    height: 36, justifyContent: 'center', width: 36,
  },
  advancedFilterChip: {
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  advancedFilterChipActive: {
    backgroundColor: colors.light.brand.accent,
    borderColor: colors.light.brand.secondary,
  },
  advancedFilterOptions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  advancedFilters: {
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  advancedFilterText: { color: colors.light.text.secondary, fontSize: 12, fontWeight: '700' },
  advancedFilterTextActive: { color: colors.light.brand.secondary },
  advancedFilterTitle: { color: colors.light.text.primary, fontSize: 12, fontWeight: '800', marginBottom: 9 },
  content: { paddingBottom: spacing.lg, paddingHorizontal: 12, paddingTop: spacing.md },
  pageHeading: { marginBottom: spacing.md },
  pageTitle: { color: colors.light.text.primary, fontSize: 22, fontWeight: '800' },
  pageSubtitle: { color: colors.light.text.secondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  section: { marginBottom: 12 },
  fieldLabel: {
    color: colors.light.text.secondary, fontSize: 10, fontWeight: '800',
    letterSpacing: 0.7, marginBottom: 7,
  },
  jobSelect: {
    alignItems: 'center', backgroundColor: colors.light.background.input,
    borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 12,
  },
  jobSelectCopy: { flex: 1, minWidth: 0, paddingRight: spacing.sm },
  jobTitle: { color: colors.light.text.primary, fontSize: 13, fontWeight: '700' },
  jobCount: { color: colors.light.text.secondary, fontSize: 12, marginTop: 2 },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 12 },
  searchField: {
    alignItems: 'center', backgroundColor: colors.light.background.input,
    borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1,
    flex: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 46, paddingHorizontal: 12,
  },
  searchInput: { color: colors.light.text.primary, flex: 1, fontSize: 13, minWidth: 0, paddingVertical: 0 },
  filterButton: {
    alignItems: 'center', backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1,
    height: 46, justifyContent: 'center', width: 46,
  },
  filterButtonActive: { backgroundColor: colors.light.brand.accent, borderColor: colors.light.brand.secondary },
  filterList: { gap: spacing.sm, paddingRight: 12 },
  filterChip: {
    alignItems: 'center', backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle, borderRadius: 999, borderWidth: 1,
    flexDirection: 'row', gap: 6, minHeight: 36, paddingHorizontal: 12,
  },
  filterChipActive: { backgroundColor: colors.light.brand.secondary, borderColor: colors.light.brand.secondary },
  filterChipText: { color: colors.light.text.secondary, fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: colors.light.text.inverse },
  filterCount: { color: colors.light.text.secondary, fontSize: 11, fontWeight: '800' },
  filterCountActive: { color: colors.light.text.inverse, opacity: 0.82 },
  listMeta: {
    alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between',
    marginBottom: 10, marginTop: 14,
  },
  resultText: { color: colors.light.text.secondary, flex: 1, fontSize: 11 },
  resultStrong: { color: colors.light.text.primary, fontWeight: '700' },
  sortLabel: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  sortText: { color: colors.light.text.secondary, fontSize: 11 },
  candidateList: { gap: 12 },
  clearFilterText: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '800' },
  controlPressed: { backgroundColor: colors.light.background.subtle },
  card: {
    backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle,
    borderRadius: 16, borderWidth: 1, padding: 14,
  },
  candidateHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  avatar: { borderColor: colors.light.border.subtle, borderRadius: 23, borderWidth: 1, height: 46, width: 46 },
  candidateIdentity: { flex: 1, minWidth: 0 },
  candidateName: { color: colors.light.text.primary, fontSize: 15, fontWeight: '800' },
  candidateTitle: { color: colors.light.text.secondary, fontSize: 12, marginTop: 2 },
  candidateMetaRow: { alignItems: 'center', flexDirection: 'row', gap: 3, marginTop: 3 },
  candidateMeta: { color: colors.light.text.secondary, flex: 1, fontSize: 12 },
  unreadDot: { backgroundColor: colors.light.status.info, borderRadius: 4, height: 8, marginTop: 4, width: 8 },
  matchTrack: {
    backgroundColor: colors.light.background.subtle, borderRadius: 999, height: 4,
    marginBottom: 10, marginTop: 11, overflow: 'hidden',
  },
  matchValue: { backgroundColor: colors.light.brand.secondary, borderRadius: 999, height: '100%' },
  skillList: { gap: 6, paddingRight: 12 },
  skillChip: {
    backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle,
    borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 5,
  },
  skillText: { color: colors.light.text.secondary, fontSize: 10 },
  experienceBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.light.brand.accent, borderRadius: 999,
    marginTop: spacing.sm, paddingHorizontal: 9, paddingVertical: 5,
  },
  experienceText: { color: colors.light.brand.secondary, fontSize: 11, fontWeight: '800' },
  cvRow: {
    alignItems: 'center', backgroundColor: colors.light.background.subtle, borderRadius: 11,
    flexDirection: 'row', gap: spacing.sm, marginTop: 10, padding: spacing.sm,
  },
  pdfIcon: {
    alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 8,
    height: 32, justifyContent: 'center', width: 32,
  },
  cvCopy: { flex: 1, minWidth: 0 },
  cvName: { color: colors.light.text.primary, fontSize: 11, fontWeight: '700' },
  cvMeta: { color: colors.light.text.secondary, fontSize: 10, marginTop: 2 },
  viewCvButton: {
    alignItems: 'center', backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle, borderRadius: 8, borderWidth: 1,
    flexDirection: 'row', gap: 4, minHeight: 34, paddingHorizontal: spacing.sm,
  },
  viewCvText: { color: colors.light.brand.secondary, fontSize: 10, fontWeight: '800' },
  downloadButton: { alignItems: 'center', height: 34, justifyContent: 'center', width: 30 },
  emptyState: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 48 },
  emptyStateText: {
    color: colors.light.text.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  emptyStateTitle: { color: colors.light.text.primary, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: 10 },
  scheduleButton: {
    alignItems: 'center', backgroundColor: colors.light.brand.secondary, borderRadius: 11,
    flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center',
    minHeight: 44, paddingHorizontal: 10, paddingVertical: spacing.sm,
  },
  scheduleButtonText: {
    color: colors.light.text.inverse, flexShrink: 1, fontSize: 12,
    fontWeight: '800', lineHeight: 16, textAlign: 'center',
  },
  pressed: { opacity: 0.68 },
  stageButton: {
    alignItems: 'center', backgroundColor: colors.light.background.subtle, borderRadius: 11,
    flexDirection: 'row', gap: 5, justifyContent: 'center', maxWidth: 126,
    minHeight: 44, paddingHorizontal: 10,
  },
  stageButtonText: { color: colors.light.text.primary, flexShrink: 1, fontSize: 11, fontWeight: '700' },
  scheduleButtonPressed: { backgroundColor: '#1D4ED8' },
  modalOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 24,
  },
  modalCard: {
    backgroundColor: colors.light.background.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '96%',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { height: -4, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    alignItems: 'flex-start',
    borderBottomColor: colors.light.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  modalHeadingCopy: { flex: 1, minWidth: 0 },
  modalTitle: { color: colors.light.text.primary, fontSize: 18, fontWeight: '800' },
  modalSubtitle: { color: colors.light.text.secondary, fontSize: 11, lineHeight: 16, marginTop: 3 },
  modalCloseButton: {
    alignItems: 'center',
    backgroundColor: colors.light.background.subtle,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  modalContent: { padding: 12, paddingBottom: 24 },
  modalCandidateCard: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.accent,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 11,
    padding: 12,
  },
  modalAvatar: { borderRadius: 25, height: 50, width: 50 },
  modalCandidateCopy: { flex: 1, minWidth: 0 },
  modalCandidateNameRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  modalCandidateName: { color: colors.light.text.primary, fontSize: 14, fontWeight: '800' },
  availableDot: { backgroundColor: colors.light.status.success, borderRadius: 4, height: 8, width: 8 },
  modalCandidateTitle: { color: colors.light.brand.secondary, fontSize: 10, marginBottom: 5, marginTop: 2 },
  contactRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 2 },
  contactText: { color: colors.light.text.secondary, flex: 1, fontSize: 10 },
  formSection: { marginTop: 16 },
  formSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  formSectionTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  formSectionTitle: { color: colors.light.text.primary, fontSize: 12, fontWeight: '800' },
  formSectionTrailing: { color: colors.light.text.secondary, fontSize: 10 },
  optionStack: { gap: 7 },
  roundOption: {
    alignItems: 'center',
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 56,
    padding: spacing.sm,
  },
  roundOptionSelected: { backgroundColor: colors.light.brand.accent, borderColor: colors.light.brand.secondary },
  roundNumber: {
    alignItems: 'center',
    backgroundColor: colors.light.background.subtle,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  roundNumberSelected: { backgroundColor: colors.light.brand.secondary },
  roundNumberText: { color: colors.light.text.secondary, fontSize: 11, fontWeight: '800' },
  roundNumberTextSelected: { color: colors.light.text.inverse },
  roundCopy: { flex: 1, minWidth: 0 },
  roundTitle: { color: colors.light.text.primary, fontSize: 11, fontWeight: '700' },
  roundDescription: { color: colors.light.text.secondary, fontSize: 9, lineHeight: 13, marginTop: 2 },
  segmentedControl: {
    backgroundColor: colors.light.background.subtle,
    borderRadius: 10,
    flexDirection: 'row',
    padding: 3,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 38,
  },
  segmentButtonActive: { backgroundColor: colors.light.background.surface },
  segmentText: { color: colors.light.text.secondary, fontSize: 11, fontWeight: '700' },
  segmentTextActive: { color: colors.light.brand.secondary },
  meetingInfo: {
    alignItems: 'flex-start',
    backgroundColor: colors.light.brand.accent,
    borderRadius: 10,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: 10,
  },
  meetingInfoCopy: { flex: 1, minWidth: 0 },
  meetingInfoTitle: { color: colors.light.brand.secondary, fontSize: 10, fontWeight: '700', lineHeight: 14 },
  meetingInfoText: { color: colors.light.text.secondary, fontSize: 9, marginTop: 3 },
  dateList: { flexDirection: 'row', gap: 7, paddingRight: 12 },
  dateOption: {
    alignItems: 'center',
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: 10,
    borderWidth: 1,
    height: 68,
    justifyContent: 'center',
    width: 58,
  },
  dateOptionSelected: { backgroundColor: colors.light.brand.secondary, borderColor: colors.light.brand.secondary },
  dateDay: { color: colors.light.text.secondary, fontSize: 9 },
  dateNumber: { color: colors.light.text.primary, fontSize: 14, fontWeight: '800', marginTop: 2 },
  dateTextSelected: { color: colors.light.text.inverse },
  dateToday: { color: colors.light.text.inverse, fontSize: 8, marginTop: 3, opacity: 0.86 },
  dateAvailableDot: { backgroundColor: colors.light.status.success, borderRadius: 2, height: 4, marginTop: 5, width: 4 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  timeOption: {
    alignItems: 'center',
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: 9,
    borderWidth: 1,
    flexBasis: '48%',
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: 10,
  },
  timeOptionSelected: { backgroundColor: colors.light.brand.secondary, borderColor: colors.light.brand.secondary },
  timeText: { color: colors.light.text.primary, fontSize: 10, fontWeight: '700' },
  timeTextSelected: { color: colors.light.text.inverse },
  availableText: { color: colors.light.status.success, fontSize: 8, fontWeight: '700' },
  interviewerList: { gap: 6 },
  interviewerRow: {
    alignItems: 'center',
    backgroundColor: colors.light.background.subtle,
    borderRadius: 10,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  interviewerAvatar: { borderRadius: 17, height: 34, width: 34 },
  interviewerCopy: { flex: 1, minWidth: 0 },
  interviewerName: { color: colors.light.text.primary, fontSize: 11, fontWeight: '800' },
  interviewerRole: { color: colors.light.text.secondary, fontSize: 9, marginTop: 2 },
  interviewerAvailable: { color: colors.light.status.success, fontSize: 9, fontWeight: '800' },
  invitationInput: {
    backgroundColor: colors.light.background.input,
    borderColor: colors.light.border.subtle,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.light.text.primary,
    fontSize: 11,
    lineHeight: 17,
    minHeight: 112,
    padding: 11,
  },
  customizeHint: { color: colors.light.text.secondary, fontSize: 9, marginTop: 5, textAlign: 'right' },
  checkList: { gap: 9, marginTop: 18 },
  checkRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.light.border.focus,
    borderRadius: 4,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  checkboxChecked: { backgroundColor: colors.light.brand.secondary, borderColor: colors.light.brand.secondary },
  checkLabel: { color: colors.light.text.primary, flex: 1, fontSize: 10, lineHeight: 15 },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.primary,
    borderRadius: 11,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 48,
  },
  confirmButtonPressed: { backgroundColor: '#1E293B' },
  confirmButtonText: { color: colors.light.text.inverse, fontSize: 12, fontWeight: '800' },
  cancelButton: { alignItems: 'center', justifyContent: 'center', minHeight: 42 },
  cancelButtonText: { color: colors.light.text.secondary, fontSize: 11, fontWeight: '700' },
});
