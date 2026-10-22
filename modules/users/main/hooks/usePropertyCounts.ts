import { useCallback, useEffect, useState } from "react";
import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import {
  getPropertiesCount,
  type TypesOfProperties,
} from "@/lib/api/endpoints/catalog";

type CountsState = {
  token: string;
  counts: TypesOfProperties | null;
  error: string | null;
};

export function usePropertyCounts() {
  const { authToken } = useSessionDomain();
  const [state, setState] = useState<CountsState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!authToken) {
      setState(null);
      return;
    }
    const token = authToken;
    let active = true;
    setState({ token, counts: null, error: null });
    void getPropertiesCount(token).then(
      (counts) => {
        if (active) setState({ token, counts, error: null });
      },
      () => {
        if (active) {
          setState({
            token,
            counts: null,
            error: "No se pudieron cargar los totales de propiedades.",
          });
        }
      },
    );
    return () => { active = false; };
  }, [authToken, attempt]);

  const current = state?.token === authToken ? state : null;
  return {
    counts: current?.counts ?? null,
    error: current?.error ?? null,
    retry,
  };
}
