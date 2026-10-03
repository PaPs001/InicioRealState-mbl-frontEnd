import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import AppLoadingScreen from "@/components/animations/AppLoadingScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLeadsPrincipalScreen } from "../hooks/useLeadsPrincipalScreen";
import { LeadDetailScreen } from "./leadsDetailsScreen";

export default function LeadDetailRouteScreen() {
  const flow = useLeadsPrincipalScreen({ mode: "advisor" });
  const goBack = () =>
    router.canGoBack()
      ? router.back()
      : router.replace("/userAdviser/lead-tracking");
  const lead = flow.selectedLead;
  if (!lead && flow.isLoadingLeads) return <AppLoadingScreen />;
  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      {lead ? (
        <LeadDetailScreen
          lead={lead.rawLead}
          mode="advisor"
          getPropertyName={(id) => flow.getPropertyById(id)?.title}
          customLeadStatuses={flow.customLeadStatuses}
          isLoadingCustomLeadStatuses={flow.isLoadingCustomLeadStatuses}
          onApplyCustomStatus={flow.applyCustomLeadStatus}
          onApplyNextAction={flow.applyLeadNextAction}
          onBack={goBack}
          onViewFollowUps={() => flow.openLeadFollowUps(lead)}
          followings={flow.selectedLeadFollowings}
          followingsError={flow.selectedLeadFollowingsError}
          isLoadingFollowings={flow.isLoadingSelectedLeadFollowings}
          onReloadFollowings={flow.loadSelectedLeadFollowings}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          }}
        >
              <Text>{flow.errorMessage || "No se encontró el lead."}</Text>
              <Pressable onPress={() => void flow.loadLeads()}>
                <Text>Reintentar</Text>
              </Pressable>
          <Pressable onPress={goBack}>
            <Text>Volver</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
