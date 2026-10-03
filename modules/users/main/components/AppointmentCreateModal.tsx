import { AppointmentDuplicateScreen } from "./AppointmentDuplicateScreen";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import type {
  CreateGoogleCalendarDatePayload,
  DuplicateCheckResult,
  DuplicateLeadCandidate,
  SelectedGoogleCalendar,
} from "@/lib/api";
import type { Property, PropertyLead } from "@/lib/types";

import { FilterChip } from "@/components/FilterChip";
import { LEAD_TRACKING_STATUSES, type LeadTrackingStatus } from "@/modules/users/leads/constants/lead-tracking-statuses";
import {
  getAppointmentEndDateTime,
  getPropertyDisplayName,
} from "@/modules/users/main/utils/dashboard-formatters";
import { styles } from "./styles/appointmentCreateModal.style";
import { AppointmentDateTimePicker } from "./AppointmentDateTimePicker";
import { useState } from "react";
import { AppModal } from "@/components/AppModal";
import {
  DEFAULT_APPOINTMENT_TYPE,
  canSelectCalendarManually,
  findCalendarForAppointmentType,
  getAppointmentTypeConfig,
  getAppointmentSubtypeOptions,
  getPrimaryAppointmentTypeOptions,
  isAppointmentType,
  type AppointmentType,
} from "@/lib/config/appointment-Types";
import { Filter } from "react-native-svg";

type AppointmentCreateModalProps = {
  advisorMode: "self" | "external";
  currentUserName?: string;
  onAdvisorModeChange: (mode: "self" | "external") => void;
  appointmentLeadMode: "existing" | "provisional";
  appointmentLeadOptions: PropertyLead[];
  appointmentPropertyOptions: Property[];
  duplicateCheck: DuplicateCheckResult | null;
  enabledSelectedCalendars: SelectedGoogleCalendar[];
  isCatalogLoading: boolean;
  isCreatingAppointment: boolean;
  isGoogleConnected: boolean;
  needsGoogleReconnect?: boolean;
  isLeadsLoading: boolean;
  onClose: () => void;
  onCreateAppointment: () => void;
  onOmitDuplicateAndCreate: () => void;
  onUseDuplicateLead: (candidate: DuplicateLeadCandidate) => void;
  onLeadModeChange: (mode: "existing" | "provisional") => void;
  onSelectCalendar: (calendar: SelectedGoogleCalendar) => void;
  onSelectLead: (lead: PropertyLead) => void;
  onSelectProperty: (property: Property) => void;
  onSelectionScreenChange: (
    screen: "lead" | "property" | "duplicate" | null,
  ) => void;
  onUpdateProvisionalLead: (
    field: "fullName" | "phone" | "email" | "status",
    value: string,
  ) => void;
  onUpdateForm: (
    field: keyof CreateGoogleCalendarDatePayload,
    value: string | null,
  ) => void;
  provisionalLead: {
    fullName: string;
    phone: string;
    email: string;
    status: LeadTrackingStatus;
  };
  selectedAppointmentLead?: PropertyLead;
  selectedAppointmentProperty?: Property;
  selectionScreen: "lead" | "property" | "duplicate" | null;
  testAppointmentForm: CreateGoogleCalendarDatePayload;
  visible: boolean;
};

const END_HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour);

export function AppointmentCreateModal({
  advisorMode,
  currentUserName,
  onAdvisorModeChange,
  appointmentLeadMode,
  appointmentLeadOptions,
  appointmentPropertyOptions,
  duplicateCheck,
  enabledSelectedCalendars,
  isCatalogLoading,
  isCreatingAppointment,
  isGoogleConnected,
  needsGoogleReconnect = false,
  isLeadsLoading,
  onClose,
  onCreateAppointment,
  onOmitDuplicateAndCreate,
  onUseDuplicateLead,
  onLeadModeChange,
  onSelectCalendar,
  onSelectLead,
  onSelectProperty,
  onSelectionScreenChange,
  onUpdateProvisionalLead,
  onUpdateForm,
  provisionalLead,
  selectedAppointmentLead,
  selectedAppointmentProperty,
  selectionScreen,
  testAppointmentForm,
  visible,
}: AppointmentCreateModalProps) {
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);
  const [isEndDateTimePickerVisible, setIsEndDateTimePickerVisible] =
    useState(false);
  const [hasConfirmedDateTime, setHasConfirmedDateTime] = useState(false);
  const [hasConfirmedEndDateTime, setHasConfirmedEndDateTime] = useState(false);
  const [descriptionInputHeight, setDescriptionInputHeight] = useState(80);
  const [isLeadStatusSelectorOpen, setIsLeadStatusSelectorOpen] = useState(false);
  const normalizedAppointmentType = testAppointmentForm.appointmentType
    ?.trim()
    .toLowerCase();
  const selectedAppointmentType: AppointmentType = isAppointmentType(
    normalizedAppointmentType,
  )
    ? normalizedAppointmentType
    : DEFAULT_APPOINTMENT_TYPE;
  const appointmentTypeConfig = getAppointmentTypeConfig(
    selectedAppointmentType,
  );
  const subdivision = appointmentTypeConfig.subdivisionTypes?.find(
    (option) => option.value === testAppointmentForm.subtypeCalendar,
  );
  const effectiveConfig = subdivision ?? appointmentTypeConfig;
  const selectedPrimaryAppointmentType =
    appointmentTypeConfig.parentType ?? selectedAppointmentType;
  const generalSubtypeOptions = getAppointmentSubtypeOptions("general");
  const unavailableGeneralSubtypeOptions = generalSubtypeOptions.filter(
    (type) =>
      !findCalendarForAppointmentType(enabledSelectedCalendars, type.value),
  );
  const isGeneralCategory = selectedPrimaryAppointmentType === "general";
  const showsRelatedInformation = effectiveConfig.lead !== "none";
  const activeColor = effectiveConfig.color;

  const modalTitle =
    selectionScreen === "lead"
      ? "Seleccionar lead"
      : selectionScreen === "property"
        ? "Seleccionar propiedad"
        : selectionScreen === "duplicate"
          ? "Posibles coincidencias"
          : "Crear cita";
  const selectedTypeCalendar = findCalendarForAppointmentType(
    enabledSelectedCalendars,
    selectedAppointmentType,
  );
  const manuallySelectableCalendars = enabledSelectedCalendars.filter(
    canSelectCalendarManually,
  );
  const selectedCalendar = manuallySelectableCalendars.find(
    (calendar) => calendar.calendarId === testAppointmentForm.calendarId,
  );
  const shouldSelectCalendarManually =
    appointmentTypeConfig.calendarSelection === "manual";
  const typeCalendar = shouldSelectCalendarManually
    ? selectedCalendar
    : selectedTypeCalendar;

  const selectAppointmentType = (appointmentType: AppointmentType) => {
    if (appointmentType === selectedAppointmentType) {
      return;
    }

    onUpdateForm("appointmentType", appointmentType);
    onUpdateForm("subtypeCalendar", null);
    onUpdateForm("leadId", "");
    onUpdateForm("propertyId", "");
    onSelectionScreenChange(null);

    const config = getAppointmentTypeConfig(appointmentType);

    if (config.lead === "none") {
      onUpdateForm("leadId", "");
    }
    if (config.property === "none") {
      onUpdateForm("propertyId", "");
    }

    if (config.calendarSelection === "manual") {
      onUpdateForm("calendarId", "");
      return;
    }

    const calendarForType = findCalendarForAppointmentType(
      enabledSelectedCalendars,
      appointmentType,
    );

    if (calendarForType) {
      onSelectCalendar(calendarForType);
    } else {
      onUpdateForm("calendarId", "");
    }
  };

  function getPrimaryChipColor(type: AppointmentType): string {
    const config = getAppointmentTypeConfig(type)
    if(type !== selectedPrimaryAppointmentType){
      return config.color
    }

    if(config.hasSubdivision){
      return subdivision?.color ?? "#7d7d7d"
    }

    if(type === "general"){
      return selectedAppointmentType !== "general" ? appointmentTypeConfig.color : "#7d7d7d"
    }

    return config.color
  }

  const selectionColor = getPrimaryChipColor(selectedPrimaryAppointmentType)

  const selectionTextColor =
  selectionColor === "#ffffff" ? "#0c6740" : "#ffffff";
  return (
    <AppModal
      visible={visible}
      title={modalTitle}
      subtitle={
        selectionScreen
          ? undefined
          : "Completa la información para agendar una nueva cita"
      }
      onClose={onClose}
      onBack={selectionScreen ? () => onSelectionScreenChange(null) : undefined}
      showCloseButton={!selectionScreen}
      accentColor={activeColor}
      animationType="slide"
      position="bottom"
      size="large"
      containerStyle={styles.createModalContainer}
      contentStyle={styles.createModalContent}
      //keyboardAvoiding
      closeDisabled={isCreatingAppointment}
      closeOnBackdropPress={!isCreatingAppointment}
      footer={
        selectionScreen === "duplicate" ? (
          <View style={styles.calendarButtonsSection}>
            <TouchableOpacity
              style={styles.calendarCloseTab}
              onPress={() => onSelectionScreenChange(null)}
              disabled={isCreatingAppointment}
            >
              <Text style={styles.calendarExitButtonText}>Editar datos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.calendarTestCreateButton,
                { backgroundColor: activeColor },
              ]}
              onPress={onOmitDuplicateAndCreate}
              activeOpacity={0.85}
              disabled={isCreatingAppointment}
            >
              <Text style={styles.calendarCreateButtonText}>
                {isCreatingAppointment
                  ? "Procesando..."
                  : "Omitir y crear nuevo"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : !selectionScreen ? (
          <View style={styles.calendarButtonsSection}>
            <TouchableOpacity
              style={styles.calendarCloseTab}
              onPress={onClose}
              disabled={isCreatingAppointment}
            >
              <Text style={styles.calendarExitButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.calendarTestCreateButton,
                { backgroundColor: selectionColor },
              ]}
              onPress={onCreateAppointment}
              activeOpacity={0.85}
              disabled={isCreatingAppointment}
            >
              <Text style={styles.calendarCreateButtonText}>
                {isCreatingAppointment ? "Procesando..." : "Crear cita"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
    >
      {selectionScreen === "duplicate" ? (
        <AppointmentDuplicateScreen candidates={duplicateCheck?.candidates ?? []} isProcessing={isCreatingAppointment} onUseDuplicateLead={onUseDuplicateLead} />
      ) : selectionScreen === "lead" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.appointmentModalContent}
        >
          {isLeadsLoading ? (
            <Text style={styles.calendarSettingsEmpty}>Cargando leads...</Text>
          ) : appointmentLeadOptions.length === 0 ? (
            <Text style={styles.calendarSettingsEmpty}>
              No hay leads activos disponibles.
            </Text>
          ) : (
            <View style={styles.appointmentSelectionList}>
              {appointmentLeadOptions.map((lead) => {
                const isSelected = testAppointmentForm.leadId === lead.id;
                const propertyName = getPropertyDisplayName(
                  appointmentPropertyOptions.find(
                    (property) =>
                      (property.id || property._id) === lead.propertyId,
                  ),
                );

                return (
                  <TouchableOpacity
                    key={lead.id}
                    style={[
                      styles.appointmentSelectionRow,
                      isSelected && styles.appointmentSelectionRowActive,
                    ]}
                    onPress={() => onSelectLead(lead)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.appointmentSelectionRowCopy}>
                      <Text
                        style={[
                          styles.appointmentSelectionRowTitle,
                          isSelected &&
                            styles.appointmentSelectionRowTitleActive,
                        ]}
                        numberOfLines={1}
                      >
                        {lead.name}
                      </Text>
                      <Text
                        style={[
                          styles.appointmentSelectionRowMeta,
                          isSelected &&
                            styles.appointmentSelectionRowMetaActive,
                        ]}
                        numberOfLines={2}
                      >
                        {propertyName || lead.phone || lead.status}
                      </Text>
                    </View>
                    <ChevronRight
                      size={17}
                      color={isSelected ? "#ffffff" : "#3d5a40"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : selectionScreen === "property" ? (
        <FlatList
          data={isCatalogLoading ? [] : appointmentPropertyOptions}
          keyExtractor={(property) =>
            property.id || property._id || getPropertyDisplayName(property)
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.appointmentModalContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <Text style={styles.calendarSettingsEmpty}>
              {isCatalogLoading
                ? "Cargando propiedades..."
                : "No hay propiedades disponibles."}
            </Text>
          }
          renderItem={({ item: property }) => {
            const propertyId = property.id || property._id;
            const isSelected = testAppointmentForm.propertyId === propertyId;

            return (
              <TouchableOpacity
                style={[
                  styles.appointmentSelectionRow,
                  isSelected && styles.appointmentSelectionRowActive,
                ]}
                onPress={() => onSelectProperty(property)}
                activeOpacity={0.85}
              >
                <View style={styles.appointmentSelectionRowCopy}>
                  <Text
                    style={[
                      styles.appointmentSelectionRowTitle,
                      isSelected && styles.appointmentSelectionRowTitleActive,
                    ]}
                    numberOfLines={1}
                  >
                    {getPropertyDisplayName(property)}
                  </Text>
                  <Text
                    style={[
                      styles.appointmentSelectionRowMeta,
                      isSelected && styles.appointmentSelectionRowMetaActive,
                    ]}
                    numberOfLines={2}
                  >
                    {property.city || property.address || property.status}
                  </Text>
                </View>
                <ChevronRight
                  size={17}
                  color={isSelected ? "#ffffff" : "#3d5a40"}
                />
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <KeyboardAwareScrollView
          enableOnAndroid
          enableAutomaticScroll
          //keyboardDismissMode='on-drag'
          enableResetScrollToCoords={false}
          extraHeight={90}
          bounces={false}
          overScrollMode="never"
          extraScrollHeight={0}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.appointmentModalContent}
        >
          <View>
            <Text style={styles.calendarLabel}>Tipo de cita</Text>
            <View style={styles.appointmentModeRow}>
              {getPrimaryAppointmentTypeOptions().map((type) => (
                <FilterChip
                  key={type.value}
                  label={
                    type.value === "general" ? "Otras Citas" : `Cita ${type.label}`
                  }
                  active={selectedPrimaryAppointmentType === type.value}
                  activeColor={getPrimaryChipColor(type.value)}
                  onPress={() => selectAppointmentType(type.value)}
                />
              ))}
            </View>
            {appointmentTypeConfig.hasSubdivision && (
              <View style={styles.relatedLeadSection}>
                <Text style={styles.calendarLabel}>Tipo de venta</Text>
                <View style={styles.appointmentModeRow}>
                  {appointmentTypeConfig.subdivisionTypes?.map(
                    (subdivision) => (
                      <FilterChip
                        key={subdivision.value}
                        label={subdivision.label}
                        active={
                          testAppointmentForm.subtypeCalendar ===
                          subdivision.value
                        }
                        activeColor={subdivision.color}
                        disabled={!selectedTypeCalendar || isCreatingAppointment}
                        onPress={() =>
                          onUpdateForm(
                            "subtypeCalendar",
                            subdivision.value,
                          )
                        }
                      />
                    ),
                  )}
                </View>
              </View>
            )}
            {isGeneralCategory ? (
              <View style={styles.relatedLeadSection}>
                <Text style={styles.calendarLabel}>Tipo de cita general</Text>
                <View style={styles.appointmentModeRow}>
                  {generalSubtypeOptions.map((type) => {
                    const calendar = findCalendarForAppointmentType(
                      enabledSelectedCalendars,
                      type.value,
                    );
                    const isAvailable = Boolean(calendar);

                    return (
                      <FilterChip
                        key={type.value}
                        label={type.label}
                        active={selectedAppointmentType === type.value}
                        activeColor={type.color}
                        onPress={() => selectAppointmentType(type.value)}
                        disabled={!isAvailable}
                      />
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
          <Text style={styles.calendarLabel}>
            Calendario donde se guarda la cita
          </Text>
          {enabledSelectedCalendars.length === 0 ? (
            <Text style={styles.calendarSettingsEmpty}>
              {needsGoogleReconnect
                ? "Reconecta Google Calendar desde configuracion antes de crear citas."
                : isGoogleConnected
                  ? "Activa y guarda al menos un calendario antes de crear citas."
                  : "Conecta Google Calendar desde configuracion antes de crear citas."}
            </Text>
          ) : shouldSelectCalendarManually &&
            manuallySelectableCalendars.length === 0 ? (
            <Text style={styles.calendarSettingsEmpty}>
              Configura un calendario de uso manual antes de crear esta cita.
            </Text>
          ) : shouldSelectCalendarManually ? (
            <View style={styles.calendarDestinationList}>
              {manuallySelectableCalendars.map((calendar) => {
                const isSelected =
                  testAppointmentForm.calendarId === calendar.calendarId;

                return (
                  <TouchableOpacity
                    key={calendar.calendarId}
                    style={[
                      styles.calendarDestinationChip,
                      isSelected && styles.calendarDestinationChipActive,
                    ]}
                    onPress={() => onSelectCalendar(calendar)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.calendarDestinationChipText,
                        isSelected && styles.calendarDestinationChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {calendar.summary ||
                        calendar.appointmentType ||
                        "Calendario"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : typeCalendar ? (
            <View style={styles.calendarSelectedNotice}>
              <Text
                style={styles.calendarSelectedNoticeTitle}
                numberOfLines={1}
              >
                {typeCalendar.summary || "Calendario seleccionado"}
              </Text>
              <Text style={styles.calendarSelectedNoticeMeta} numberOfLines={1}>
                Se usará para citas de {appointmentTypeConfig.label}
              </Text>
            </View>
          ) : (
            <Text style={styles.calendarSettingsEmpty}>
              Activa un calendario cuyo nombre incluya “
              {appointmentTypeConfig.calendarNameKeywords?.[0] ||
                appointmentTypeConfig.label}
              ” antes de crear esta cita.
            </Text>
          )}
            <View>
              <Text style={styles.calendarLabel}>Asesor encargado</Text>
              <View style={styles.appointmentModeRow}>
                <FilterChip
                  label="Soy yo"
                  active={advisorMode === "self"}
                  activeColor={selectionColor}
                  disabled={isCreatingAppointment}
                  onPress={() => onAdvisorModeChange("self")}
                />
                <FilterChip
                  label="Otro asesor"
                  active={advisorMode === "external"}
                  activeColor={selectionColor}
                  disabled={isCreatingAppointment}
                  onPress={() => onAdvisorModeChange("external")}
                />
              </View>
              {advisorMode === "self" ? (
                <Text style={styles.calendarSelectedNoticeMeta}>
                  {currentUserName || "Usuario actual"}
                </Text>
              ) : (
                <TextInput
                  style={styles.calendarTestInput}
                  value={testAppointmentForm.externalAdvisorName ?? ""}
                  onChangeText={value => onUpdateForm("externalAdvisorName", value)}
                  editable={!isCreatingAppointment}
                  placeholder="Nombre del asesor encargado"
                  placeholderTextColor="#8d8d8d"
                  autoCapitalize="words"
                />
              )}
            </View>
          <View>
            <Text style={styles.calendarLabel}>Titulo de la cita</Text>
            <TextInput
              style={styles.calendarTestInput}
              value={testAppointmentForm.title}
              onChangeText={(value) => onUpdateForm("title", value)}
              placeholder="Titulo de la cita"
              placeholderTextColor="#8d8d8d"
            />
          </View>
          <View style={styles.calendarContainer}>
            <Text style={styles.calendarLabel}>Fecha y Hora de la cita</Text>
            <Pressable
              style={[styles.calendarButton, { backgroundColor: selectionColor }]}
              onPress={() => setIsDateTimePickerVisible(true)}
            >
              <Text style={styles.calendarButtonText}>
                Escoger fecha y hora
              </Text>
            </Pressable>
            {hasConfirmedDateTime ? (
              <Text style={styles.selectedDateTimeText}>
                {formatAppointmentDateTime(testAppointmentForm.startDateTime)}
              </Text>
            ) : null}
            {isDateTimePickerVisible ? (
              <AppointmentDateTimePicker
                visible={isDateTimePickerVisible}
                onClose={() => setIsDateTimePickerVisible(false)}
                value={testAppointmentForm.startDateTime}
                onChange={(value) => {
                  onUpdateForm("startDateTime", value);
                  onUpdateForm(
                    "endDateTime",
                    getEndDateTimeWithCurrentDuration(
                      value,
                      testAppointmentForm.startDateTime,
                      testAppointmentForm.endDateTime,
                    ),
                  );
                  setHasConfirmedDateTime(true);
                }}
              />
            ) : null}
          </View>
          <View style={styles.calendarContainer}>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.calendarLabel}>
              Fecha y hora de terminacion
            </Text>
            <Pressable
              style={[styles.calendarButton, { backgroundColor: selectionColor }]}
              onPress={() => setIsEndDateTimePickerVisible(true)}
            >
              <Text
                style={styles.calendarButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Escoger fecha y hora de terminacion
              </Text>
            </Pressable>
            {hasConfirmedEndDateTime ? (
              <Text style={styles.selectedDateTimeText}>
                {formatAppointmentDateTime(testAppointmentForm.endDateTime)}
              </Text>
            ) : null}
            <Text style={styles.appointmentDurationText}>
              Duracion:{" "}
              {formatAppointmentDuration(
                testAppointmentForm.startDateTime,
                testAppointmentForm.endDateTime,
              )}
            </Text>
            {isEndDateTimePickerVisible ? (
              <AppointmentDateTimePicker
                visible={isEndDateTimePickerVisible}
                onClose={() => setIsEndDateTimePickerVisible(false)}
                value={testAppointmentForm.endDateTime}
                minimumDateTime={testAppointmentForm.startDateTime}
                hourOptions={END_HOUR_OPTIONS}
                selectionLabel="de terminacion"
                onChange={(value) => {
                  onUpdateForm("endDateTime", value);
                  setHasConfirmedEndDateTime(true);
                }}
              />
            ) : null}
          </View>
          <View>
            <Text style={styles.calendarLabel}>Ubicacion de la cita</Text>
            <TextInput
              style={styles.calendarTestInput}
              value={testAppointmentForm.location ?? ""}
              onChangeText={(value) => onUpdateForm("location", value)}
              placeholder="Ubicacion de encuentro con el cliente"
              placeholderTextColor="#8d8d8d"
            />
          </View>
          <View>
            <Text style={styles.calendarLabel}>Persona de apoyo</Text>
            <TextInput
              style={styles.calendarTestInput}
              value={testAppointmentForm.helpedBy ?? ""}
              onChangeText={(value) => onUpdateForm("helpedBy", value)}
              placeholder="Nombre de la persona de apoyo"
              placeholderTextColor="#8d8d8d"
            />
          </View>
          {!showsRelatedInformation ? (
            <View>
              <Text style={styles.calendarLabel}>Descripcion de la cita</Text>
              <TextInput
                style={[
                  styles.calendarTestInput,
                  styles.descriptionInput,
                  { height: descriptionInputHeight },
                ]}
                value={testAppointmentForm.description ?? ""}
                onChangeText={(value) => onUpdateForm("description", value)}
                onContentSizeChange={(event) => {
                  setDescriptionInputHeight(
                    Math.max(80, event.nativeEvent.contentSize.height),
                  );
                }}
                placeholder="Descripcion"
                placeholderTextColor="#8d8d8d"
                multiline
                scrollEnabled={false}
                textAlignVertical="top"
              />
            </View>
          ) : (
            <>
              <View style={styles.relatedLeadSection}>
                <Text style={styles.calendarLabel}>Lead relacionado</Text>
                <View style={styles.appointmentModeRow}>
                  <FilterChip
                    label="Lead Existente"
                    active={appointmentLeadMode === "existing"}
                    activeColor={selectionColor}
                    onPress={() => onLeadModeChange("existing")}
                  />
                  <FilterChip
                    label="Nuevo lead"
                    active={appointmentLeadMode === "provisional"}
                    activeColor={selectionColor}
                    onPress={() => onLeadModeChange("provisional")}
                  />
                </View>

                {appointmentLeadMode === "existing" ? (
                  <TouchableOpacity
                    style={styles.appointmentPickerButton}
                    onPress={() => onSelectionScreenChange("lead")}
                    activeOpacity={0.85}
                  >
                    <View style={styles.appointmentPickerCopy}>
                      <Text
                        style={styles.appointmentPickerTitle}
                        numberOfLines={1}
                      >
                        {selectedAppointmentLead?.name || "Escoger lead"}
                      </Text>
                      <Text
                        style={styles.appointmentPickerMeta}
                        numberOfLines={1}
                      >
                        {isLeadsLoading
                          ? "Cargando leads..."
                          : selectedAppointmentLead
                            ? selectedAppointmentLead.phone ||
                              selectedAppointmentLead.status
                            : `${appointmentLeadOptions.length} leads disponibles`}
                      </Text>
                    </View>
                    <ChevronRight size={17} color="#3d5a40" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.appointmentProvisionalFields}>
                    <View style={styles.informationSection}>
                      <Text style={styles.informationText}>Estatus del lead</Text>
                      <TouchableOpacity
                        style={styles.appointmentPickerButton}
                        activeOpacity={0.85}
                        disabled={isCreatingAppointment}
                        accessibilityRole="button"
                        accessibilityLabel="Seleccionar estatus del lead"
                        accessibilityState={{ expanded: isLeadStatusSelectorOpen }}
                        onPress={() => setIsLeadStatusSelectorOpen((open) => !open)}
                      >
                        <Text style={styles.appointmentPickerTitle}>{provisionalLead.status}</Text>
                        <ChevronRight size={17} color="#3d5a40" />
                      </TouchableOpacity>
                      {isLeadStatusSelectorOpen ? LEAD_TRACKING_STATUSES.map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={styles.appointmentPickerButton}
                          activeOpacity={0.85}
                          disabled={isCreatingAppointment}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: provisionalLead.status === status }}
                          onPress={() => {
                            onUpdateProvisionalLead("status", status);
                            setIsLeadStatusSelectorOpen(false);
                          }}
                        >
                          <Text style={styles.appointmentPickerTitle}>{status}</Text>
                          {provisionalLead.status === status ? <Text style={styles.appointmentPickerMeta}>Seleccionado</Text> : null}
                        </TouchableOpacity>
                      )) : null}
                    </View>
                    <View style={styles.informationSection}>
                      <Text style={styles.informationText}>
                        Nombre completo del lead
                      </Text>
                      <TextInput
                        style={styles.calendarTestInput}
                        value={provisionalLead.fullName}
                        onChangeText={(value) =>
                          onUpdateProvisionalLead("fullName", value)
                        }
                        placeholderTextColor="#8d8d8d"
                      />
                    </View>
                    <View style={styles.informationSection}>
                      <Text style={styles.informationText}>
                        Numero de Telefono (opcional)
                      </Text>
                      <TextInput
                        style={styles.calendarTestInput}
                        value={provisionalLead.phone}
                        onChangeText={(value) =>
                          onUpdateProvisionalLead("phone", value)
                        }
                        placeholderTextColor="#8d8d8d"
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View style={styles.informationSection}>
                      <Text style={styles.informationText}>
                        Cuenta de correo electronico (opcional)
                      </Text>
                      <TextInput
                        style={styles.calendarTestInput}
                        value={provisionalLead.email}
                        onChangeText={(value) =>
                          onUpdateProvisionalLead("email", value)
                        }
                        placeholderTextColor="#8d8d8d"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.calendarLabel}>
                  Propiedad relacionada (Opcional si es propiedad externa)
                </Text>
                <TouchableOpacity
                  style={styles.appointmentPickerButton}
                  onPress={() => onSelectionScreenChange("property")}
                  activeOpacity={0.85}
                >
                  <View style={styles.appointmentPickerCopy}>
                    <Text
                      style={styles.appointmentPickerTitle}
                      numberOfLines={1}
                    >
                      {selectedAppointmentProperty
                        ? getPropertyDisplayName(selectedAppointmentProperty)
                        : "Escoger propiedad"}
                    </Text>
                    <Text
                      style={styles.appointmentPickerMeta}
                      numberOfLines={1}
                    >
                      {isCatalogLoading
                        ? "Cargando propiedades..."
                        : selectedAppointmentProperty
                          ? selectedAppointmentProperty.city ||
                            selectedAppointmentProperty.address ||
                            selectedAppointmentProperty.status
                          : `${appointmentPropertyOptions.length} propiedades disponibles`}
                    </Text>
                  </View>
                  <ChevronRight size={17} color="#3d5a40" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </KeyboardAwareScrollView>
      )}
    </AppModal>
  );
}

function formatAppointmentDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getEndDateTimeWithCurrentDuration(
  nextStartDateTime: string,
  previousStartDateTime: string,
  previousEndDateTime: string,
) {
  const nextStart = new Date(nextStartDateTime);
  const previousStart = new Date(previousStartDateTime);
  const previousEnd = new Date(previousEndDateTime);
  const duration = previousEnd.getTime() - previousStart.getTime();

  if (
    Number.isNaN(nextStart.getTime()) ||
    Number.isNaN(duration) ||
    duration <= 0
  ) {
    return getAppointmentEndDateTime(nextStartDateTime);
  }

  return new Date(nextStart.getTime() + duration).toISOString();
}

function formatAppointmentDuration(startDateTime: string, endDateTime: string) {
  const durationMinutes = Math.round(
    (new Date(endDateTime).getTime() - new Date(startDateTime).getTime()) /
      60_000,
  );

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return "sin definir";
  }

  if (durationMinutes < 60) return `${durationMinutes} min`;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, "0")} h`;
}
