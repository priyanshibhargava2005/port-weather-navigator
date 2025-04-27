export interface Port {
  id: string;
  name: string;
  code: string;
  country: string;
  latitude: number;
  longitude: number;
  size: 'small' | 'medium' | 'large';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  visibility: number;
  weatherType: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy';
  waveHeight?: number;
  timestamp: number;
}

export interface HistoricalWeather {
  date: string;
  weatherData: WeatherData;
}

export interface ShippingData {
  portId: string;
  vesselCount: number;
  avgWaitTime: number;
  delayedVessels: number;
  congestionLevel: 'low' | 'moderate' | 'high' | 'severe';
  timestamp: number;
}

export interface HistoricalShipping {
  date: string;
  shippingData: ShippingData;
}

export interface DelayPrediction {
  portId: string;
  predictedDelay: number;
  confidenceLevel: number;
  impactingFactors: {
    factor: string;
    impact: number;
  }[];
  timestamp: number;
  modelUsed?: string;
}

export interface CongestionPrediction {
  portId: string;
  level: 'low' | 'moderate' | 'high' | 'severe';
  confidence: number;
  estimatedDuration: number;
  timestamp: number;
  modelUsed?: string;
}

export interface TimeSeriesForecast {
  portId: string;
  forecastDates: string[];
  forecastValues: number[];
  confidenceIntervals?: {
    lowerBound: number[];
    upperBound: number[];
    confidenceLevel: number;
  };
  modelUsed: string;
  timestamp: number;
}

export interface Alert {
  id: string;
  portId: string;
  type: 'weather' | 'congestion' | 'delay';
  severity: 'low' | 'medium' | 'high';
  message: string;
  startTime: number;
  endTime?: number;
}

export interface AIModelMetadata {
  name: string;
  version: string;
  type: 'regression' | 'classification' | 'timeSeries' | 'ensemble';
  description: string;
  accuracy: number;
  lastTrained: number;
}

export interface PredictionFeatures {
  weatherFeatures: {
    avgTemperature: number;
    avgWindSpeed: number;
    precipitationIntensity: number;
    visibilityFactor: number;
  };
  portFeatures: {
    currentVesselCount: number;
    vesselCapacityRatio: number;
    historicalDelayPattern: number;
  };
}
