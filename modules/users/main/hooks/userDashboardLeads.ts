import type { PropertyLead } from "@/lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBackendLeadV2Records } from "@/lib/api";
import { isClosedLeadStatus } from "@/modules/users/leads/constants/lead-tracking-statuses";

type UseDashboardLeadsParams = {
  authToken: string | null
}

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
        await getBackendLeadV2Records(authToken),
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

  const appointmentLeadOptions = useMemo(
    () =>
      leads
        .filter((lead) => !isClosedLeadStatus(lead.status))
        .sort((current, next) => current.name.localeCompare(next.name)),
    [leads],
  );

  return {
    appointmentLeadOptions,
    isLeadsLoading,
    leads,
    loadLeads,
  };
}


