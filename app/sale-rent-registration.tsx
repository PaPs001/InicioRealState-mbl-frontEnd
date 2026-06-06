import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ClipboardList, FileText } from 'lucide-react-native'

import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { RecordsList } from '@/components/sale-rent/RecordsList'
import { SaleRentWizard } from '@/components/sale-rent/SaleRentWizard'
import { renderSaleRentStepContent } from '@/components/sale-rent/step-registry'
import { useSaleRentRegistrationFlow } from '@/components/sale-rent/hooks/useSaleRentRegistrationFlow'
import { AppHeader, AppScreen } from '@/components/ui'
import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { borderRadius, spacing, typography } from '@/lib/theme'

export default function SaleRentRegistrationScreen() {
  const router = useRouter()
  const { theme } = useAppTheme()
  const { currentUser, isAdmin } = useSessionDomain()
  const {
    agentCatalogRawData,
    isAgentCatalogLoading,
    hasLoadedAgentCatalog,
    loadAgentCatalogProperties,
  } = usePropertyDomain()

  const flow = useSaleRentRegistrationFlow({
    agentCatalogRawData,
    currentUserId: currentUser?.id,
    hasLoadedAgentCatalog,
    isAdmin,
    isAgentCatalogLoading,
    loadAgentCatalogProperties,
  })

  const stepContent = renderSaleRentStepContent({
    actions: flow.actions,
    currentStep: flow.stepState.currentStep,
    derived: flow.derived,
    formState: flow.formState,
  })

  const isRecordsMode = flow.viewState.screenMode === 'records'
  const styles = createStyles(theme)

  return (
    <AppScreen>
      <AppHeader
        onBack={isRecordsMode ? () => router.back() : flow.actions.goBack}
        title={
          isRecordsMode
            ? 'Registros de venta y renta'
            : `Registrar ${flow.formState.transactionType === 'sale' ? 'Venta' : flow.formState.transactionType === 'rent' ? 'Renta' : 'Venta/Renta'}`
        }
        subtitle={isRecordsMode ? 'Consulta y abre el detalle de cada operación' : flow.viewState.currentStepTitle}
      />

      {!isAdmin && (
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, isRecordsMode && styles.modeTabActive]}
            onPress={() => flow.actions.setScreenMode('records')}
          >
            <ClipboardList size={16} color={isRecordsMode ? theme.background : theme.textMuted} />
            <Text style={[styles.modeTabText, isRecordsMode && styles.modeTabTextActive]}>Registros</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, flow.viewState.screenMode === 'new' && styles.modeTabActive]}
            onPress={() => flow.actions.setScreenMode('new')}
          >
            <FileText size={16} color={flow.viewState.screenMode === 'new' ? theme.background : theme.textMuted} />
            <Text style={[styles.modeTabText, flow.viewState.screenMode === 'new' && styles.modeTabTextActive]}>Nuevo</Text>
          </TouchableOpacity>
        </View>
      )}

      {isRecordsMode ? (
        <RecordsList
          agentCatalogRawData={agentCatalogRawData}
          isAdmin={isAdmin}
          onCreateNew={() => flow.actions.setScreenMode('new')}
          onOpenRecord={() => Alert.alert('Detalle de registro', 'La vista de detalle se conectará en la siguiente fase.')}
          registrations={flow.viewState.visibleRegistrations}
        />
      ) : (
        <SaleRentWizard
          currentStepIndex={flow.stepState.currentStepIndex}
          goBack={flow.actions.goBack}
          goNext={flow.actions.goNext}
          handleSubmit={flow.actions.handleSubmit}
          isCurrentStepValid={flow.derived.isCurrentStepValid}
          isSummaryStep={flow.stepState.currentStep === 'summary'}
          progress={flow.stepState.progress}
          totalSteps={flow.stepState.totalSteps}
        >
          {stepContent}
        </SaleRentWizard>
      )}
    </AppScreen>
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    modeTabs: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
      gap: spacing.sm,
    },
    modeTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: theme.surface,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: spacing.sm,
    },
    modeTabActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    modeTabText: {
      fontSize: typography.bodySmall.fontSize,
      fontWeight: '600',
      color: theme.textMuted,
    },
    modeTabTextActive: {
      color: theme.background,
    },
  })
