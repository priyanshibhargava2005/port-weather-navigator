import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TimeSeriesForecast } from '@/lib/types';

export function useTimeSeriesForecasting(portId: string | null) {
  const [forecast, setForecast] = useState<TimeSeriesForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useSeasonalModel, setUseSeasonalModel] = useState<boolean>(false);
  const [forecastDays, setForecastDays] = useState<number>(14);

  // Fetch forecast data when port, days, or model type changes
  useEffect(() => {
    if (!portId) return;

    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const timeSeriesForecast = await api.getTimeSeriesForecast(
          portId, 
          forecastDays, 
          useSeasonalModel
        );
        setForecast(timeSeriesForecast);
      } catch (err) {
        console.error('Error fetching time series forecast:', err);
        setError('Failed to load forecast data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [portId, forecastDays, useSeasonalModel]);

  // Function to toggle between regular ARIMA and seasonal SARIMA
  const toggleSeasonalModel = () => {
    setUseSeasonalModel(prev => !prev);
  };

  // Function to update forecast days
  const updateForecastDays = (days: number) => {
    setForecastDays(days);
  };

  return { 
    forecast,
    loading, 
    error,
    useSeasonalModel,
    forecastDays,
    toggleSeasonalModel,
    updateForecastDays
  };
}