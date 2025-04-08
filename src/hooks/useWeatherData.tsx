
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { WeatherData, HistoricalWeather } from '@/lib/types';

export function useWeatherData(portId: string | null) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [historicalWeather, setHistoricalWeather] = useState<HistoricalWeather[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const weather = await api.getCurrentWeather(portId);
        setCurrentWeather(weather);
        
        const { weatherHistory } = await api.getHistoricalData(portId, 30);
        setHistoricalWeather(weatherHistory);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up interval to refresh current weather every 5 minutes
    const intervalId = setInterval(() => {
      if (portId) {
        api.getCurrentWeather(portId)
          .then(weather => setCurrentWeather(weather))
          .catch(err => console.error('Error refreshing weather data:', err));
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [portId]);

  return { currentWeather, historicalWeather, loading, error };
}
