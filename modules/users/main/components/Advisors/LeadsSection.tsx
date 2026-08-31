import { View, Text, TouchableOpacity } from "react-native";
import { Eye } from "lucide-react-native";
import {
  LeadMetricCard,
  FunnelMetric,
  LeadAlertRow,
} from "./DashboardCards";

type LeadsSectionProps = {
  isLeadsLoading: boolean;
  leadSummary: any;
  onViewMore: () => void;
  onViewDetail: () => void;
  styles: any;
};

export function LeadsSection({
  isLeadsLoading,
  leadSummary,
  onViewMore,
  onViewDetail,
  styles,
}: LeadsSectionProps) {
  return (
    <View style={[styles.panel, styles.leadPanel]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionHeaderTitle}>Seguimientos</Text>
          <Text style={styles.panelSubtitle}>
            Panorama general de actividad de leads
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} onPress={onViewMore}>
          <Text style={styles.sectionAction}>Ver mas</Text>
        </TouchableOpacity>
      </View>
      {isLeadsLoading ? (
        <Text style={styles.panelSubtitle}>Cargando leads...</Text>
      ) : (
        <>
          <View style={styles.metricGrid}>
            {leadSummary.leadMetrics.map((metric: any) => (
              <LeadMetricCard key={metric.id} metric={metric} />
            ))}
          </View>
          <Text style={styles.subTitle}>Vista rapida</Text>
          <View style={styles.funnelRow}>
            {leadSummary.leadFunnel.map((metric: any) => (
              <FunnelMetric key={metric.id} metric={metric} />
            ))}
          </View>
          {leadSummary.leadAlerts.map((alert: any) => (
            <LeadAlertRow key={alert.id} alert={alert} />
          ))}
          <TouchableOpacity
            style={styles.outlineButton}
            activeOpacity={0.85}
            onPress={onViewDetail}
          >
            <Eye size={16} color="#006b43" />
            <Text style={styles.outlineButtonText}>Ver detalle</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
