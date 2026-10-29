import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "./api";

/* Loads data from the API and tracks loading / error state.
   A 401 (expired login) sends the user back to the Welcome page. */
export function useLoad<T>(loader: () => Promise<T>) {
  const navigate = useNavigate();

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    loader()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 401) {
          navigate("/", { replace: true });
          return;
        }

        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load data. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // loader is recreated every render on purpose; we only reload on `tick`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  return { data, error, loading, reload };
}
