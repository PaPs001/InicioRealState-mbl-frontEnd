import { LeadFollowUp, PropertyLead } from "@/lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getBackendLeadRecords,
} from '@/lib/api'
import {
  isOverdueFollowUp,
  hasUpcomingFollowUpDate
} from '@/modules/users/main/utils/dashboard-formatters'
import {
  DashboardMetric,
  DashboardLeadAlert
} from '@/modules/users/main/types'

type UseDashboardLeadsParams = {
  authToken: string | null
}

type LeadFollowUpEntry = { lead: PropertyLead; followUp: LeadFollowUp };

const CLOSED_LEAD_STATUSES = ["cerrado", "descartado"]

export function useDashboardLeads({
  authToken,
}: UseDashboardLeadsParams) {
  const [leads, setLeads] = useState<PropertyLead[]>([])
  const [isLeadsLoading, setIsLeadsLoading] = useState(false)
  const hasLoadedInitialLeadsRef = useRef(false)

  const loadLeads = useCallback(async () => {
    if (!authToken) {
      setLeads([]);
      setIsLeadsLoading(false);
      return;
    }

    setIsLeadsLoading(true);
    try {
      setLeads( 
        await getBackendLeadRecords(authToken, { includeFollowUps: true }),
      );
    } catch (error) {
      console.warn("No se pudieron cargar los leads reales del asesor:", error);
      setLeads([]);
    } finally {
      setIsLeadsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (!authToken || hasLoadedInitialLeadsRef.current) return

    hasLoadedInitialLeadsRef.current = true
    console.info('[DashboardLeads][initial-load]')
    loadLeads();
  }, [authToken, loadLeads]);

  const leadSummary = useMemo(() => {
    const activeLeads = leads.filter(
      (lead) => !CLOSED_LEAD_STATUSES.includes(lead.status),
    );
    const entries: LeadFollowUpEntry[] = leads.flatMap((lead) =>
      (lead.followUps ?? []).map((followUp) => ({ lead, followUp })),
    );
    const followUps = entries.map((entry) => entry.followUp);
    const overdue = followUps.filter(isOverdueFollowUp);
    const upcoming = followUps.filter(hasUpcomingFollowUpDate);
    const noAnswer = followUps.filter(
      (followUp) => followUp.result === "noAnswer",
    );
    const appointments = followUps.filter(
      (followUp) => followUp.result === "appointmentScheduled",
    );
    const withFollowUps = activeLeads.filter(
      (lead) => (lead.followUps ?? []).length > 0,
    );
    const withoutNext = activeLeads.filter(
      (lead) =>
        !(lead.followUps ?? []).some((followUp) =>
          Boolean(followUp.nextActionDate),
        ),
    );
    return {
      followUps: followUps.length,
      overdueFollowUps: overdue.length,
      appointmentFollowUps: appointments.length,
      leadMetrics: [
        {
          id: "active",
          value: activeLeads.length,
          label: "Leads activos",
          tone: "neutral",
        },
        {
          id: "pending",
          value: followUps.length,
          label: "Seguimientos",
          tone: "warning",
        },
        {
          id: "late",
          value: overdue.length,
          label: "Atrasados",
          tone: overdue.length ? "danger" : "success",
        },
        {
          id: "today",
          value: upcoming.length,
          label: "Proximos",
          tone: "warning",
        },
      ] satisfies DashboardMetric[],
      leadFunnel: [
        {
          id: "new",
          value: activeLeads.filter(
            (lead) => (lead.followUps ?? []).length === 0,
          ).length,
          label: "Nuevos",
          tone: "neutral",
        },
        {
          id: "following",
          value: withFollowUps.length,
          label: "En seguimiento",
          tone: "neutral",
        },
        {
          id: "closing",
          value: appointments.length,
          label: "Por cerrar",
          tone: "neutral",
        },
        {
          id: "won",
          value: leads.filter((lead) => lead.status === "cerrado").length,
          label: "Ganados",
          tone: "success",
        },
        {
          id: "lost",
          value: leads.filter((lead) => lead.status === "descartado").length,
          label: "Perdidos",
          tone: "neutral",
        },
      ] satisfies DashboardMetric[],
      leadAlerts: [
        overdue.length
          ? {
              id: "expired",
              message: `${overdue.length} seguimientos vencidos`,
            }
          : null,
        noAnswer.length
          ? {
              id: "no-answer",
              message: `${noAnswer.length} seguimientos sin respuesta`,
            }
          : null,
        withoutNext.length
          ? {
              id: "next-action",
              message: `${withoutNext.length} leads sin siguiente accion`,
            }
          : null,
      ].filter(Boolean) as DashboardLeadAlert[],
    };
  }, [leads]);

  const appointmentLeadOptions = useMemo(
    () =>
      leads
        .filter((lead) => !CLOSED_LEAD_STATUSES.includes(lead.status))
        .sort((current, next) => current.name.localeCompare(next.name)),
    [leads],
  );

  return {
    appointmentLeadOptions,
    isLeadsLoading,
    leadSummary,
    leads,
    loadLeads,
  };
}


