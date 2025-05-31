import { useState, useEffect, useCallback } from "react";
import {
  ShippingData,
  DelayPrediction,
  CongestionPrediction,
} from "@/lib/types";
import { api } from "@/lib/api";

export const useShippingData = (portId: string | null, modelName?: string) => {
  const [currentShipping, setCurrentShipping] = useState<ShippingData | null>(
    null
  );
  const [delayPrediction, setDelayPrediction] =
    useState<DelayPrediction | null>(null);
  const [congestionPrediction, setCongestionPrediction] =
    useState<CongestionPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!portId) {
      setCurrentShipping(null);
      setDelayPrediction(null);
      setCongestionPrediction(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [shipping, delay, congestion] = await Promise.all([
        api.getCurrentShippingData(portId),
        api.getDelayPrediction(portId, modelName),
        api.getCongestionPrediction(portId, modelName),
      ]);

      setCurrentShipping(shipping);
      setDelayPrediction(delay);
      setCongestionPrediction(congestion);
    } catch (err) {
      console.error("Error fetching shipping data:", err);
      setError("Failed to load shipping data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [portId, modelName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    currentShipping,
    delayPrediction,
    congestionPrediction,
    loading,
    error,
    refreshData,
  };
};
