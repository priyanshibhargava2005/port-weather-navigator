import { 
  Port, 
  WeatherData, 
  ShippingData, 
  DelayPrediction, 
  CongestionPrediction, 
  HistoricalWeather, 
  HistoricalShipping,
  Alert
} from './types';
import { generateAIDelayPrediction, generateAICongestionPrediction } from './aiService';

// Mock data for development
// In production, these would be replaced with actual API calls

// Mock ports data
const mockPorts: Port[] = [
  {
    id: 'p001',
    name: 'Singapore Port',
    code: 'SGSIN',
    country: 'Singapore',
    latitude: 1.2905,
    longitude: 103.8520,
    size: 'large'
  },
  {
    id: 'p002',
    name: 'Rotterdam Port',
    code: 'NLRTM',
    country: 'Netherlands',
    latitude: 51.9244,
    longitude: 4.4777,
    size: 'large'
  },
  {
    id: 'p003',
    name: 'Shanghai Port',
    code: 'CNSHA',
    country: 'China',
    latitude: 31.2304,
    longitude: 121.4737,
    size: 'large'
  },
  {
    id: 'p004',
    name: 'Los Angeles Port',
    code: 'USLAX',
    country: 'United States',
    latitude: 33.7395,
    longitude: -118.2610,
    size: 'large'
  },
  {
    id: 'p005',
    name: 'Hamburg Port',
    code: 'DEHAM',
    country: 'Germany',
    latitude: 53.5414,
    longitude: 9.9370,
    size: 'medium'
  },
  {
    id: 'p006',
    name: 'Sydney Port',
    code: 'AUSYD',
    country: 'Australia',
    latitude: -33.8696,
    longitude: 151.2094,
    size: 'medium'
  },
  {
    id: 'p007',
    name: 'Dubai Port',
    code: 'AEDXB',
    country: 'UAE',
    latitude: 25.2697,
    longitude: 55.3094,
    size: 'large'
  },
  {
    id: 'p008',
    name: 'Santos Port',
    code: 'BRSSZ',
    country: 'Brazil',
    latitude: -23.9519,
    longitude: -46.3378,
    size: 'medium'
  }
];

// Weather types for randomization
const weatherTypes = ['clear', 'cloudy', 'rainy', 'stormy', 'foggy', 'snowy'] as const;
const congestionLevels = ['low', 'moderate', 'high', 'severe'] as const;

// Function to generate random weather data
const generateWeatherData = (): WeatherData => {
  return {
    temperature: Math.floor(Math.random() * 35) + 5, // 5 to 40 degrees
    humidity: Math.floor(Math.random() * 100), // 0% to 100%
    windSpeed: Math.floor(Math.random() * 60), // 0 to 60 km/h
    windDirection: Math.floor(Math.random() * 360), // 0 to 360 degrees
    precipitation: Math.floor(Math.random() * 100), // 0 to 100 mm
    visibility: Math.floor(Math.random() * 10000), // 0 to 10,000 meters
    weatherType: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
    waveHeight: Math.random() * 5, // 0 to 5 meters
    timestamp: Date.now()
  };
};

// Function to generate random shipping data
const generateShippingData = (portId: string): ShippingData => {
  return {
    portId,
    vesselCount: Math.floor(Math.random() * 50) + 10, // 10 to 60 vessels
    avgWaitTime: Math.floor(Math.random() * 72) + 2, // 2 to 74 hours
    delayedVessels: Math.floor(Math.random() * 20), // 0 to 20 vessels
    congestionLevel: congestionLevels[Math.floor(Math.random() * congestionLevels.length)],
    timestamp: Date.now()
  };
};

// Function to generate historical data
const generateHistoricalData = (days: number, portId: string) => {
  const weatherHistory: HistoricalWeather[] = [];
  const shippingHistory: HistoricalShipping[] = [];
  
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    weatherHistory.push({
      date: dateStr,
      weatherData: {
        ...generateWeatherData(),
        timestamp: date.getTime()
      }
    });
    
    shippingHistory.push({
      date: dateStr,
      shippingData: {
        ...generateShippingData(portId),
        timestamp: date.getTime()
      }
    });
  }
  
  return { weatherHistory, shippingHistory };
};

// Function to generate alerts
const generateAlerts = (portId: string, count: number = 3): Alert[] => {
  const alertTypes = ['weather', 'congestion', 'delay'] as const;
  const alertSeverity = ['low', 'medium', 'high'] as const;
  const alerts: Alert[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = alertSeverity[Math.floor(Math.random() * alertSeverity.length)];
    
    let message = '';
    switch (type) {
      case 'weather':
        message = severity === 'high' 
          ? 'Severe storm approaching, port operations at risk' 
          : severity === 'medium' 
            ? 'Strong winds expected, potential delay impact' 
            : 'Light precipitation expected, minimal impact';
        break;
      case 'congestion':
        message = severity === 'high' 
          ? 'Critical port congestion, significant delays expected' 
          : severity === 'medium' 
            ? 'Moderate congestion building, delays likely' 
            : 'Slight increase in vessel traffic, monitor for changes';
        break;
      case 'delay':
        message = severity === 'high' 
          ? 'Major delays affecting multiple vessels' 
          : severity === 'medium' 
            ? 'Processing delays affecting scheduled departures' 
            : 'Minor delays reported, situation being monitored';
        break;
    }
    
    const now = Date.now();
    const startTime = now - Math.floor(Math.random() * 24 * 60 * 60 * 1000);
    
    alerts.push({
      id: `a${i}-${portId}-${Date.now()}`,
      portId,
      type,
      severity,
      message,
      startTime,
      // Only some alerts have end times (ongoing vs. resolved)
      endTime: Math.random() > 0.3 ? startTime + Math.floor(Math.random() * 48 * 60 * 60 * 1000) : undefined
    });
  }
  
  return alerts;
};

// API functions
export const api = {
  getPorts: async (): Promise<Port[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockPorts;
  },
  
  getPortById: async (id: string): Promise<Port | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPorts.find(port => port.id === id);
  },
  
  getCurrentWeather: async (portId: string): Promise<WeatherData> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return generateWeatherData();
  },
  
  getCurrentShippingData: async (portId: string): Promise<ShippingData> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return generateShippingData(portId);
  },
  
  getHistoricalData: async (portId: string, days: number = 30) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return generateHistoricalData(days, portId);
  },
  
  getDelayPrediction: async (portId: string): Promise<DelayPrediction> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get required data for AI prediction
    const currentWeather = await api.getCurrentWeather(portId);
    const { weatherHistory, shippingHistory } = await api.getHistoricalData(portId, 30);
    const currentShipping = await api.getCurrentShippingData(portId);
    
    // Use AI model to generate prediction
    return generateAIDelayPrediction(
      portId,
      currentWeather,
      weatherHistory,
      currentShipping,
      shippingHistory
    );
  },
  
  getCongestionPrediction: async (portId: string): Promise<CongestionPrediction> => {
    await new Promise(resolve => setTimeout(resolve, 1300));
    
    // Get required data for AI prediction
    const currentWeather = await api.getCurrentWeather(portId);
    const { weatherHistory, shippingHistory } = await api.getHistoricalData(portId, 30);
    const currentShipping = await api.getCurrentShippingData(portId);
    
    // Use AI model to generate prediction
    return generateAICongestionPrediction(
      portId,
      currentWeather,
      weatherHistory,
      currentShipping,
      shippingHistory
    );
  },
  
  getAlerts: async (portId: string): Promise<Alert[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateAlerts(portId);
  }
};
