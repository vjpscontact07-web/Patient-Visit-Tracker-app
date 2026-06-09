import { useCallback, useRef } from "react";

export default function useOptimisticAction(addToast) {
  const inFlight = useRef(new Set());

  const run = useCallback(
    async (key, { apply, request, onSuccess, onError, successMessage }) => {
      if (inFlight.current.has(key)) return;
      inFlight.current.add(key);

      const snapshot = apply();

      if (successMessage) addToast(successMessage);

      try {
        const result = await request();
        onSuccess?.(result);
        return result;
      } catch (err) {
        onError?.(snapshot, err);
        addToast(err.message, "error");
        throw err;
      } finally {
        inFlight.current.delete(key);
      }
    },
    [addToast],
  );

  return run;
}
