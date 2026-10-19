// lib/config/appointment-types.ts
import { generalColors } from "@/theme";

export type LeadRule = "required" | "optional" | "none";
export type PropertyRule = "optional" | "none";
export type CalendarSelection = "assigned" | "manual" | "named";
export type ParentType = "general" | "venta" | "renta";
export type AppointmentSubdivision = | "mercado_abierto" | 'desarrollos'

export type AppointmentSubTypeDefinition = {
  label: string;
  color: string;
  lead: LeadRule;
  property: PropertyRule;
  cardLabel?: string;
  value: AppointmentSubdivision
};

export type SubDivisionTypes = AppointmentSubTypeDefinition;

export type AppointmentTypeDefinition = {
  label: string;
  color: string;
  lead: LeadRule;
  property: PropertyRule;
  calendarSelection: CalendarSelection;
  parentType?: ParentType;
  calendarNameKeywords?: readonly string[];
  cardLabel?: string;
  hasSubdivision?: boolean;
  subdivisionTypes?: SubDivisionTypes[];
};

export const DEFAULT_APPOINTMENT_TYPE = "general";

export const APPOINTMENT_TYPE_CATALOG = {
  renta: {
    label: "Renta",
    color: generalColors.rentColor,
    lead: "required",
    property: "optional",
    calendarSelection: "assigned",
    cardLabel: "cita renta",
  },
  venta: {
    label: "Venta",
    color: generalColors.saleColor,
    lead: "required",
    property: "optional",
    calendarSelection: "assigned",
    cardLabel: "cita venta",
    hasSubdivision: true,
    subdivisionTypes: [
      {
        label: "Mercado abierto",
        color: generalColors.saleColor,
        lead: "required",
        property: "optional",
        cardLabel: "cita venta",
        value: 'mercado_abierto'
      },
      {
        label: "Desarrollos",
        color: generalColors.development,
        lead: "required",
        property: "optional",
        cardLabel: "cita venta",
        value: 'desarrollos'
      },
    ],
  },
  general: {
    label: "Otras citas",
    color: generalColors.general,
    lead: "none",
    property: "none",
    calendarSelection: "manual",
    cardLabel: "cita general",
  },
  junta: {
    label: "Junta",
    color: generalColors.meeting,
    lead: "none",
    property: "none",
    calendarSelection: "named",
    parentType: "general",
    calendarNameKeywords: ["juntas", "junta"],
  },
  firma_escrituras: {
    label: "Firma escrituras",
    color: generalColors.signature,
    lead: "required",
    property: "optional",
    calendarSelection: "named",
    parentType: "general",
    calendarNameKeywords: ["firma de escrituras", "firma"],
  },
  open_house: {
    label: "Open House",
    color: generalColors.openHouse,
    lead: "none",
    property: "none",
    calendarSelection: "named",
    parentType: "general",
    calendarNameKeywords: ["open house", "openhouse", "open houses", "open"],
  },
  licencia: {
    label: "Licencia",
    color: generalColors.licences,
    lead: "none",
    property: "none",
    calendarSelection: "named",
    parentType: "general",
    calendarNameKeywords: ["licencia", "licencias", "license", "LICENCIA", "Licencia"]
  }

} as const satisfies Record<string, AppointmentTypeDefinition>;

export type AppointmentType = keyof typeof APPOINTMENT_TYPE_CATALOG;

export function isAppointmentType(
  value?: string | null,
): value is AppointmentType {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();

  return Object.prototype.hasOwnProperty.call(
    APPOINTMENT_TYPE_CATALOG,
    normalized,
  );
}

export function getAppointmentTypeConfig(
  value?: string | null,
): AppointmentTypeDefinition {
  const normalized = value?.trim().toLowerCase();

  if (isAppointmentType(normalized)) {
    return APPOINTMENT_TYPE_CATALOG[normalized];
  }

  return APPOINTMENT_TYPE_CATALOG[DEFAULT_APPOINTMENT_TYPE];
}

export function getAppointmentTypeOptions(): Array<
  AppointmentTypeDefinition & { value: AppointmentType }
> {
  return (Object.keys(APPOINTMENT_TYPE_CATALOG) as AppointmentType[]).map(
    (value) => ({
      value,
      ...APPOINTMENT_TYPE_CATALOG[value],
    }),
  );
}

export function getPrimaryAppointmentTypeOptions() {
  return getAppointmentTypeOptions().filter((type) => !type.parentType);
}

export function getAppointmentSubtypeOptions(parentType: AppointmentType) {
  return getAppointmentTypeOptions().filter(
    (type) => type.parentType === parentType,
  );
}

export function getCalendarAssignableAppointmentTypeOptions() {
  return getAppointmentTypeOptions().filter(
    (type) => type.calendarSelection === "assigned",
  );
}

export function getDefaultAppointmentType(summary?: string): AppointmentType {
  const normalizedSummary = summary?.trim().toLowerCase() ?? "";

  return (
    (Object.keys(APPOINTMENT_TYPE_CATALOG) as AppointmentType[]).find((type) =>
      calendarNameMatchesAppointmentType(normalizedSummary, type),
    ) ?? DEFAULT_APPOINTMENT_TYPE
  );
}

export function calendarNameMatchesAppointmentType(
  calendarName: string | null | undefined,
  appointmentType: AppointmentType,
) {
  const normalizedName = calendarName?.trim().toLowerCase() ?? "";
  const config = getAppointmentTypeConfig(appointmentType);
  const keywords = config.calendarNameKeywords ?? [appointmentType];

  return keywords.some((keyword) => normalizedName.includes(keyword));
}

export function isReservedNamedCalendar(summary?: string | null) {
  return getAppointmentTypeOptions().some(
    (type) =>
      type.calendarSelection === "named" &&
      calendarNameMatchesAppointmentType(summary, type.value),
  );
}

export function canSelectCalendarManually(calendar: {
  summary?: string | null;
  appointmentType?: string | null;
}) {
  return (
    getAppointmentTypeConfig(calendar.appointmentType).calendarSelection ===
      "manual" && !isReservedNamedCalendar(calendar.summary)
  );
}

export function findCalendarForAppointmentType<
  Calendar extends {
    summary?: string;
    appointmentType?: string | null;
  },
>(calendars: Calendar[], appointmentType: AppointmentType) {
  const config = getAppointmentTypeConfig(appointmentType);

  if (config.calendarSelection === "named") {
    return calendars.find((calendar) =>
      calendarNameMatchesAppointmentType(calendar.summary, appointmentType),
    );
  }

  return calendars.find(
    (calendar) =>
      calendar.appointmentType?.trim().toLowerCase() === appointmentType,
  );
}
