'use client';

import { useState, useEffect } from 'react';

export const useParallelFetch = (urls) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParallel = async () => {
      try {
        setLoading(true);
        
        // Ejecutar todas las consultas en paralelo
        const promises = urls.map(url => 
          fetch(url, { cache: 'no-store' }).then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
        );

        // Esperar a que todas las consultas terminen
        const results = await Promise.all(promises);
        setData(results);
      } catch (err) {
        console.error('Parallel fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (urls && urls.length > 0) {
      fetchParallel();
    }
  }, [urls]);

  return { data, loading, error };
};

export const useParallelFetchWithFallback = (urls, fallbackData = []) => {
  const { data, loading, error } = useParallelFetch(urls);
  
  return {
    data: error ? fallbackData : data,
    loading,
    error
  };
};
