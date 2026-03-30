import { useEffect, useState } from "react";

import api from "../services/api";

export function usePrices(filters) {
  const [prices, setPrices] = useState([]);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [latest, trends] = await Promise.all([
          api.get("/prices", { params: filters }),
          api.get("/prices/history", { params: { crop: filters.crop, region: filters.region, days: 60 } })
        ]);

        let predicted = null;
        if (filters.crop && filters.region) {
          try {
            const predictionResponse = await api.get("/prices/predict", {
              params: { crop: filters.crop, region: filters.region }
            });
            predicted = predictionResponse.data;
          } catch {
            predicted = null;
          }
        }

        if (!mounted) {
          return;
        }

        setPrices(latest.data.items || []);
        setHistory(trends.data.items || []);
        setPrediction(predicted);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [filters.crop, filters.region]);

  return { prices, history, prediction, loading };
}
