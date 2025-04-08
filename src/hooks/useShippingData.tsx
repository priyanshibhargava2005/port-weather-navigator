
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ShippingData, HistoricalShipping, DelayPrediction, CongestionPrediction, Alert } from '@/lib/types';

export function useShippingData(portId: string | null) {
  const [currentShipping, setCurrentShipping] = useState<ShippingData | null>(null);
  const [historicalShipping, setHistoricalShipping] = useState<HistoricalShipping[]>([]);
  const [delayPrediction, setDelayPrediction] = useState<DelayPrediction | null>(null);
  const [congestionPrediction, setCongestionPrediction] = useState<CongestionPrediction | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [shipping, histData, delay, congestion, alertsData] = await Promise.all([
          api.getCurrentShippingData(portId),
          api.getHistoricalData(portId, 30),
          api.getDelayPrediction(portId),
          api.getCongestionPrediction(portId),
          api.getAlerts(portId)
        ]);
        
        setCurrentShipping(shipping);
        setHistoricalShipping(histData.shippingHistory);
        setDelayPrediction(delay);
        setCongestionPrediction(congestion);
        setAlerts(alertsData);
      } catch (err) {
        console.error('Error fetching shipping data:', err);
        setError('Failed to load shipping data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up interval to refresh shipping data and predictions every 15 minutes
    const intervalId = setInterval(() => {
      if (portId) {
        Promise.all([
          api.getCurrentShippingData(portId),
          api.getDelayPrediction(portId),
          api.getCongestionPrediction(portId),
          api.getAlerts(portId)
        ])
          .then(([shipping, delay, congestion, alertsData]) => {
            setCurrentShipping(shipping);
            setDelayPrediction(delay);
            setCongestionPrediction(congestion);
            setAlerts(alertsData);
          })
          .catch(err => console.error('Error refreshing shipping data:', err));
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(intervalId);
  }, [portId]);

  return { 
    currentShipping, 
    historicalShipping, 
    delayPrediction, 
    congestionPrediction, 
    alerts,
    loading, 
    error 
  };
}
