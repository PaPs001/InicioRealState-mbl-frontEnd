import type { AppointmentType, GoogleCalendarDate } from "@/lib/api";
import type { LeadFollowUp, Property } from "@/lib/types";

import type { AppointmentPreviewItem } from "@/modules/users/main/types";
import { Linking } from "react-native";
export function mapGoogleDateToAppointment(
  date: GoogleCalendarDate,
): AppointmentPreviewItem {
  const startValue = date.startDateTime ?? undefined;

  return {
    id: date._id,
    title: getOptionalText(date.title),
    appointmentType: date.appointmentType ?? null,

    leadId: date.leadId ?? date.lead?.leadId,
    propertyId: date.propertyId ?? date.property?.propertyId,
    advisorId: date.advisorId ?? date.advisor?.userId,
    externalAdvisorName: date.externalAdvisorName ?? null,
    calendarId: date.googleCalendarId ?? null,
    
    startDateTime: date.startDateTime ?? '',
    endDateTime: date.endDateTime ?? '',
    property: getOptionalText(date.property?.name),
    propertyLocation: getOptionalText(date.property?.location),
    propertyPrice: getOptionalText(date.property?.price),

    client: getCalendarLeadName(date),
    description: getOptionalText(date.description),
    location: getOptionalText(date.location),

    adviser:
      getOptionalText(date.advisor?.name) ||
      getOptionalText(date.externalAdvisorName),
    adviserPhone: getOptionalText(date.advisor?.phone),
    adviserEmail: getOptionalText(date.advisor?.email),

    helpedBy: getOptionalText(date.helpedBy),
    createdBy: getOptionalText(date.createdByUser?.name),
    updatedBy: getOptionalText(date.updatedByUser?.name),

    day: formatCalendarDay(startValue),
    time: formatCalendarTime(startValue),
    status: getCalendarStatusLabel(date.status ?? undefined),
    sortTime: getCalendarSortTime(startValue),

    timeZone: date.timeZone ?? null
  };
}

function getOptionalText(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
}

function getCalendarLeadName(date: GoogleCalendarDate) {
  return [date.lead?.name]
    .find((value) => typeof value === "string" && value.trim())
    ?.trim();
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AS"
  );
}

export function formatCurrentDashboardDate() {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function getDefaultAppointmentType(summary?: string): AppointmentType {
  const value = summary?.toLowerCase() ?? "";
  if (value.includes("renta")) return "renta";
  if (value.includes("venta")) return "venta";
  return "general";
}

export function getDefaultAppointmentStartDateTime() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

export function getDefaultAppointmentEndDateTime() {
  return getAppointmentEndDateTime(getDefaultAppointmentStartDateTime());
}

export function getAppointmentEndDateTime(startDateTime: string) {
  const date = new Date(startDateTime);
  const startDate = Number.isNaN(date.getTime()) ? new Date() : date;
  startDate.setHours(startDate.getHours() + 4);
  return startDate.toISOString();
}

export function getPropertyDisplayName(property?: Property | null) {
  if (!property) return "";
  return (
    property.title ||
    property.address ||
    property.city ||
    property.id ||
    property._id ||
    "Propiedad"
  );
}

export function hasUpcomingFollowUpDate(followUp: LeadFollowUp) {
  const date = new Date(getFollowUpDate(followUp));
  return !Number.isNaN(date.getTime()) && date >= new Date();
}

export function isOverdueFollowUp(followUp: LeadFollowUp) {
  if (!followUp.nextActionDate) return false;
  const date = new Date(followUp.nextActionDate);
  return !Number.isNaN(date.getTime()) && date < new Date();
}

function getFollowUpDate(followUp: LeadFollowUp) {
  return followUp.nextActionDate || followUp.date;
}

function formatCalendarDay(value?: string) {
  if (!value) return "Fecha pendiente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha pendiente";
  const formatted = date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatCalendarTime(value?: string) {
  if (!value) return "Hora pendiente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Hora pendiente";
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getCalendarStatusLabel(status?: string) {
  if (status === "confirmed") return "Confirmada";
  if (status === "cancelled") return "Cancelada";
  if (status === "tentative") return "Tentativa";
  return "Pendiente";
}

function getCalendarSortTime(value?: string) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? Number.MAX_SAFE_INTEGER
    : date.getTime();
}

export function formatDateFollowing(value?: string | Date) {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTime(value?: string | Date) {
  if (!value) return "Sin hora";

  const date = new Date(value);

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function normalizeDateInput(value: string) {
  const normalizedValue = value.trim();
  if (!normalizedValue) return null;

  const date = new Date(
    normalizedValue.includes("T")
      ? normalizedValue
      : normalizedValue.replace(" ", "T"),
  );
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function openWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return;
  Linking.openURL(`https://wa.me/${digits}`).catch(() => undefined);
}

export function openPhoneCall(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return;
  Linking.openURL(`tel:${digits}`).catch(() => undefined);
}

export function capitalizeFirstLetter(text: string) {
  const normalizedText = text.trim().toLowerCase();
  if (!text) return "";
  return normalizedText.charAt(0).toUpperCase() + normalizedText.slice(1);
}

export function deleteMXNWord(text: string) {
  const normalizedText = text.trim().toLowerCase();
  return normalizedText.replace("mxn", "");
}
