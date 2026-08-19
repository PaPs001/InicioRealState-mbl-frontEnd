import type { AppointmentType, GoogleCalendarDate } from '@/lib/api'
import type { LeadFollowUp, Property } from '@/lib/types'

import type { AppointmentPreviewItem } from './types'
import { Linking } from 'react-native'
export function mapGoogleDateToAppointment(date: GoogleCalendarDate): AppointmentPreviewItem {
  const startValue = date.startDateTime ?? undefined
  const descriptionLines = (date.description ?? '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  return {
    id: date._id,
    appointmentType: date.appointmentType ?? null,
    property: date.title || 'Cita programada',
    client: date.location || descriptionLines[0] || 'Pendiente',
    adviser: date.helpedBy || date.advisorId || 'Pendiente',
    day: formatCalendarDay(startValue),
    time: formatCalendarTime(startValue),
    status: getCalendarStatusLabel(date.status ?? undefined),
    sortTime: getCalendarSortTime(startValue),
  }
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'AS'
}

export function formatCurrentDashboardDate() {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

export function getDefaultAppointmentType(summary?: string): AppointmentType {
  const value = summary?.toLowerCase() ?? ''
  if (value.includes('renta')) return 'renta'
  if (value.includes('venta')) return 'venta'
  return 'general'
}

export function getDefaultAppointmentStartDateTime() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(10, 0, 0, 0)
  return date.toISOString()
}

export function getDefaultAppointmentEndDateTime() {
  return getAppointmentEndDateTime(getDefaultAppointmentStartDateTime())
}

export function getAppointmentEndDateTime(startDateTime: string) {
  const date = new Date(startDateTime)
  const startDate = Number.isNaN(date.getTime()) ? new Date() : date
  startDate.setHours(startDate.getHours() + 4)
  return startDate.toISOString()
}

export function getPropertyDisplayName(property?: Property | null) {
  if (!property) return ''
  return property.title || property.address || property.city || property.id || property._id || 'Propiedad'
}

export function hasUpcomingFollowUpDate(followUp: LeadFollowUp) {
  const date = new Date(getFollowUpDate(followUp))
  return !Number.isNaN(date.getTime()) && date >= new Date()
}

export function isOverdueFollowUp(followUp: LeadFollowUp) {
  if (!followUp.nextActionDate) return false
  const date = new Date(followUp.nextActionDate)
  return !Number.isNaN(date.getTime()) && date < new Date()
}

function getFollowUpDate(followUp: LeadFollowUp) {
  return followUp.nextActionDate || followUp.date
}

function formatCalendarDay(value?: string) {
  if (!value) return 'Fecha pendiente'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fecha pendiente'
  const formatted = date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatCalendarTime(value?: string) {
  if (!value) return 'Hora pendiente'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Hora pendiente'
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getCalendarStatusLabel(status?: string) {
  if (status === 'confirmed') return 'Confirmada'
  if (status === 'cancelled') return 'Cancelada'
  if (status === 'tentative') return 'Tentativa'
  return 'Pendiente'
}

function getCalendarSortTime(value?: string) {
  if (!value) return Number.MAX_SAFE_INTEGER
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime()
}

export function formatDateFollowing(value?: string | Date) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)

  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatTime(value?: string | Date) {
  if (!value) return 'Sin hora'

  const date = new Date(value)

  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
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
