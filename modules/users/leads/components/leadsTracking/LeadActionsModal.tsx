import { useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AppModal } from "@/components/AppModal";
import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import { usePropertyDomain } from "@/contexts/auth/use-property-domain";
import {
  deleteBackendLeadV2Records,
  setBackendLeadV2Status,
  updateBackendLeadV2Record,
  type UpdateBackendLeadV2Payload,
} from "@/lib/api";
import type { PropertyLead } from "@/lib/types";
import {
  LeadFormField,
  LeadLastContactDateField,
  LeadOptionField,
  PropertyPickerView,
} from "../LeadPrincipalScreen/LeadCreateModal";
import {
  buildPropertyOptions,
  normalizeSearch,
} from "../../utils/leads-principal-utils";
import { LEAD_ORIGINS } from "../../constants/lead-origins";

import { leadTrackingStatusCards } from "../../constants/lead-tracking-layout";
import { isLeadStatus } from "../../constants/lead-tracking-statuses";

const statuses = leadTrackingStatusCards.map((card) => card.title);

function getForm(lead: PropertyLead) {
  return {
    fullName: lead.name,
    phone: lead.phone,
    email: lead.email || "",
    propertyOfInterestId: lead.propertyId,
    origin: lead.source,
    operation:
      lead.operation || (lead.searchIntent === "rent" ? "renta" : "venta"),
    estimatedBudget:
      lead.estimatedBudget == null
        ? lead.notes?.match(/(?:^|\n)Presupuesto:\s*([^\n]+)/)?.[1] || ""
        : String(lead.estimatedBudget),
    lastContactDate: lead.lastContactDate || "",
    status:
      statuses.find((status) => isLeadStatus(lead.status, status)) ||
      lead.status,
    statusReason: lead.statusReason || "",
    statusUntil: lead.statusUntil || "",
    nextAction: lead.nextAction || "",
    nextActionAt: lead.nextActionAt || "",
    nextFollowUpAt: lead.nextFollowUpAt || "",
  };
}

export function LeadActionsModal({
  lead,
  onClose,
  onChanged,
}: {
  lead: PropertyLead;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const { authToken } = useSessionDomain();
  const { catalogProperties, availableProperties, isCatalogLoading } =
    usePropertyDomain();
  const properties = useMemo(
    () => buildPropertyOptions(catalogProperties, availableProperties),
    [catalogProperties, availableProperties],
  );
  const initial = useMemo(() => getForm(lead), [lead]);
  const [form, setForm] = useState(initial);
  const [mode, setMode] = useState<
    "menu" | "delete" | "edit" | "status" | "property"
  >("menu");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [propertySearch, setPropertySearch] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const navigate = (next: typeof mode) => {
    setError(null);
    setMode(next);
  };
  const submit = async () => {
    if (saving.current) return;
    setError(null);
    if (!authToken) {
      setError("Tu sesión no está disponible.");
      return;
    }
    if (mode === "edit") {
      if (!form.fullName.trim()) {
        setError("Escribe el nombre del lead.");
        return;
      }
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError("Escribe un correo válido.");
        return;
      }
      if (
        form.estimatedBudget &&
        (!Number.isFinite(Number(form.estimatedBudget)) ||
          Number(form.estimatedBudget) < 0)
      ) {
        setError("Escribe un presupuesto válido.");
        return;
      }
      for (const key of [
        "statusUntil",
        "nextActionAt",
        "nextFollowUpAt",
      ] as const) {
        if (form[key] && Number.isNaN(Date.parse(form[key]))) {
          setError("Revisa las fechas ingresadas.");
          return;
        }
      }
    }
    if (
      (mode === "status" || form.status !== initial.status) &&
      !statuses.includes(form.status)
    ) {
      setError("Selecciona uno de los estatus disponibles.");
      return;
    }
    saving.current = true;
    setBusy(true);
    try {
      if (mode === "delete")
        await deleteBackendLeadV2Records([lead.id], authToken);
      else if (mode === "status")
        await setBackendLeadV2Status(
          lead.id,
          { status: form.status },
          authToken,
        );
      else {
        const payload: UpdateBackendLeadV2Payload = {};
        for (const key of [
          "fullName",
          "phone",
          "email",
          "propertyOfInterestId",
          "origin",
          "operation",
          "status",
          "statusReason",
          "nextAction",
          "statusUntil",
          "nextActionAt",
          "nextFollowUpAt",
        ] as const) {
          if (form[key] !== initial[key]) payload[key] = form[key].trim();
        }
        if (form.estimatedBudget !== initial.estimatedBudget)
          payload.estimatedBudget = form.estimatedBudget.trim()
            ? Number(form.estimatedBudget)
            : null;
        if (form.lastContactDate !== initial.lastContactDate)
          payload.lastContactDate = form.lastContactDate || null;
        if (Object.keys(payload).length)
          await updateBackendLeadV2Record(lead.id, payload, authToken);
      }
      await onChanged();
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron guardar los cambios. Intenta nuevamente.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  const action = (
    label: string,
    onPress: () => void,
    danger = false,
    disabled = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      disabled={busy || disabled}
      onPress={onPress}
      style={[
        styles.button,
        danger && styles.danger,
        (busy || disabled) && styles.disabled,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
  const statusPicker = (
    <LeadOptionField
      label="Estatus"
      options={statuses.map((value) => ({ label: value, value }))}
      selectedValue={form.status}
      onSelect={(value) => update("status", value)}
    />
  );

  return (
    <AppModal
      visible
      onClose={onClose}
      closeDisabled={busy}
      position="bottom"
      animationType="slide"
      size={mode === "edit" || mode === "property" ? "large" : "medium"}
      scrollable
      keyboardAvoiding
      showCloseButton
      title={
        mode === "menu"
          ? "Opciones del lead"
          : mode === "delete"
            ? "Eliminar lead"
            : mode === "status"
              ? "Cambiar status"
              : "Editar lead"
      }
      subtitle={lead.name}
      onBack={
        mode !== "menu" && !busy
          ? () => navigate(mode === "property" ? "edit" : "menu")
          : undefined
      }
      footer={
        mode !== "menu" && mode !== "property" ? (
          <View style={styles.actions}>
            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}
            {action(
              busy
                ? "Guardando..."
                : mode === "delete"
                  ? "Sí, eliminar lead"
                  : "Guardar cambios",
              () => {
                void submit();
              },
              mode === "delete",
              mode === "status" && !statuses.includes(form.status),
            )}
            {action("Cancelar", onClose)}
          </View>
        ) : undefined
      }
    >
      <View pointerEvents={busy ? "none" : "auto"} style={styles.actions}>
        {mode === "menu" ? (
          <>
            {action("Eliminar lead", () => navigate("delete"), true)}
            {action("Editar lead", () => navigate("edit"))}
            {action("Cambiar status", () => navigate("status"))}
          </>
        ) : mode === "delete" ? (
          <Text>
            ¿Quieres eliminar a {lead.name}? Esta acción no se puede deshacer.
          </Text>
        ) : mode === "status" ? (
          statusPicker
        ) : mode === "property" ? (
          <PropertyPickerView
            isLoading={isCatalogLoading}
            onBack={() => navigate("edit")}
            onSearchChange={setPropertySearch}
            onSelectProperty={(property) => {
              update("propertyOfInterestId", property.id);
              navigate("edit");
            }}
            properties={properties.filter((property) =>
              normalizeSearch(
                [property.title, property.address, property.city].join(" "),
              ).includes(normalizeSearch(propertySearch)),
            )}
            searchQuery={propertySearch}
            selectedPropertyId={form.propertyOfInterestId}
          />
        ) : (
          <>
            <LeadFormField
              label="Nombre completo"
              placeholder="Nombre del lead"
              value={form.fullName}
              onChangeText={(value) => update("fullName", value)}
            />
            <LeadFormField
              label="Teléfono"
              placeholder="Teléfono"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(value) => update("phone", value)}
            />
            <LeadFormField
              label="Correo"
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(value) => update("email", value)}
            />
            <LeadFormField
              label="Presupuesto estimado"
              placeholder="Ej. 250000"
              keyboardType="numeric"
              value={form.estimatedBudget}
              onChangeText={(value) => update("estimatedBudget", value)}
            />
            {action(
              properties.find(
                (property) => property.id === form.propertyOfInterestId,
              )?.title || "Seleccionar propiedad",
              () => navigate("property"),
            )}
            {form.propertyOfInterestId
              ? action("Quitar propiedad", () =>
                  update("propertyOfInterestId", ""),
                )
              : null}
            <LeadLastContactDateField
              value={form.lastContactDate}
              onChange={(value) => update("lastContactDate", value)}
            />
            {form.lastContactDate
              ? action("Quitar fecha de último contacto", () =>
                  update("lastContactDate", ""),
                )
              : null}
            <LeadOptionField
              label="Origen"
              options={[...new Set([...LEAD_ORIGINS, form.origin])]
                .filter(Boolean)
                .map((value) => ({ label: value, value }))}
              selectedValue={form.origin}
              onSelect={(value) => update("origin", value)}
            />
            <LeadOptionField
              label="Operación"
              options={[...new Set(["renta", "venta", form.operation])]
                .filter(Boolean)
                .map((value) => ({ label: value, value }))}
              selectedValue={form.operation}
              onSelect={(value) => update("operation", value)}
            />
            {statusPicker}
            <LeadFormField
              label="Motivo del estatus"
              placeholder="Motivo"
              value={form.statusReason}
              onChangeText={(value) => update("statusReason", value)}
            />
            <LeadFormField
              label="Próxima acción"
              placeholder="Acción a realizar"
              value={form.nextAction}
              onChangeText={(value) => update("nextAction", value)}
            />
            {(
              [
                ["statusUntil", "Vigencia del estatus"],
                ["nextActionAt", "Fecha de próxima acción"],
                ["nextFollowUpAt", "Fecha de próximo seguimiento"],
              ] as const
            ).map(([key, label]) => (
              <LeadDateTimeField
                key={key}
                label={label}
                value={form[key]}
                onChange={(value) => update(key, value)}
              />
            ))}
          </>
        )}
      </View>
    </AppModal>
  );
}

function LeadDateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [picker, setPicker] = useState<"date" | "time" | null>(null);
  const date =
    value && !Number.isNaN(Date.parse(value)) ? new Date(value) : new Date();
  return (
    <View style={styles.actions}>
      <Text>{label}</Text>
      <Text>
        {value ? date.toLocaleString("es-MX") : "Sin fecha registrada"}
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPicker("date")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Elegir fecha</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPicker("time")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Elegir hora</Text>
        </Pressable>
      </View>
      {value ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setPicker(null);
            onChange("");
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Quitar fecha</Text>
        </Pressable>
      ) : null}
      {picker ? (
        <>
          <DateTimePicker
            value={date}
            mode={picker}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selected) => {
              if (Platform.OS !== "ios" || event.type === "dismissed")
                setPicker(null);
              if (event.type !== "dismissed" && selected)
                onChange(selected.toISOString());
            }}
          />
          {Platform.OS === "ios" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setPicker(null)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Listo</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 12 },
  button: {
    backgroundColor: "#0f362b",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    minHeight: 44,
  },
  buttonText: { color: "white", fontWeight: "600" },
  danger: { backgroundColor: "#ba544a" },
  disabled: { opacity: 0.5 },
  error: { color: "#ba544a" },
});
