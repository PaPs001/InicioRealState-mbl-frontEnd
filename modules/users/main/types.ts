export type AppointmentPreviewItem = {
  id?: string;
  title?: string;
  appointmentType?: string | null;

  leadId?: string | null;
  propertyId?: string | null;
  advisorId?: string | null;
  externalAdvisorName?: string | null;
  calendarId?: string | null;

  startDateTime: string;
  endDateTime: string;

  property?: string;
  propertyLocation?: string;
  propertyPrice?: string;

  client?: string;

  location?: string;

  adviser?: string;
  adviserPhone?: string;
  adviserEmail?: string;

  helpedBy?: string;
  createdBy?: string;
  updatedBy?: string;

  day: string;
  time: string;
  status: string;
  sortTime: number;
  description?: string;
  timeZone?: string | null;
};

export type DashboardTone = "neutral" | "warning" | "danger" | "success";

export type DashboardPriority = {
  id: string;
  value: number;
  label: string;
};

export type DashboardMetric = {
  id: string;
  value: number;
  label: string;
  tone: DashboardTone;
};

export type DashboardLeadAlert = {
  id: string;
  message: string;
};
