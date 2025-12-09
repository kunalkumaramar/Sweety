// src/hooks/useApi.js
import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    abortControllerRef.current = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(abortControllerRef.current.signal);
        
        if (isMounted && !abortControllerRef.current.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted && !abortControllerRef.current.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (isMounted && !abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      // Cancel ongoing API request when component unmounts or dependencies change
      abortControllerRef.current?.abort();
    };
  }, dependencies);

  return { data, loading, error, refetch: () => setData(null) };
};