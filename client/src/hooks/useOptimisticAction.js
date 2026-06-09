import { useCallback, useRef } from "react";
import toast from "react-hot-toast";

export default function useOptimisticAction() {
  const inFlight = useRef(new Set());

  const run = useCallback(
    async (key, { apply, request, onSuccess, onError, successMessage }) => {
      if (inFlight.current.has(key)) return;
      inFlight.current.add(key);

      const snapshot = apply();

      if (successMessage) toast.success(successMessage);

      try {
        const result = await request();
        onSuccess?.(result);
        return result;
      } catch (err) {
        onError?.(snapshot, err);
        toast.error(err.message);
        throw err;
      } finally {
        inFlight.current.delete(key);
      }
    },
    [],
  );

  return run;
}
