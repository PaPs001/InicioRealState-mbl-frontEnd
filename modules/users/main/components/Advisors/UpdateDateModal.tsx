import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { AppModal } from "@/components/AppModal";
import type {
  AppointmentType,
  SelectedGoogleCalendar,
  UpdateGoogleCalendarDatePayload,
} from "@/lib/api";
import type { AppointmentPreviewItem } from "@/modules/users/main/types";
import type { Property, PropertyLead } from "@/lib/types";
import {
  getAppointmentEndDateTime,
  getPropertyDisplayName,
} from "@/modules/users/main/utils/dashboard-formatters";
import { AppointmentDateTimePicker } from "../AppointmentDateTimePicker";
import { styles } from "./styles/UpdateDateModal.styles";

const APPOINTMENT_TYPES: Array<{ label: string; value: AppointmentType }> = [
  { label: "Renta", value: "renta" },
  { label: "Venta", value: "venta" },
  { label: "General", value: "general" },
];

type UpdateDateModalProps = {
  appointment: AppointmentPreviewItem;
  visible: boolean;
  isUpdating: boolean;
  isLoadingCalendars: boolean;
  form: UpdateGoogleCalendarDatePayload;
  enabledCalendars: SelectedGoogleCalendar[];
  appointmentLeadOptions: PropertyLead[];
  appointmentPropertyOptions: Property[];
  selectedLead?: PropertyLead;
  selectedProperty?: Property;
  currentUserId?: string;
  currentUserName?: string;
  selectionScreen: "lead" | "property" | null;
  isLeadsLoading: boolean;
  isPropertiesLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onSelectCalendar: (calendar: SelectedGoogleCalendar) => void;
  onSelectAppointmentType: (appointmentType: AppointmentType) => void;
  onSelectionScreenChange: (screen: "lead" | "property" | null) => void;
  onSelectLead: (lead: PropertyLead) => void;
  onSelectProperty: (property: Property) => void;
  onClearLead: () => void;
  onClearProperty: () => void;
  onAssignCurrentUser: () => void;
  onAssignOtherAdvisor: () => void;
  onUpdateField: (
    field: keyof UpdateGoogleCalendarDatePayload,
    value: string | null,
  ) => void;
};

export function UpdateDateModal({
  appointment,
  visible,
  isUpdating,
  isLoadingCalendars,
  form,
  enabledCalendars,
  appointmentLeadOptions,
  appointmentPropertyOptions,
  selectedLead,
  selectedProperty,
  currentUserId,
  currentUserName,
  selectionScreen,
  isLeadsLoading,
  isPropertiesLoading,
  onClose,
  onSubmit,
  onSelectCalendar,
  onSelectAppointmentType,
  onSelectionScreenChange,
  onSelectLead,
  onSelectProperty,
  onClearLead,
  onClearProperty,
  onAssignCurrentUser,
  onAssignOtherAdvisor,
  onUpdateField,
}: UpdateDateModalProps) {
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);
  const startDateTime = form.startDateTime || appointment.startDateTime;
  const isCurrentUserAssigned = Boolean(
    currentUserId && form.advisorId === currentUserId,
  );

  return (
    <AppModal
      visible={visible}
      title={
        selectionScreen === "lead"
          ? "Seleccionar lead"
          : selectionScreen === "property"
            ? "Seleccionar propiedad"
            : "Editar cita"
      }
      subtitle="Revisa la información actual y cambia solamente lo necesario."
      onClose={onClose}
      onBack={selectionScreen ? () => onSelectionScreenChange(null) : undefined}
      showCloseButton={!selectionScreen}
      animationType="slide"
      position="bottom"
      size="large"
      containerStyle={styles.createModalContainer}
      contentStyle={styles.createModalContent}
      closeDisabled={isUpdating}
      closeOnBackdropPress={!isUpdating}
      footer={
        !selectionScreen ? (
          <View style={styles.calendarButtonsSection}>
            <Pressable
              style={({ pressed }) => [
                styles.calendarCloseTab,
                (pressed || isUpdating) && styles.buttonDisabled,
              ]}
              onPress={onClose}
              disabled={isUpdating}
            >
              <Text style={styles.calendarExitButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.calendarTestCreateButton,
                (pressed || isUpdating) && styles.buttonDisabled,
              ]}
              onPress={onSubmit}
              disabled={isUpdating}
            >
              <Text style={styles.calendarCreateButtonText}>
                {isUpdating ? "Guardando..." : "Guardar cambios"}
              </Text>
            </Pressable>
          </View>
        ) : null
      }
    >
      {selectionScreen === "lead" ? (
        <RelationSelectionList
          clearLabel="Sin lead relacionado"
          emptyLabel="No hay leads disponibles."
          isLoading={isLeadsLoading}
          loadingLabel="Cargando leads..."
          onClear={onClearLead}
        >
          {appointmentLeadOptions.map((lead) => (
            <RelationSelectionItem
              key={lead.id}
              active={form.leadId === lead.id}
              title={lead.name}
              subtitle={lead.phone || lead.status}
              onPress={() => onSelectLead(lead)}
            />
          ))}
        </RelationSelectionList>
      ) : selectionScreen === "property" ? (
        <RelationSelectionList
          clearLabel="Sin propiedad relacionada"
          emptyLabel="No hay propiedades disponibles."
          isLoading={isPropertiesLoading}
          loadingLabel="Cargando propiedades..."
          onClear={onClearProperty}
        >
          {appointmentPropertyOptions.map((property) => {
            const propertyId = property.id || property._id;
            return (
              <RelationSelectionItem
                key={propertyId}
                active={form.propertyId === propertyId}
                title={getPropertyDisplayName(property)}
                subtitle={property.city || property.address || property.status}
                onPress={() => onSelectProperty(property)}
              />
            );
          })}
        </RelationSelectionList>
      ) : (
        <>
          <KeyboardAwareScrollView
            enableOnAndroid
            enableAutomaticScroll
            enableResetScrollToCoords={false}
            extraHeight={90}
            extraScrollHeight={0}
            bounces={false}
            overScrollMode="never"
            style={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <EditableField
              label="Tipo de cita"
              originalValue={formatAppointmentType(appointment.appointmentType)}
              typeSelectedDate={form.appointmentType}
            >
              <View style={styles.appointmentModeRow}>
                {APPOINTMENT_TYPES.map((type) => {
                  const isActive = form.appointmentType === type.value;
                  return (
                    <Pressable
                      key={type.value}
                      style={[
                        styles.appointmentModeButton,
                        isActive &&
                          type.value === "renta" &&
                          styles.appointmentModeButtonRentActive,
                        isActive &&
                          type.value === "venta" &&
                          styles.appointmentModeButtonSaleActive,
                        isActive &&
                          type.value === "general" &&
                          styles.appointmentModeButtonGeneralActive,
                      ]}
                      onPress={() => onSelectAppointmentType(type.value)}
                      disabled={isUpdating}
                    >
                      <Text
                        style={[
                          styles.appointmentModeButtonText,
                          isActive && styles.appointmentModeButtonTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </EditableField>
            
            <EditableField
              label="Título de la cita"
              originalValue={appointment.title}
              typeSelectedDate={form.appointmentType}
            >
              <TextInput
                style={styles.calendarTestInput}
                value={form.title ?? ""}
                onChangeText={(value) => onUpdateField("title", value)}
                placeholder="Título de la cita"
                placeholderTextColor="#8d8d8d"
              />
            </EditableField>

            

            {form.appointmentType !== "general" ? (
              <>
                <EditableField
                  label="Asesor encargado"
                  originalValue={
                    appointment.externalAdvisorName || appointment.adviser
                  }
                  typeSelectedDate={form.appointmentType}
                >
                  <View style={styles.advisorAssignmentRow}>
                    <AssignmentButton
                      active={isCurrentUserAssigned}
                      disabled={isUpdating || !currentUserId}
                      label="Soy yo"
                      onPress={onAssignCurrentUser}
                    />
                    <AssignmentButton
                      active={!isCurrentUserAssigned}
                      disabled={isUpdating}
                      label="Otro asesor"
                      onPress={onAssignOtherAdvisor}
                    />
                  </View>

                  {isCurrentUserAssigned ? (
                    <Text style={styles.assignedAdvisorText}>
                      {currentUserName || "Usuario actual"}
                    </Text>
                  ) : (
                    <TextInput
                      style={styles.calendarTestInput}
                      value={form.externalAdvisorName ?? ""}
                      onChangeText={(value) =>
                        onUpdateField("externalAdvisorName", value)
                      }
                      placeholder="Nombre del asesor encargado"
                      placeholderTextColor="#8d8d8d"
                    />
                  )}
                </EditableField>

                <EditableField
              label="Persona de apoyo"
              originalValue={appointment.helpedBy}
              typeSelectedDate={form.appointmentType}
            >
              <TextInput
                style={styles.calendarTestInput}
                value={form.helpedBy ?? ""}
                onChangeText={(value) => onUpdateField("helpedBy", value)}
                placeholder="Persona de apoyo"
                placeholderTextColor="#8d8d8d"
              />
            </EditableField>

                <View style={styles.relatedInformationSection}>
                  <Text style={styles.sectionTitle}>
                    Información relacionada
                  </Text>
                  <Pressable
                    style={styles.relationButton}
                    onPress={() => onSelectionScreenChange("lead")}
                  >
                    <View style={styles.relationButtonCopy}>
                      <Text style={styles.relatedInformationLabel}>Lead</Text>
                      <Text
                        style={styles.relatedInformationValue}
                        numberOfLines={1}
                      >
                        {selectedLead?.name ||
                          (form.leadId === appointment.leadId
                            ? appointment.client
                            : undefined) ||
                          "Seleccionar lead"}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#3d5a40" />
                  </Pressable>
                  <Pressable
                    style={styles.relationButton}
                    onPress={() => onSelectionScreenChange("property")}
                  >
                    <View style={styles.relationButtonCopy}>
                      <Text style={styles.relatedInformationLabel}>
                        Propiedad
                      </Text>
                      <Text
                        style={styles.relatedInformationValue}
                        numberOfLines={1}
                      >
                        {selectedProperty
                          ? getPropertyDisplayName(selectedProperty)
                          : form.propertyId === appointment.propertyId
                            ? appointment.property || "Seleccionar propiedad"
                            : "Seleccionar propiedad"}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#3d5a40" />
                  </Pressable>
                </View>
              </>
            ) : null}

             <EditableField
              label="Ubicación"
              originalValue={appointment.location}
              typeSelectedDate={form.appointmentType}
            >
              <TextInput
                style={styles.calendarTestInput}
                value={form.location ?? ""}
                onChangeText={(value) => onUpdateField("location", value)}
                placeholder="Ubicación de la cita"
                placeholderTextColor="#8d8d8d"
              />
            </EditableField>

            <EditableField
              label="Descripción"
              originalValue={appointment.description}
              typeSelectedDate={form.appointmentType}
            >
              <TextInput
                style={[styles.calendarTestInput, styles.descriptionInput]}
                value={form.description ?? ""}
                onChangeText={(value) => onUpdateField("description", value)}
                placeholder="Descripción de la cita"
                placeholderTextColor="#8d8d8d"
                multiline
                textAlignVertical="top"
              />
            </EditableField>

            {form.appointmentType === 'general' ? (

              <EditableField
                label="Calendario"
                originalValue={getCalendarName(
                  enabledCalendars,
                  appointment.calendarId,
                )}
                typeSelectedDate={form.appointmentType}
              >
                {isLoadingCalendars ? (
                  <Text style={styles.calendarEmptyText}>
                    Cargando calendarios...
                  </Text>
                ) : enabledCalendars.length === 0 ? (
                  <Text style={styles.calendarEmptyText}>
                    No hay calendarios habilitados.
                  </Text>
                ) : (
                  <View style={styles.calendarOptions}>
                    {enabledCalendars.map((calendar) => {
                      const isActive = form.calendarId === calendar.calendarId;
                      return (
                        <Pressable
                          key={calendar.calendarId}
                          style={[
                            styles.calendarOption,
                            isActive && styles.calendarOptionActive,
                          ]}
                          onPress={() => onSelectCalendar(calendar)}
                          disabled={isUpdating}
                        >
                          <Text
                            style={[
                              styles.calendarOptionTitle,
                              isActive && styles.calendarOptionTitleActive,
                            ]}
                            numberOfLines={1}
                          >
                            {calendar.summary || calendar.calendarId}
                          </Text>
                          <Text
                            style={[
                              styles.calendarOptionMeta,
                              isActive && styles.calendarOptionMetaActive,
                            ]}
                          >
                            {formatAppointmentType(calendar.appointmentType)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </EditableField>
            ): null}

            <EditableField
              label="Fecha y hora"
              originalValue={formatAppointmentDateTime(
                appointment.startDateTime,
              )}
              typeSelectedDate={form.appointmentType}
            >
              <View style={styles.dateSelectionRow}>
                <Text style={styles.selectedDateTimeText}>
                  {formatAppointmentDateTime(startDateTime)}
                </Text>
                <Pressable
                  style={styles.calendarButton}
                  onPress={() => setIsDateTimePickerVisible(true)}
                  disabled={isUpdating}
                >
                  <Text style={styles.calendarButtonText}>Cambiar fecha</Text>
                </Pressable>
              </View>
            </EditableField>

           

            

            
          </KeyboardAwareScrollView>

          {isDateTimePickerVisible && startDateTime ? (
            <AppointmentDateTimePicker
              visible
              value={startDateTime}
              onClose={() => setIsDateTimePickerVisible(false)}
              onChange={(value) => {
                onUpdateField("startDateTime", value);
                onUpdateField("endDateTime", getAppointmentEndDateTime(value));
              }}
            />
          ) : null}
        </>
      )}
    </AppModal>
  );
}

/// Componentes mas pequeños para la selección de relaciones, botones de asignación y campos editables

function RelationSelectionList({
  children,
  clearLabel,
  emptyLabel,
  isLoading,
  loadingLabel,
  onClear,
}: {
  children: ReactNode;
  clearLabel: string;
  emptyLabel: string;
  isLoading: boolean;
  loadingLabel: string;
  onClear: () => void;
}) {
  const hasOptions = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  return (
    <ScrollView
      style={styles.modalScroll}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.selectionList}
    >
      <Pressable style={styles.clearRelationButton} onPress={onClear}>
        <Text style={styles.clearRelationButtonText}>{clearLabel}</Text>
      </Pressable>
      {isLoading ? (
        <Text style={styles.calendarEmptyText}>{loadingLabel}</Text>
      ) : hasOptions ? (
        children
      ) : (
        <Text style={styles.calendarEmptyText}>{emptyLabel}</Text>
      )}
    </ScrollView>
  );
}

function RelationSelectionItem({
  active,
  onPress,
  subtitle,
  title,
}: {
  active: boolean;
  onPress: () => void;
  subtitle?: string;
  title: string;
}) {
  return (
    <Pressable
      style={[styles.selectionItem, active && styles.selectionItemActive]}
      onPress={onPress}
    >
      <View style={styles.relationButtonCopy}>
        <Text
          style={[
            styles.selectionItemTitle,
            active && styles.selectionItemTextActive,
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.selectionItemMeta,
              active && styles.selectionItemTextActive,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={18} color={active ? "#ffffff" : "#3d5a40"} />
    </Pressable>
  );
}

function AssignmentButton({
  active,
  disabled,
  label,
  onPress,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.advisorAssignmentButton,
        active && styles.advisorAssignmentButtonActive,
        disabled && styles.buttonDisabled,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        style={[
          styles.advisorAssignmentButtonText,
          active && styles.advisorAssignmentButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function EditableField({
  children,
  label,
  originalValue,
  typeSelectedDate,
}: {
  children: ReactNode;
  label: string;
  originalValue?: string | null;
  typeSelectedDate?: string | null;
}) {
  return (
    <View style={styles.fieldSection}>
      <Text style={styles.calendarLabel}>{label}</Text>
      <View style={[
          styles.originalValueContainer,
          typeSelectedDate === "renta" && styles.rentValueContainer,
          typeSelectedDate === "venta" && styles.saleValueContainer,
          typeSelectedDate === "general" && styles.generalValueContainer,
        ]}
      >
        <Text
          style={[
            styles.originalValueLabel,
            typeSelectedDate && styles.coloredValueText,
          ]}
        >
          Información actual
        </Text>
        <Text
          style={[
            styles.originalValueText,
            typeSelectedDate && styles.coloredValueText,
          ]}
        >
          {originalValue?.trim() || "Sin información"}
        </Text>
      </View>
      <Text style={styles.newValueLabel}>Nuevo valor</Text>
      {children}
    </View>
  );
}

function formatAppointmentType(value?: string | null) {
  if (value === "renta") return "Renta";
  if (value === "venta") return "Venta";
  if (value === "general") return "General";
  return value || "Sin información";
}

function getCalendarName(
  calendars: SelectedGoogleCalendar[],
  calendarId?: string | null,
) {
  if (!calendarId) return "Sin calendario";
  const calendar = calendars.find((item) => item.calendarId === calendarId);
  return calendar?.summary || calendarId;
}

function formatAppointmentDateTime(value?: string | null) {
  if (!value) return "Sin fecha asignada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
