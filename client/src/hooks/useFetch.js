import { useEffect, useState } from 'react';

export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let on = true;
    setLoading(true);
    fn()
      .then((res) => on && setData(res.data ?? res))
      .catch((err) => on && setError(err))
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, deps);

  return { data, loading, error, setData };
}
