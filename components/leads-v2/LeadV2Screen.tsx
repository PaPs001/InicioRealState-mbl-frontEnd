import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock3,
  Mic,
  Plus,
  Radio,
  Search,
} from 'lucide-react-native'
import { icons, logos } from '@/assets'

// Circulo de mas opciones de Leads: oculto por solicitud.
// import { LeadQuickActionsButton } from '@/components/leads/LeadQuickActionsButton'
import { AlertRow, AgentGroupCard, PriorityLeadCard } from '@/components/leads-v2/LeadV2Cards'
import { LeadCreateModal } from '@/components/leads-v2/LeadCreateModal'
import { useLeadsV2Screen, coordinatorLeadV2Channels } from '@/components/leads-v2/useLeadsV2Screen'
import { coordinatorLeadV2AssistantActions, type LeadV2ViewModel, type LeadsV2RouteParams } from '@/components/leads-v2/types'
import { getParamValue } from '@/components/leads-v2/lead-v2-utils'
import { LeadDetailView } from '@/app/(users)/userCoordinator/leads-v2/leads'
import { LeadDetailScreen } from '@/modules/users/leads/screens/leadsDetailsScreen'
import { styles } from '@/app/(users)/userCoordinator/leads-v2/index.styles'

type LeadV2ScreenMode = 'coordinator' | 'advisor'

type LeadV2ScreenProps = {
  mode: LeadV2ScreenMode
}

export function LeadV2Screen({ mode }: LeadV2ScreenProps) {
  const routeParams = useLocalSearchParams<LeadsV2RouteParams>()
  const isAdviserRoute = mode === 'advisor'
  const selectedLeadIdParam = getParamValue(routeParams.selectedLeadId)
  const {
    alerts,
    clearSelectedAgentGroup,
    applyCustomLeadStatus,
    applyLeadNextAction,
    closeCreateLeadModal,
    createLeadError,
    createLeadForm,
    currentLeadPage,
    customLeadStatuses,
    errorMessage,
    filteredAgentGroups,
    filteredPropertyOptions,
    getPropertyById,
    isAssistantOpen,
    isCatalogLoading,
    isCreateLeadModalOpen,
    isCreatingLead,
    isLoadingCustomLeadStatuses,
    isLoadingLeads,
    isSelectingProperty,
    loadLeads,
    metrics,
    openCreateLeadModal,
    paginatedLeads,
    propertyOptions,
    propertySearchQuery,
    searchQuery,
    selectAgentGroup,
    selectPropertyForLead,
    selectedAgentGroup,
    selectedChannel,
    selectedLead,
    selectedProperty,
    setDismissedRouteLeadId,
    setIsAssistantOpen,
    setIsSelectingProperty,
    setLeadPage,
    setPropertySearchQuery,
    setSearchQuery,
    setSelectedChannel,
    setSelectedLead,
    submitCreateLead,
    totalLeadPages,
    updateCreateLeadField,
  } = useLeadsV2Screen({ isAdviserRoute, selectedLeadIdParam })

  const openLeadFollowUps = (lead: LeadV2ViewModel) => {
    const followUpsPath = isAdviserRoute
      ? '/userAdviser/leads-v2/followups'
      : '/userCoordinator/leads-v2/followups'
    const returnToPath = isAdviserRoute
      ? '/userAdviser/leads'
      : '/userCoordinator/leads'

    router.push({
      pathname: followUpsPath,
      params: {
        leadId: lead.id,
        leadName: lead.name,
        phone: lead.phone || '',
        returnTo: returnToPath,
      },
    } as never)
  }

  const closeLeadDetail = () => {
    if (selectedLeadIdParam) {
      setDismissedRouteLeadId(selectedLeadIdParam)
    }

    setSelectedLead(null)

    if (selectedLeadIdParam) {
      router.replace((isAdviserRoute ? '/userAdviser/leads' : '/userCoordinator/leads') as never)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {selectedLead ? (
          <LeadDetailScreen
            customLeadStatuses={customLeadStatuses}
            getPropertyName={(propertyId) => getPropertyById(propertyId)?.title}
            isLoadingCustomLeadStatuses={isLoadingCustomLeadStatuses}
            lead={selectedLead.rawLead}
            mode={mode}
            onApplyCustomStatus={applyCustomLeadStatus}
            onApplyNextAction={applyLeadNextAction}
            onBack={closeLeadDetail}
            onViewFollowUps={() => openLeadFollowUps(selectedLead)}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.brandBlock}>
              <logos.irsPrincipal width={146} height={48}/>
            </View>

            <View style={styles.headerRow}>
              {!isAdviserRoute && selectedAgentGroup ? (
                <TouchableOpacity
                  style={styles.backButton}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Volver a asesores"
                  onPress={clearSelectedAgentGroup}
                >
                  <ArrowLeft size={20} color="#19191f" />
                </TouchableOpacity>
              ) : null}
              <View style={styles.headerCopy}>
                <Text style={styles.title}>{isAdviserRoute ? 'Mis leads' : 'Leads'}</Text>
                <Text style={styles.subtitle}>
                  {isLoadingLeads
                    ? 'Cargando leads...'
                    : isAdviserRoute
                      ? 'Seguimiento de tus leads asignados'
                      : selectedAgentGroup
                      ? `Leads de ${selectedAgentGroup.name}`
                      : 'Selecciona un asesor'}
                </Text>
              </View>
            </View>

            <View style={styles.metricRow}>
              {metrics.map((metric) => (
                <View key={metric.id} style={styles.metricCard}>
                  <View style={[styles.metricDot, { backgroundColor: metric.color }]} />
                  <View>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <Text style={styles.metricLabel} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>
                      {metric.label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.searchRow}>
              <Search size={16} color="#b2b0b0" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={(value) => {
                  setSearchQuery(value)
                  setLeadPage(1)
                }}
                placeholder={isAdviserRoute || selectedAgentGroup ? 'Buscar por lead, propiedad o canal' : 'Buscar asesor'}
                placeholderTextColor="#b2b0b0"
              />
            </View>

            {isAdviserRoute || selectedAgentGroup ? (
              <View style={styles.filterRow}>
                {coordinatorLeadV2Channels.map((channel) => {
                  const isActive = selectedChannel === channel
                  return (
                    <TouchableOpacity
                      key={channel}
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedChannel(channel)
                        setLeadPage(1)
                      }}
                    >
                      <Text
                        style={[styles.filterText, isActive && styles.filterTextActive]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.72}
                      >
                        {channel}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>Alertas</Text>
            <View style={styles.alertList}>
              {alerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </View>

            <Text style={styles.sectionTitle}>{isAdviserRoute || selectedAgentGroup ? 'Leads Prioritarios' : 'Asesores'}</Text>
            {isLoadingLeads ? (
              <View style={styles.emptyState}>
                <Clock3 size={24} color="#c8c1b8" />
                <Text style={styles.emptyStateText}>Cargando leads...</Text>
              </View>
            ) : errorMessage ? (
              <TouchableOpacity style={styles.emptyState} activeOpacity={0.85} onPress={loadLeads}>
                <AlertTriangle size={24} color="#ba544a" />
                <Text style={styles.emptyStateText}>{errorMessage}. Toca para reintentar.</Text>
              </TouchableOpacity>
            ) : !(isAdviserRoute || selectedAgentGroup) ? (
              filteredAgentGroups.length > 0 ? (
                <View style={styles.leadList}>
                  {filteredAgentGroups.map((group) => (
                    <AgentGroupCard
                      key={group.id}
                      group={group}
                      onPress={() => selectAgentGroup(group)}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Search size={24} color="#c8c1b8" />
                  <Text style={styles.emptyStateText}>Sin asesores para este filtro</Text>
                </View>
              )
            ) : paginatedLeads.length > 0 ? (
              <>
                <View style={styles.leadList}>
                  {paginatedLeads.map((lead) => (
                    <PriorityLeadCard
                      key={lead.id}
                      lead={lead}
                      onPress={() => {
                         setSelectedLead(lead)
                      }}
                    />
                  ))}
                </View>
                <View style={styles.paginationActions}>
                  <TouchableOpacity
                    style={[styles.paginationButton, currentLeadPage <= 1 && styles.paginationButtonDisabled]}
                    activeOpacity={0.85}
                    disabled={currentLeadPage <= 1}
                    onPress={() => setLeadPage((current) => Math.max(1, current - 1))}
                  >
                    <Text style={[styles.paginationButtonText, currentLeadPage <= 1 && styles.paginationButtonTextDisabled]}>
                      Anterior
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.paginationButton, currentLeadPage >= totalLeadPages && styles.paginationButtonDisabled]}
                    activeOpacity={0.85}
                    disabled={currentLeadPage >= totalLeadPages}
                    onPress={() => setLeadPage((current) => Math.min(totalLeadPages, current + 1))}
                  >
                    <Text style={[styles.paginationButtonText, currentLeadPage >= totalLeadPages && styles.paginationButtonTextDisabled]}>
                      Siguiente
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Search size={24} color="#c8c1b8" />
                <Text style={styles.emptyStateText}>Sin leads para este asesor o filtro</Text>
              </View>
            )}
          </ScrollView>
        )}

        {!selectedLead ? <View style={styles.assistantDock}>
          {/*{isAssistantOpen ? (
            <View style={styles.assistantMenu}>
              {coordinatorLeadV2AssistantActions.map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.assistantAction,
                    index === coordinatorLeadV2AssistantActions.length - 1 && styles.assistantActionLast,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (action.id === 'add-lead') {
                      openCreateLeadModal()
                    }
                  }}
                >
                  {getAssistantIcon(action.icon)}
                  <Text style={styles.assistantActionText} numberOfLines={1}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}*/}
          <View style={styles.assistantButtonRow}>
            <TouchableOpacity
              style={styles.assistantButton}
              activeOpacity={0.85}
              onPress={() => {
                openCreateLeadModal()
                //setIsAssistantOpen((current) => !current)
              }}
            >
              <Text style={styles.assistantButtonText}>Agregar Lead</Text>
              {/*{isAssistantOpen ? <ChevronDown size={16} color="#ffffff" /> : <ChevronUp size={16} color="#ffffff" />}*/}
            </TouchableOpacity>
            {/*
              Circulo de mas opciones de Leads.
              Se muestra tanto en asesor como coordinador porque esta pantalla
              compartida alimenta /userAdviser/leads y /userCoordinator/leads.
              <LeadQuickActionsButton
                onCreateLead={openCreateLeadModal}
                onOpenChange={(isOpen) => {
                  if (isOpen) setIsAssistantOpen(false)
                }}
              />
            */}
          </View>
        </View> : null}

        <LeadCreateModal
          createError={createLeadError}
          filteredPropertyOptions={filteredPropertyOptions}
          form={createLeadForm}
          isCreating={isCreatingLead}
          isLoadingProperties={isCatalogLoading && propertyOptions.length === 0}
          isSelectingProperty={isSelectingProperty}
          onBackFromPropertyPicker={() => setIsSelectingProperty(false)}
          onClose={closeCreateLeadModal}
          onOpenPropertyPicker={() => setIsSelectingProperty(true)}
          onPropertySearchChange={setPropertySearchQuery}
          onSelectProperty={selectPropertyForLead}
          onSubmit={submitCreateLead}
          onUpdateField={updateCreateLeadField}
          propertySearchQuery={propertySearchQuery}
          selectedProperty={selectedProperty}
          visible={isCreateLeadModalOpen}
        />
      </View>
    </SafeAreaView>
  )
}

function getAssistantIcon(icon: 'mic' | 'wave' | 'plus') {
  if (icon === 'wave') return <Radio size={13} color="#8d8783" />
  if (icon === 'plus') return <Plus size={13} color="#8d8783" />
  return <Mic size={13} color="#8d8783" />
}
