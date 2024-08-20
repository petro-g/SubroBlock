import { useRef, useState } from "react";

export default function useLoading<T = unknown>() {
  const lastStartLoading = useRef(0);
  const [loading, setLoading] = useState(false);
  const withLoading = async (callback: () => Promise<T>) => {
    const localLastStartLoading = lastStartLoading.current = Date.now();
    setLoading(true);

    const response = await callback();

    // avoid setting loading to false if another request has started
    if (localLastStartLoading === lastStartLoading.current)
      setLoading(false);

    return response;
  };

  return [
    loading, // true until the promise is resolved
    withLoading // wrap a function. loading = true until the promise is resolved
  ] as const;
}
