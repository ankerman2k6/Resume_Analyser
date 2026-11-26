import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../../../theme";
import { spacing } from "../../../../theme/spacing";
import {
  hrApi,
  type HrApplication,
  type HrJob,
  type Interview,
  type InterviewPayload,
} from "../../api/hrApi";
import { openApplicationCv } from "../api/hrApplicationFile";
import { useFloatingTabBarScrollHandler } from "../../../../navigation/components/FloatingIslandTabBar";

type ApplicationRow = HrApplication & { jobTitle: string };
type StatusFilter =
  | "all"
  | "applied"
  | "pending"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";
type EditableStatus =
  | "pending"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected";

const statusLabels: Record<string, string> = {
  applied: "Mới nộp",
  pending: "Chờ xử lý",
  reviewing: "Đang duyệt",
  shortlisted: "Qua sơ tuyển",
  interview: "Phỏng vấn",
  accepted: "Đã nhận",
  rejected: "Từ chối",
  withdrawn: "Đã rút",
};
const filters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "applied", label: "Mới nộp" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "reviewing", label: "Đang duyệt" },
  { value: "shortlisted", label: "Qua sơ tuyển" },
  { value: "interview", label: "Phỏng vấn" },
  { value: "accepted", label: "Đã nhận" },
  { value: "rejected", label: "Từ chối" },
  { value: "withdrawn", label: "Đã rút" },
];
const editableStatuses: EditableStatus[] = [
  "pending",
  "reviewing",
  "shortlisted",
  "interview",
  "accepted",
  "rejected",
];
const interviewRounds = [
  { value: "screening", title: "Vòng 1: Phỏng vấn sơ bộ", detail: "Trao đổi phù hợp ban đầu" },
  { value: "technical", title: "Vòng 2: Chuyên môn", detail: "Năng lực và kinh nghiệm" },
  { value: "final", title: "Vòng 3: Văn hóa / Ban giám đốc", detail: "Định hướng phát triển" },
] as const;
const interviewTimeSlots = ["09:00", "10:30", "14:30", "16:00"] as const;

function formatDate(value?: string) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : date.toLocaleDateString("vi-VN");
}

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatInterviewTime(interview: Interview) {
  const start = new Date(interview.scheduledAt);
  const end = new Date(start.getTime() + interview.durationMinutes * 60_000);
  const format = (value: Date) =>
    value.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${format(start)} – ${format(end)}`;
}

function formatDateInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Yêu cầu không thành công.";
}

export function HrApplicationsScreen() {
  const tabBarScrollProps = useFloatingTabBarScrollHandler();
  const [jobs, setJobs] = useState<HrJob[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobPickerOpen, setJobPickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [scheduledApplication, setScheduledApplication] =
    useState<ApplicationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (refresh = false) => {
    const id = ++requestId.current;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [jobRows, interviewRows] = await Promise.all([
        hrApi.jobs(),
        hrApi.interviews(),
      ]);
      const applicationGroups = await Promise.all(
        jobRows.map(async (job) => {
          const rows = await hrApi.applications(job.id);
          return rows.map((row) => ({ ...row, jobTitle: job.title }));
        }),
      );
      if (id === requestId.current) {
        setJobs(jobRows);
        setApplications(
          applicationGroups
            .flat()
            .sort(
              (a, b) =>
                new Date(b.appliedAt).getTime() -
                new Date(a.appliedAt).getTime(),
            ),
        );
        setInterviews(interviewRows);
      }
    } catch (requestError) {
      if (id === requestId.current) setError(errorMessage(requestError));
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
      return () => {
        requestId.current += 1;
      };
    }, [load]),
  );

  const visible = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("vi");
    return applications.filter(
      (application) =>
        (!selectedJobId || application.jobId === selectedJobId) &&
        (statusFilter === "all" || application.status === statusFilter) &&
        (!search ||
          [
            application.fullName,
            application.email,
            application.phone,
            application.jobTitle,
            ...(application.skills ?? []),
          ].some((value) => value?.toLocaleLowerCase("vi").includes(search))),
    );
  }, [applications, query, selectedJobId, statusFilter]);

  const todayInterviews = useMemo(() => {
    const today = new Date();
    return interviews
      .filter(
        (interview) =>
          interview.status === "scheduled" &&
          isSameLocalDay(new Date(interview.scheduledAt), today),
      )
      .sort(
        (left, right) =>
          new Date(left.scheduledAt).getTime() -
          new Date(right.scheduledAt).getTime(),
      )
      .map((interview) => ({
        interview,
        application: applications.find(
          (application) => application.id === interview.applicationId,
        ),
      }));
  }, [applications, interviews]);

  const changeStatus = async (
    application: ApplicationRow,
    status: EditableStatus,
  ) => {
    if (status === application.status) return;
    setUpdatingId(application.id);
    try {
      const updated = await hrApi.updateApplicationStatus(
        application.id,
        status,
      );
      setApplications((current) =>
        current.map((row) =>
          row.id === application.id
            ? {
                ...row,
                status: updated.status,
                updatedAt: updated.updatedAt,
                statusHistory: updated.statusHistory,
              }
            : row,
        ),
      );
    } catch (requestError) {
      Alert.alert("Không cập nhật được trạng thái", errorMessage(requestError));
    } finally {
      setUpdatingId(null);
    }
  };

  const openStatusPicker = (application: ApplicationRow) => {
    Alert.alert("Trạng thái hồ sơ", application.fullName || "Ứng viên", [
      ...editableStatuses.map((status) => ({
        text: statusLabels[status],
        onPress: () => {
          void changeStatus(application, status);
        },
      })),
      { text: "Hủy", style: "cancel" },
    ]);
  };

  const openCv = async (application: ApplicationRow) => {
    try {
      await openApplicationCv(application.id);
    } catch (requestError) {
      Alert.alert("Không mở được CV", errorMessage(requestError));
    }
  };

  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>KONEK</Text>
        <Text style={styles.roleBadge}>NHÀ TUYỂN DỤNG</Text>
      </View>
      <ScrollView
        {...tabBarScrollProps}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void load(true);
            }}
            tintColor={colors.light.brand.secondary}
          />
        }
        scrollEventThrottle={16}
      >
        <TodayInterviewPanel rows={todayInterviews} />
        <Text style={styles.sectionLabel}>Vị trí đang tuyển</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setJobPickerOpen(true)}
          style={styles.selector}
        >
          <Text numberOfLines={1} style={styles.selectorText}>
            {selectedJob?.title || "Tất cả vị trí"}
          </Text>
          <Ionicons
            color={colors.light.text.secondary}
            name="chevron-down"
            size={18}
          />
        </Pressable>
        <View style={styles.searchBox}>
          <Ionicons
            color={colors.light.text.secondary}
            name="search-outline"
            size={18}
          />
          <TextInput
            accessibilityLabel="Tìm hồ sơ"
            onChangeText={setQuery}
            placeholder="Tìm theo tên, email hoặc vị trí"
            placeholderTextColor={colors.light.text.secondary}
            style={styles.searchInput}
            value={query}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((filter) => (
            <Pressable
              key={filter.value}
              accessibilityRole="button"
              accessibilityState={{ selected: statusFilter === filter.value }}
              onPress={() => setStatusFilter(filter.value)}
              style={[
                styles.filter,
                statusFilter === filter.value && styles.filterActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {loading && applications.length === 0 ? (
          <ActivityIndicator
            color={colors.light.brand.secondary}
            style={styles.loading}
          />
        ) : null}
        {error ? (
          <View style={styles.messageCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void load();
              }}
            >
              <Text style={styles.linkText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : null}
        {!loading ? (
          <Text style={styles.resultText}>{visible.length} hồ sơ</Text>
        ) : null}
        {!loading && !error && visible.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.emptyText}>Chưa có hồ sơ phù hợp.</Text>
          </View>
        ) : null}
        {visible.map((application) => (
          <ApplicationCard
            application={application}
            interview={interviews.find(
              (item) =>
                item.applicationId === application.id &&
                item.status === "scheduled",
            )}
            key={application.id}
            onOpenCv={() => {
              void openCv(application);
            }}
            onOpenStatus={() => openStatusPicker(application)}
            onSchedule={() => setScheduledApplication(application)}
            updating={updatingId === application.id}
          />
        ))}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent
        visible={jobPickerOpen}
        onRequestClose={() => setJobPickerOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Đóng cửa sổ chọn vị trí"
            onPress={() => setJobPickerOpen(false)}
            style={styles.modalBackdropPress}
          />
          <View style={styles.pickerCard}>
            <Text style={styles.modalTitle}>Chọn vị trí tuyển dụng</Text>
            <ScrollView style={styles.pickerList}>
              {[{ id: null, title: "Tất cả vị trí" }, ...jobs].map((job) => (
                <Pressable
                  key={job.id || "all"}
                  onPress={() => {
                    setSelectedJobId(job.id);
                    setJobPickerOpen(false);
                  }}
                  style={styles.pickerRow}
                >
                  <Text style={styles.pickerText}>{job.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setJobPickerOpen(false)}>
              <Text style={styles.linkText}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {scheduledApplication ? (
        <InterviewScheduleModal
          application={scheduledApplication}
          onClose={() => setScheduledApplication(null)}
          onCreated={() => {
            setScheduledApplication(null);
            void load(true);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function TodayInterviewPanel({
  rows,
}: {
  rows: { interview: Interview; application?: ApplicationRow }[];
}) {
  const openInterview = async (interview: Interview) => {
    if (interview.mode === "online" && interview.meetingLink) {
      try {
        await Linking.openURL(interview.meetingLink);
      } catch {
        Alert.alert("Không mở được cuộc họp", "Đường dẫn cuộc họp chưa hợp lệ.");
      }
      return;
    }
    Alert.alert(
      "Địa điểm phỏng vấn",
      interview.location || "Chưa cập nhật địa điểm.",
    );
  };

  return (
    <View style={styles.todayPanel}>
      <View style={styles.todayHeader}>
        <View style={styles.todayTitleGroup}>
          <Ionicons color="#FFFFFF" name="calendar-outline" size={18} />
          <Text style={styles.todayTitle}>Lịch phỏng vấn hôm nay</Text>
          {rows.length ? (
            <View style={styles.todayCount}>
              <Text style={styles.todayCountText}>{rows.length}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.upcomingBadge}>
          <Text style={styles.upcomingText}>Sắp diễn ra</Text>
        </View>
      </View>

      {rows.length === 0 ? (
        <View style={styles.todayEmpty}>
          <Ionicons color="rgba(255,255,255,0.62)" name="time-outline" size={18} />
          <Text style={styles.todayEmptyText}>
            Hôm nay chưa có lịch phỏng vấn.
          </Text>
        </View>
      ) : (
        rows.slice(0, 3).map(({ interview, application }) => (
          <View key={interview.id} style={styles.interviewRow}>
            <View style={styles.interviewAvatar}>
              <Text style={styles.interviewAvatarText}>
                {(application?.fullName || "Ứng viên").trim().charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.interviewInfo}>
              <Text numberOfLines={1} style={styles.interviewName}>
                {application?.fullName || "Ứng viên"}
              </Text>
              <Text numberOfLines={1} style={styles.interviewMeta}>
                {formatInterviewTime(interview)} ·{" "}
                {interview.mode === "online"
                  ? "Trực tuyến"
                  : interview.location || "Trực tiếp"}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void openInterview(interview);
              }}
              style={({ pressed }) => [
                styles.interviewAction,
                pressed && styles.interviewActionPressed,
              ]}
            >
              <Ionicons
                color={interview.mode === "online" ? "#FFFFFF" : "#D7E3FA"}
                name={interview.mode === "online" ? "videocam" : "location"}
                size={14}
              />
              <Text style={styles.interviewActionText}>
                {interview.mode === "online" ? "Vào Meet" : "Xem lịch"}
              </Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

function ApplicationCard({
  application,
  interview,
  onOpenCv,
  onOpenStatus,
  onSchedule,
  updating,
}: {
  application: ApplicationRow;
  interview?: Interview;
  onOpenCv: () => void;
  onOpenStatus: () => void;
  onSchedule: () => void;
  updating: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons
            color={colors.light.brand.secondary}
            name="person-outline"
            size={22}
          />
        </View>
        <View style={styles.cardHeading}>
          <Text style={styles.name}>{application.fullName || "Ứng viên"}</Text>
          <Text style={styles.jobTitle}>{application.jobTitle}</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        Nộp ngày {formatDate(application.appliedAt)}
      </Text>
      {application.email ? (
        <Text style={styles.meta}>{application.email}</Text>
      ) : null}
      {application.phone ? (
        <Text style={styles.meta}>{application.phone}</Text>
      ) : null}
      {application.experienceYears != null ? (
        <Text style={styles.experienceText}>
          {new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(
            application.experienceYears,
          )}{" "}
          năm kinh nghiệm
        </Text>
      ) : null}
      {application.skills?.length ? (
        <View style={styles.skillList}>
          {application.skills.map((skill) => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {interview ? (
        <Text style={styles.interviewText}>
          Phỏng vấn: {formatDate(interview.scheduledAt)} ·{" "}
          {new Date(interview.scheduledAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={updating}
          onPress={onOpenStatus}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryText}>
            {updating
              ? "Đang lưu..."
              : statusLabels[application.status] || application.status}
          </Text>
          <Ionicons
            color={colors.light.brand.secondary}
            name="chevron-down"
            size={14}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onSchedule}
          style={styles.primaryButton}
        >
          <Ionicons
            color={colors.light.text.inverse}
            name="calendar-outline"
            size={16}
          />
          <Text style={styles.primaryText}>Lên lịch phỏng vấn</Text>
        </Pressable>
      </View>
      {application.cvUrl ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenCv}
          style={styles.cvLink}
        >
          <Ionicons
            color={colors.light.brand.secondary}
            name="document-text-outline"
            size={16}
          />
          <Text style={styles.linkText}>Xem CV</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function InterviewScheduleModal({
  application,
  onClose,
  onCreated,
}: {
  application: ApplicationRow;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [round, setRound] = useState<(typeof interviewRounds)[number]["value"]>(
    "technical",
  );
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dateOptions = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("vi-VN", { weekday: "short" });
    return Array.from({ length: 5 }, (_, index) => {
      const value = new Date();
      value.setDate(value.getDate() + index + 1);
      return {
        value: formatDateInput(value),
        weekday: formatter.format(value).replace("Th ", "T"),
        day: String(value.getDate()).padStart(2, "0"),
      };
    });
  }, []);

  const submit = async () => {
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
    const timeParts = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
    const minutes = Number(duration);
    if (!dateParts || !timeParts) {
      setError("Nhập ngày YYYY-MM-DD và giờ HH:mm.");
      return;
    }
    const scheduledAt = new Date(
      Number(dateParts[1]),
      Number(dateParts[2]) - 1,
      Number(dateParts[3]),
      Number(timeParts[1]),
      Number(timeParts[2]),
    );
    if (
      scheduledAt.getFullYear() !== Number(dateParts[1]) ||
      scheduledAt.getMonth() + 1 !== Number(dateParts[2]) ||
      scheduledAt.getDate() !== Number(dateParts[3]) ||
      scheduledAt <= new Date()
    ) {
      setError("Ngày giờ phỏng vấn phải hợp lệ và ở tương lai.");
      return;
    }
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 480) {
      setError("Thời lượng phải từ 1 đến 480 phút.");
      return;
    }
    if (mode === "online" && !meetingLink.trim()) {
      setError("Nhập đường dẫn họp trực tuyến.");
      return;
    }
    if (mode === "offline" && !location.trim()) {
      setError("Nhập địa điểm phỏng vấn.");
      return;
    }
    const payload: InterviewPayload = {
      applicationId: application.id,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: minutes,
      mode,
      meetingLink: mode === "online" ? meetingLink.trim() : undefined,
      location: mode === "offline" ? location.trim() : undefined,
      notes:
        [`Vòng phỏng vấn: ${interviewRounds.find((item) => item.value === round)?.title}`,
          notes.trim()]
          .filter(Boolean)
          .join("\n") || undefined,
    };
    setSaving(true);
    setError("");
    try {
      await hrApi.createInterview(payload);
      onCreated();
      Alert.alert("Đã lên lịch phỏng vấn", "Lịch phỏng vấn đã được lưu.");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable
          accessibilityLabel="Đóng cửa sổ lên lịch"
          onPress={onClose}
          style={styles.modalBackdropPress}
        />
        <View style={styles.scheduleCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeading}>
              <Text style={styles.modalTitle}>Lên lịch phỏng vấn</Text>
              <Text style={styles.subtitle}>
                Xếp lịch trao đổi trực tiếp hoặc trực tuyến với ứng viên
              </Text>
            </View>
            <Pressable accessibilityLabel="Đóng" onPress={onClose}>
              <Ionicons
                color={colors.light.text.secondary}
                name="close"
                size={22}
              />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.candidateSummary}>
              <View style={styles.scheduleAvatar}>
                <Text style={styles.scheduleAvatarText}>
                  {(application.fullName || "Ứng viên").trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateName}>
                  {application.fullName || "Ứng viên"}
                </Text>
                <Text style={styles.candidateRole}>{application.jobTitle}</Text>
                {application.email ? (
                  <Text numberOfLines={1} style={styles.candidateContact}>
                    {application.email}
                  </Text>
                ) : null}
              </View>
            </View>

            <ScheduleSectionTitle icon="git-branch-outline" label="Vòng phỏng vấn" />
            <View style={styles.roundList}>
              {interviewRounds.map((item, index) => {
                const selected = round === item.value;
                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setRound(item.value)}
                    style={[styles.roundOption, selected && styles.roundOptionSelected]}
                  >
                    <View style={[styles.roundNumber, selected && styles.roundNumberSelected]}>
                      <Text style={[styles.roundNumberText, selected && styles.roundNumberTextSelected]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.roundInfo}>
                      <Text style={[styles.roundTitle, selected && styles.roundTitleSelected]}>
                        {item.title}
                      </Text>
                      <Text style={styles.roundDetail}>{item.detail}</Text>
                    </View>
                    {selected ? (
                      <Ionicons color={colors.light.brand.secondary} name="checkmark-circle" size={18} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <ScheduleSectionTitle icon="videocam-outline" label="Hình thức phỏng vấn" />
            <View style={styles.modeRow}>
              {(["online", "offline"] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: mode === value }}
                  onPress={() => setMode(value)}
                  style={[
                    styles.modeButton,
                    mode === value && styles.modeSelected,
                  ]}
                >
                  <Ionicons
                    color={mode === value ? colors.light.brand.secondary : colors.light.text.secondary}
                    name={value === "online" ? "videocam-outline" : "business-outline"}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.modeText,
                      mode === value && styles.modeTextSelected,
                    ]}
                  >
                    {value === "online" ? "Trực tuyến" : "Trực tiếp"}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              accessibilityLabel={
                mode === "online" ? "Đường dẫn họp" : "Địa điểm"
              }
              autoCapitalize="none"
              onChangeText={mode === "online" ? setMeetingLink : setLocation}
              placeholder={
                mode === "online"
                  ? "https://meet.example.com/..."
                  : "Địa chỉ phỏng vấn"
              }
              style={styles.input}
              value={mode === "online" ? meetingLink : location}
            />

            <ScheduleSectionTitle icon="calendar-outline" label="Chọn ngày phỏng vấn" />
            <View style={styles.dateOptions}>
              {dateOptions.map((option) => {
                const selected = date === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setDate(option.value)}
                    style={[styles.dateOption, selected && styles.dateOptionSelected]}
                  >
                    <Text style={[styles.dateWeekday, selected && styles.dateTextSelected]}>
                      {option.weekday}
                    </Text>
                    <Text style={[styles.dateDay, selected && styles.dateTextSelected]}>
                      {option.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              accessibilityLabel="Ngày phỏng vấn khác"
              onChangeText={setDate}
              placeholder="Ngày khác: YYYY-MM-DD"
              placeholderTextColor={colors.light.text.secondary}
              style={styles.input}
              value={date}
            />

            <View style={styles.sectionTitleWithMeta}>
              <ScheduleSectionTitle icon="time-outline" label="Khung giờ phỏng vấn" />
              <Text style={styles.durationText}>Thời lượng: {duration} phút</Text>
            </View>
            <View style={styles.timeGrid}>
              {interviewTimeSlots.map((slot) => {
                const selected = time === slot;
                return (
                  <Pressable
                    key={slot}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setTime(slot);
                      setDuration("60");
                    }}
                    style={[styles.timeOption, selected && styles.timeOptionSelected]}
                  >
                    <Text style={[styles.timeText, selected && styles.timeTextSelected]}>
                      {slot} – {`${String(Number(slot.slice(0, 2)) + 1).padStart(2, "0")}${slot.slice(2)}`}
                    </Text>
                    <Text style={[styles.availableText, selected && styles.availableTextSelected]}>
                      Trống
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.customTimeRow}>
              <View style={styles.customTimeField}>
                <Text style={styles.compactFieldLabel}>Giờ bắt đầu</Text>
                <TextInput
                  accessibilityLabel="Giờ bắt đầu khác"
                  onChangeText={setTime}
                  placeholder="HH:mm"
                  placeholderTextColor={colors.light.text.secondary}
                  style={styles.input}
                  value={time}
                />
              </View>
              <View style={styles.durationField}>
                <Text style={styles.compactFieldLabel}>Thời lượng</Text>
                <View style={styles.durationInputShell}>
                  <TextInput
                    accessibilityLabel="Thời lượng tính bằng phút"
                    keyboardType="number-pad"
                    onChangeText={setDuration}
                    placeholder="60"
                    placeholderTextColor={colors.light.text.secondary}
                    style={styles.durationTextInput}
                    value={duration}
                  />
                  <Text style={styles.durationSuffix}>phút</Text>
                </View>
              </View>
            </View>

            <ScheduleSectionTitle icon="mail-outline" label="Nội dung gửi ứng viên" />
            <TextInput
              accessibilityLabel="Nội dung gửi ứng viên"
              multiline
              onChangeText={setNotes}
              placeholder="Nhập lời nhắn hoặc yêu cầu chuẩn bị trước buổi phỏng vấn"
              placeholderTextColor={colors.light.text.secondary}
              style={[styles.input, styles.notesInput]}
              value={notes}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() => {
                void submit();
              }}
              style={[
                styles.primaryButton,
                styles.submitButton,
                saving && styles.disabled,
              ]}
            >
              <Ionicons color={colors.light.text.inverse} name="send-outline" size={16} />
              <Text style={styles.primaryText}>
                {saving ? "Đang lưu..." : "Xác nhận & Lên lịch"}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelScheduleButton}>
              <Text style={styles.cancelScheduleText}>Hủy bỏ</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ScheduleSectionTitle({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  return (
    <View style={styles.scheduleSectionTitle}>
      <Ionicons color={colors.light.text.primary} name={icon} size={15} />
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.light.background.primary },
  header: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.light.background.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.border.subtle,
  },
  brand: { color: colors.light.brand.primary, fontSize: 20, fontWeight: "800" },
  roleBadge: {
    color: colors.light.brand.secondary,
    backgroundColor: colors.light.brand.accent,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "700",
  },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  subtitle: { color: colors.light.text.secondary, fontSize: 13 },
  sectionLabel: {
    color: colors.light.text.secondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.45,
    marginTop: spacing.xs,
    textTransform: "uppercase",
  },
  todayPanel: {
    backgroundColor: colors.light.brand.primary,
    borderRadius: 14,
    padding: 10,
    gap: 6,
  },
  todayHeader: {
    minHeight: 32,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  todayTitleGroup: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayTitle: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  todayCount: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light.brand.secondary,
  },
  todayCountText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  upcomingBadge: {
    minHeight: 26,
    paddingHorizontal: 9,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  upcomingText: { color: "#AFC7EF", fontSize: 10, fontWeight: "600" },
  todayEmpty: {
    minHeight: 54,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  todayEmptyText: { color: "#D7E3FA", fontSize: 12 },
  interviewRow: {
    minHeight: 62,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  interviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
  },
  interviewAvatarText: {
    color: colors.light.brand.secondary,
    fontSize: 15,
    fontWeight: "800",
  },
  interviewInfo: { minWidth: 0, flex: 1, gap: 3 },
  interviewName: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  interviewMeta: { color: "#B9C9E5", fontSize: 10, lineHeight: 14 },
  interviewAction: {
    minHeight: 34,
    paddingHorizontal: 9,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.light.brand.secondary,
  },
  interviewActionPressed: { opacity: 0.76 },
  interviewActionText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  selector: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.light.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    color: colors.light.text.primary,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  searchBox: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.light.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInput: { flex: 1, color: colors.light.text.primary, fontSize: 13 },
  filters: { gap: spacing.sm, paddingVertical: spacing.xs },
  filter: {
    borderRadius: 99,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light.background.surface,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
  },
  filterActive: {
    backgroundColor: colors.light.brand.secondary,
    borderColor: colors.light.brand.secondary,
  },
  filterText: {
    color: colors.light.text.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: { color: colors.light.text.inverse },
  loading: { marginTop: spacing.xl },
  resultText: {
    color: colors.light.text.secondary,
    fontSize: 12,
    marginVertical: spacing.xs,
  },
  messageCard: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.light.background.surface,
    gap: spacing.sm,
  },
  errorText: { color: colors.light.status.danger, fontSize: 13 },
  emptyText: { color: colors.light.text.secondary, fontSize: 13 },
  linkText: {
    color: colors.light.brand.secondary,
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.light.background.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.light.brand.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeading: { flex: 1, gap: 2 },
  name: { color: colors.light.text.primary, fontSize: 15, fontWeight: "700" },
  jobTitle: { color: colors.light.text.secondary, fontSize: 12 },
  meta: { color: colors.light.text.secondary, fontSize: 12 },
  experienceText: {
    color: colors.light.brand.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
  skillList: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  skillChip: {
    backgroundColor: colors.light.brand.accent,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  skillText: {
    color: colors.light.brand.secondary,
    fontSize: 11,
    fontWeight: "600",
  },
  interviewText: {
    color: colors.light.brand.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 3,
  },
  secondaryText: {
    color: colors.light.brand.secondary,
    fontSize: 12,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: colors.light.brand.secondary,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  primaryText: {
    color: colors.light.text.inverse,
    fontSize: 12,
    fontWeight: "700",
  },
  cvLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalBackdropPress: { ...StyleSheet.absoluteFill },
  pickerCard: {
    backgroundColor: colors.light.background.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    maxHeight: "70%",
  },
  pickerList: { flexGrow: 0 },
  pickerRow: {
    minHeight: 48,
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.border.subtle,
  },
  pickerText: { color: colors.light.text.primary, fontSize: 14 },
  scheduleCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 480,
    backgroundColor: colors.light.background.surface,
    borderRadius: 16,
    maxHeight: "92%",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.border.subtle,
  },
  modalHeading: { flex: 1, gap: 3 },
  modalTitle: {
    color: colors.light.text.primary,
    fontSize: 17,
    fontWeight: "700",
  },
  formContent: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  candidateSummary: {
    minHeight: 82,
    padding: spacing.sm,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.light.surface.containerLow,
  },
  scheduleAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light.brand.accent,
  },
  scheduleAvatarText: {
    color: colors.light.brand.secondary,
    fontSize: 18,
    fontWeight: "800",
  },
  candidateInfo: { minWidth: 0, flex: 1, gap: 2 },
  candidateName: { color: colors.light.text.primary, fontSize: 14, fontWeight: "700" },
  candidateRole: { color: colors.light.brand.secondary, fontSize: 11, fontWeight: "600" },
  candidateContact: { color: colors.light.text.secondary, fontSize: 10 },
  scheduleSectionTitle: {
    minHeight: 24,
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fieldLabel: {
    color: colors.light.text.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    color: colors.light.text.primary,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
  },
  roundList: { gap: 6 },
  roundOption: {
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.light.background.subtle,
  },
  roundOptionSelected: {
    borderColor: colors.light.brand.secondary,
    backgroundColor: colors.light.surface.containerLow,
  },
  roundNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light.background.surface,
  },
  roundNumberSelected: { backgroundColor: colors.light.brand.secondary },
  roundNumberText: { color: colors.light.text.secondary, fontSize: 11, fontWeight: "700" },
  roundNumberTextSelected: { color: colors.light.text.inverse },
  roundInfo: { minWidth: 0, flex: 1, gap: 2 },
  roundTitle: { color: colors.light.text.primary, fontSize: 11, fontWeight: "600" },
  roundTitleSelected: { color: colors.light.brand.secondary, fontWeight: "700" },
  roundDetail: { color: colors.light.text.secondary, fontSize: 9 },
  notesInput: {
    minHeight: 96,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  modeRow: { flexDirection: "row", gap: spacing.sm },
  modeButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
  },
  modeSelected: {
    borderColor: colors.light.brand.secondary,
    backgroundColor: colors.light.brand.accent,
  },
  modeText: { color: colors.light.text.secondary, fontSize: 13 },
  modeTextSelected: { color: colors.light.brand.secondary, fontWeight: "700" },
  dateOptions: { flexDirection: "row", gap: 6 },
  dateOption: {
    minWidth: 0,
    flex: 1,
    minHeight: 58,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: colors.light.background.subtle,
  },
  dateOptionSelected: { backgroundColor: colors.light.brand.secondary },
  dateWeekday: { color: colors.light.text.secondary, fontSize: 9, textTransform: "uppercase" },
  dateDay: { color: colors.light.text.primary, fontSize: 14, fontWeight: "700" },
  dateTextSelected: { color: colors.light.text.inverse },
  sectionTitleWithMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  durationText: { color: colors.light.text.secondary, fontSize: 9 },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  timeOption: {
    width: "49%",
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    backgroundColor: colors.light.background.surface,
  },
  timeOptionSelected: {
    borderColor: colors.light.brand.secondary,
    backgroundColor: colors.light.brand.secondary,
  },
  timeText: { color: colors.light.text.primary, fontSize: 10, fontWeight: "600" },
  timeTextSelected: { color: colors.light.text.inverse },
  availableText: { color: colors.light.status.success, fontSize: 8, fontWeight: "600" },
  availableTextSelected: { color: "#D7FBE8" },
  customTimeRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  customTimeField: { minWidth: 0, flex: 1, gap: 5 },
  durationField: { width: 128, gap: 5 },
  compactFieldLabel: { color: colors.light.text.secondary, fontSize: 10, fontWeight: "600" },
  durationInputShell: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    paddingLeft: spacing.sm,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  durationTextInput: {
    minWidth: 0,
    flex: 1,
    minHeight: 42,
    color: colors.light.text.primary,
    fontSize: 14,
    paddingVertical: 0,
  },
  durationSuffix: { color: colors.light.text.secondary, fontSize: 11 },
  submitButton: { marginTop: spacing.sm, flex: 0, minHeight: 48 },
  cancelScheduleButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelScheduleText: { color: colors.light.text.secondary, fontSize: 12, fontWeight: "600" },
  disabled: { opacity: 0.6 },
});
