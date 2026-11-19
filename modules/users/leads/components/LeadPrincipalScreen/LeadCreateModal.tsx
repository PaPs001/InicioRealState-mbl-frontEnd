import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import { styles } from "../styles/LeadCreateModal.styles";
import {
  isLeadV2CreateFormValid,
  type LeadV2CreateForm,
} from "@/modules/users/leads/types";
import { AppModal } from "@/components/AppModal";
import { LEAD_TRACKING_STATUSES } from "@/modules/users/leads/constants/lead-tracking-statuses";
import { LEAD_ORIGINS } from "@/modules/users/leads/constants/lead-origins";
const leadOperationOptions = [
  { label: "Renta", value: "renta" },
  { label: "Venta", value: "venta" },
] as const;

type LeadCreateModalProps = {
  createError: string | null;
  form: LeadV2CreateForm;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onUpdateField: (field: keyof LeadV2CreateForm, value: string) => void;
  visible: boolean;
};

export function LeadCreateModal({
  createError,
  form,
  isCreating,
  onClose,
  onSubmit,
  onUpdateField,
  visible,
}: LeadCreateModalProps) {
  const isFormValid = isLeadV2CreateFormValid(form);

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      closeDisabled={isCreating}
      title="Agregar Nuevo Lead"
      subtitle="Nombre y telefono son los datos principales"
      animationType="slide"
      showCloseButton
      position="bottom"
      footerStyle={{ paddingBottom: 54 }}
      footer={
        <Pressable>
          <TouchableOpacity
            style={[
              styles.createLeadButton,
              (!isFormValid || isCreating) && styles.createLeadButtonDisabled,
            ]}
            activeOpacity={0.85}
            disabled={isCreating || !isFormValid}
            onPress={onSubmit}
          >
            <Text style={styles.createLeadButtonText}>
              {isCreating ? "Guardando..." : "Guardar lead"}
            </Text>
          </TouchableOpacity>
        </Pressable>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LeadFormField
          label="Nombre completo"
          placeholder="Nombre del lead"
          value={form.fullName}
          onChangeText={(value) => onUpdateField("fullName", value)}
        />
        <LeadOptionField
          label="Estatus del lead"
          options={LEAD_TRACKING_STATUSES.map((status) => ({ label: status, value: status }))}
          selectedValue={form.status}
          onSelect={(value) => onUpdateField("status", value)}
        />
        <LeadFormField
          label="Nacionalidad"
          placeholder="nacionalidad del lead"
          value={form.nationality}
          onChangeText={(value) => onUpdateField("nationality", value)}
        />
        <LeadFormField
          label="Telefono"
          placeholder="Numero de telefono"
          value={form.phone}
          onChangeText={(value) => onUpdateField("phone", value)}
          keyboardType="phone-pad"
        />
        <LeadFormField
          label="Correo"
          placeholder="correo@ejemplo.com"
          value={form.email}
          onChangeText={(value) => onUpdateField("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <LeadFormField
          label="Presupuesto Estimado"
          placeholder="Ej. 250000"
          value={form.estimatedBudget}
          onChangeText={(value) =>
            onUpdateField("estimatedBudget", value.replace(/[^0-9]/g, ""))
          }
          keyboardType="numeric"
        />
        <LeadLastContactDateField
          value={form.lastContactDate}
          onChange={(value) => onUpdateField("lastContactDate", value)}
        />
        <LeadOptionField
          label="Origen"
          options={LEAD_ORIGINS.map((option) => ({
            label: option,
            value: option,
          }))}
          selectedValue={form.origin}
          onSelect={(value) => onUpdateField("origin", value)}
        />
        <LeadOptionField
          label="Operacion"
          options={leadOperationOptions}
          selectedValue={form.operation}
          onSelect={(value) => onUpdateField("operation", value)}
        />

        {createError ? (
          <Text style={styles.modalErrorText}>{createError}</Text>
        ) : null}
      </ScrollView>
    </AppModal>
  );
}

export function LeadLastContactDateField({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const pickerDate = value ? new Date(value) : new Date();

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setIsPickerVisible(false);
      return;
    }

    if (selectedDate) {
      onChange(selectedDate.toISOString());
    }

    if (Platform.OS !== "ios") setIsPickerVisible(false);
  };

  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>Fecha Ultimo Contacto</Text>
      <TouchableOpacity
        style={styles.dateSelectButton}
        activeOpacity={0.85}
        onPress={() => setIsPickerVisible(true)}
      >
        <CalendarDays size={17} color="#0f362b" />
        <Text
          style={[
            styles.dateSelectText,
            !value && styles.dateSelectPlaceholder,
          ]}
          numberOfLines={1}
        >
          {value ? formatLeadDate(value) : "Seleccionar fecha"}
        </Text>
      </TouchableOpacity>
      {isPickerVisible ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function LeadOptionField({
  label,
  onSelect,
  options,
  selectedValue,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: readonly { label: string; value: string }[];
  selectedValue: string;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.formOptionGrid}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.formOptionButton,
                isSelected && styles.formOptionButtonActive,
              ]}
              activeOpacity={0.85}
              onPress={() => onSelect(option.value)}
            >
              <Text
                style={[
                  styles.formOptionText,
                  isSelected && styles.formOptionTextActive,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function LeadFormField({
  autoCapitalize,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={styles.formInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9a9188"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}
