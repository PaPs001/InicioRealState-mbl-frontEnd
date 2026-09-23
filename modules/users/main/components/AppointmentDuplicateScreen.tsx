import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import type { DuplicateLeadCandidate } from "@/lib/api";
import { styles } from "./styles/appointmentCreateModal.style";
export function AppointmentDuplicateScreen({ candidates, isProcessing, onUseDuplicateLead }: { candidates: DuplicateLeadCandidate[]; isProcessing: boolean; onUseDuplicateLead: (candidate: DuplicateLeadCandidate) => void }) {
return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.appointmentModalContent}
        >
          <Text style={styles.calendarSettingsEmpty}>
            Encontramos leads similares. Revisa su informacion antes de crear
            uno nuevo.
          </Text>
          <View style={styles.appointmentSelectionList}>
            {candidates.map((candidate) => (
              <View
                key={
                  candidate.id || `${candidate.fullName}-${candidate.createdAt}`
                }
                style={styles.appointmentSelectionRow}
              >
                <View style={styles.appointmentSelectionRowCopy}>
                  <Text
                    style={styles.appointmentSelectionRowTitle}
                    numberOfLines={1}
                  >
                    {candidate.fullName ||
                      candidate.client ||
                      "Lead sin nombre"}
                  </Text>
                  <Text style={styles.appointmentSelectionRowMeta}>
                    {formatDuplicateContact(candidate)}
                  </Text>
                  <Text style={styles.appointmentSelectionRowMeta}>
                    {formatDuplicateMatch(candidate)}
                  </Text>
                  {candidate.followUpCount > 0 ? (
                    <Text style={styles.appointmentSelectionRowMeta}>
                      {formatDuplicateFollowUps(candidate)}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.calendarPrimaryButton}
                  onPress={() => onUseDuplicateLead(candidate)}
                  disabled={!candidate.id || isProcessing}
                  activeOpacity={0.85}
                >
                  <Text style={styles.calendarPrimaryButtonText}>
                    Usar este lead
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
);
}
function formatDuplicateContact(candidate: DuplicateLeadCandidate) {
  const details = [
    candidate.phone,
    candidate.email,
    candidate.systemStatus || candidate.status,
  ].filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  return details.join(" · ") || "Sin telefono ni correo registrados";
}

function formatDuplicateMatch(candidate: DuplicateLeadCandidate) {
  const reasons = [
    candidate.nameMatch === "exact" ? "Nombre exacto" : "Nombre similar",
    candidate.phoneMatch ? "telefono coincide" : "",
    candidate.emailMatch ? "correo coincide" : "",
  ].filter(Boolean);

  return `${candidate.strength === "strong" ? "Coincidencia fuerte" : "Posible coincidencia"}: ${reasons.join(", ")}`;
}

function formatDuplicateFollowUps(candidate: DuplicateLeadCandidate) {
  const count = candidate.followUpCount;
  const label = `${count} ${count === 1 ? "seguimiento" : "seguimientos"}`;
  if (!candidate.lastFollowUpAt) return label;

  const date = new Date(candidate.lastFollowUpAt);
  if (Number.isNaN(date.getTime())) return label;

  return `${label} · Ultimo: ${new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}
