import {
  Port,
  WeatherData,
  ShippingData,
  DelayPrediction,
  CongestionPrediction,
  HistoricalWeather,
  HistoricalShipping,
  Alert,
  TimeSeriesForecast,
} from "./types";

// Backend API URL
const API_URL = "/api";

// Keep the port data but remove random generation functions
const ports: Port[] = [
  {
    id: "p001",
    name: "Singapore Port",
    code: "SGSIN",
    country: "Singapore",
    latitude: 1.264,
    longitude: 103.840,
    size: "large",
  },
  {
    id: "p002",
    name: "Rotterdam Port",
    code: "NLRTM",
    country: "Netherlands",
    latitude: 51.8850,
    longitude: 4.2867,
    size: "large",
  },
  {
    id: "p003",
    name: "Shanghai Port",
    code: "CNSHA",
    country: "China",
    latitude: 30.6265,
    longitude: 122.0650,
    size: "large",
  },
  {
    id: "p004",
    name: "Los Angeles Port",
    code: "USLAX",
    country: "United States",
    latitude: 33.7400,
    longitude: -118.2667,
    size: "large",
  },
  {
    id: "p005",
    name: "Hamburg Port",
    code: "DEHAM",
    country: "Germany",
    latitude: 53.5500,
    longitude: 10.0000,
    size: "medium",
  },
  {
    id: "p006",
    name: "Sydney Port",
    code: "AUSYD",
    country: "Australia",
    latitude: -33.8522,
    longitude: 151.2106,
    size: "medium",
  },
  {
    id: "p007",
    name: "Dubai Port",
    code: "AEDXB",
    country: "UAE",
    latitude: 25.2770,
    longitude: 55.2962,
    size: "large",
  },
  {
    id: "p008",
    name: "Santos Port",
    code: "BRSSZ",
    country: "Brazil",
    latitude: -23.9822,
    longitude: -46.2926,
    size: "medium",
  },
];

// Weather state mapping for the backend
const weatherStateMap: Record<string, string> = {
  clear: "Clear",
  cloudy: "Clear", // Map cloudy to Clear for the backend
  rainy: "Rain",
  stormy: "HighWind",
  foggy: "Fog",
  snowy: "Clear", // Map snowy to Clear for the backend
};

// Default shipping data (used when real data isn't available)
const defaultShippingData = (portId: string): ShippingData => ({
  portId,
  vesselCount: 20,
  avgWaitTime: 12,
  delayedVessels: 5,
  congestionLevel: "moderate",
  timestamp: Date.now(),
});

// Map vessel types based on port size
const getVesselType = (portSize: string): string => {
  switch (portSize) {
    case "large":
      return "Container_ULCS";
    case "medium":
      return "Container_PostPanamax";
    default:
      return "Container_Panamax";
  }
};

// Map TEU based on port size
const getTEU = (portSize: string): number => {
  switch (portSize) {
    case "large":
      return 18000;
    case "medium":
      return 10000;
    default:
      return 5000;
  }
};

// API functions
export const api = {
  // Get available models from the backend
  getAvailableModels: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_URL}/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      // For every string in the response, check if it contains "arima" or "seasonal"
      // Discard those that do
      const { available_models: models } = await response.json();
      const filteredModels = models.filter(
        (model: string) =>
          !model.toLowerCase().includes("arima") &&
          !model.toLowerCase().includes("series")
      );
      return filteredModels.length > 0 ? filteredModels : ["Default Model"];
    } catch (error) {
      console.error("Error fetching available models:", error);
      return ["Default Model"];
    }
  },

  // Get time series forecasting data
  getTimeSeriesForecast: async (
    portId: string,
    forecastDays: number = 14,
    useSeasonalModel: boolean = false
  ): Promise<TimeSeriesForecast> => {
    try {
      // Prepare request for ARIMA forecast
      const requestData = {
        forecast_days: forecastDays,
        use_seasonal: useSeasonalModel,
      };

      // Call the Flask API endpoint for time series forecasting
      const response = await fetch(`${API_URL}/forecast/arima`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(
          `Time series forecast API error: ${response.statusText}`
        );
      }

      // Parse the response
      const forecastData = await response.json();

      // Map to our TimeSeriesForecast type
      return {
        portId,
        forecastDates: forecastData.forecast_dates,
        forecastValues: forecastData.forecast_values,
        confidenceIntervals: forecastData.confidence_intervals
          ? {
              lowerBound: forecastData.confidence_intervals.lower_bound,
              upperBound: forecastData.confidence_intervals.upper_bound,
              confidenceLevel:
                forecastData.confidence_intervals.confidence_level,
            }
          : undefined,
        modelUsed: forecastData.model_used,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error getting time series forecast:", error);

      // Return a fallback forecast
      const fallbackDates = Array.from({ length: forecastDays }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        return date.toISOString().split("T")[0];
      });

      return {
        portId,
        forecastDates: fallbackDates,
        forecastValues: Array(forecastDays).fill(0),
        modelUsed: "Error - Failed to get forecast",
        timestamp: Date.now(),
      };
    }
  },

  // Get ports (using static data for now)
  getPorts: async (): Promise<Port[]> => {
    return ports;
  },

  getPortById: async (id: string): Promise<Port | undefined> => {
    return ports.find((port) => port.id === id);
  },

  getWeatherData: async (portId: string): Promise<WeatherData> => {
      const port = await api.getPortById(portId);
      if (!port) {
        throw new Error(`Port with ID ${portId} not found`);
      }

      // Get weather from the /weather endpoint
      const response = await fetch(`${API_URL}/weather?lat=${port.latitude}&lon=${port.longitude}&forecast=false`);
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data: ${response.statusText}`);
      }
      const weatherData = await response.json();
      
      if (weatherData.current) {
        return {
          temperature: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          windSpeed: weatherData.current.wind_speed,
          windDirection: weatherData.current.wind_direction,
          precipitation: weatherData.current.precipitation,
          visibility: weatherData.current.visibility,
          weatherType: weatherData.current.weather_simple,
          waveHeight: weatherData.current.wave_height,
          timestamp: new Date(weatherData.current.timestamp).toISOString(),
        };
      } else {
        throw new Error('Weather data response is missing current weather information');
      }
  },

  getWeatherForecast: async (portId: string): Promise<any[]> => {
      const port = await api.getPortById(portId);
      if (!port) {
        throw new Error(`Port with ID ${portId} not found`);
      }

      // Get forecast from the /weather endpoint with forecast=true
      const response = await fetch(`${API_URL}/weather?lat=${port.latitude}&lon=${port.longitude}&forecast=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch forecast weather: ${response.statusText}`);
      }
      const forecastData = await response.json();
      
      if (forecastData.forecast && forecastData.forecast.length > 0) {
        // Convert the forecast data to the format expected by the backend
        return forecastData.forecast.map((item: any) => ({
          timestamp: new Date(item.timestamp).toISOString(),
          wind_speed_knots: item.wind_speed,
          visibility_nm: item.visibility / 1000, // Convert meters to nautical miles
          wave_height_m: item.wave_height || 0,
          precipitation_mmhr: item.precipitation || 0,
          state: weatherStateMap[item.weather_simple] || "Clear",
        }));
      } else {
        throw new Error('Weather forecast data is missing or empty');
      }
  },

  getCurrentShippingData: async (portId: string): Promise<ShippingData> => {
    // In a real app, you'd fetch this from a shipping data API
    return defaultShippingData(portId);
  },

  getHistoricalData: async (portId: string, days: number = 30) => {
    const port = await api.getPortById(portId);
    if (!port) {
      throw new Error(`Port with ID ${portId} not found`);
    }

    const weatherHistory: HistoricalWeather[] = [];
    const shippingHistory: HistoricalShipping[] = [];

    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Generate consistent weather data for each day
      const weatherData: WeatherData = {
        temperature: 20 + Math.sin((i / 7) * Math.PI) * 5,
        humidity: 60 + Math.cos((i / 10) * Math.PI) * 20,
        windSpeed: 10 + Math.sin((i / 5) * Math.PI) * 8,
        windDirection: (i * 20) % 360,
        precipitation: i % 7 === 0 ? 15 : 0, // Rain every 7 days
        visibility: 8000 - (i % 5 === 0 ? 4000 : 0), // Reduced visibility every 5 days
        weatherType: i % 7 === 0 ? "rainy" : i % 5 === 0 ? "foggy" : "clear",
        waveHeight: 1.0 + Math.sin((i / 8) * Math.PI) * 0.5,
        timestamp: date.toISOString(),
      };

      weatherHistory.push({
        date: dateStr,
        weatherData,
      });

      // Generate consistent shipping data for each day
      const shippingData: ShippingData = {
        portId,
        vesselCount: 15 + Math.floor(Math.sin((i / 6) * Math.PI) * 8),
        avgWaitTime: 8 + Math.floor(Math.sin((i / 9) * Math.PI) * 6),
        delayedVessels: Math.floor(
          (15 + Math.floor(Math.sin((i / 6) * Math.PI) * 8)) * 0.3
        ),
        congestionLevel:
          i % 10 === 0 ? "high" : i % 5 === 0 ? "moderate" : "low",
        timestamp: date.getTime(),
      };

      shippingHistory.push({
        date: dateStr,
        shippingData,
      });
    }

    return { weatherHistory, shippingHistory };
  },

  getDelayPrediction: async (
    portId: string,
    modelName?: string
  ): Promise<DelayPrediction> => {
    try {
      // 1. Get port information
      const port = await api.getPortById(portId);
      if (!port) {
        throw new Error(`Port with ID ${portId} not found`);
      }

      // 2. Get available models if a specific one wasn't provided
      let selectedModel = modelName;
      if (!selectedModel) {
        const availableModels = await api.getAvailableModels();
        selectedModel = availableModels[0] || "Default Model";
      }

      // 3. Get weather data - use getWeatherData for all models
      const hourlyForecast = await api.getWeatherForecast(portId);
      const arrivalTimestamp = (new Date).toISOString();

      // 4. Prepare request data for the Flask backend
      const requestData = {
        vessel_type: getVesselType(port.size),
        teu: getTEU(port.size),
        arrival_timestamp_str: arrivalTimestamp,
        hourly_weather_forecast: hourlyForecast,
        model_name: selectedModel,
      };

      // 5. Call the Flask API
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Prediction API error: ${response.statusText}`);
      }

      // 6. Parse the response
      const predictionData = await response.json();

      // 7. Map to our DelayPrediction type
      return {
        portId,
        predictedDelay: predictionData.predicted_total_weather_delay_hrs,
        impactingFactors: [
          {
            factor: "Weather Conditions",
            impact: 0.6,
          },
          {
            factor: "Vessel Size",
            impact: 0.3,
          },
          {
            factor: "Port Capacity",
            impact: 0.1,
          },
        ],
        timestamp: Date.now(),
        modelUsed: predictionData.model_used,
      };
    } catch (error) {
      console.error("Error getting delay prediction:", error);

      // Return a fallback prediction
      return {
        portId,
        predictedDelay: 0,
        impactingFactors: [],
        timestamp: Date.now(),
        modelUsed: "Error - Failed to get prediction",
      };
    }
  },

  getCongestionPrediction: async (
    portId: string,
    modelName?: string
  ): Promise<CongestionPrediction> => {
    // For now, generating a congestion prediction based on the port and delay prediction
    // In a real implementation, you might have a separate endpoint for congestion
    try {
      const port = await api.getPortById(portId);
      const delayPrediction = await api.getDelayPrediction(portId, modelName);

      // Map delay hours to congestion level
      let level: "low" | "moderate" | "high" | "severe";
      if (delayPrediction.predictedDelay < 6) {
        level = "low";
      } else if (delayPrediction.predictedDelay < 12) {
        level = "moderate";
      } else if (delayPrediction.predictedDelay < 24) {
        level = "high";
      } else {
        level = "severe";
      }

      return {
        portId,
        level,
        confidence: 0.8,
        estimatedDuration: delayPrediction.predictedDelay * 2, // Simple multiplier
        timestamp: Date.now(),
        modelUsed: `Based on ${delayPrediction.modelUsed}`,
      };
    } catch (error) {
      console.error("Error getting congestion prediction:", error);

      // Return a fallback prediction
      return {
        portId,
        level: "low",
        confidence: 0,
        estimatedDuration: 0,
        timestamp: Date.now(),
        modelUsed: "Error - Failed to get prediction",
      };
    }
  },

  getAlerts: async (portId: string): Promise<Alert[]> => {
    // Generate alerts based on predictions
    try {
      const delayPrediction = await api.getDelayPrediction(portId);
      const congestionPrediction = await api.getCongestionPrediction(portId);
      const alerts: Alert[] = [];

      // Add delay alert if significant delay predicted
      if (delayPrediction.predictedDelay > 12) {
        const severity: "low" | "medium" | "high" =
          delayPrediction.predictedDelay > 24
            ? "high"
            : delayPrediction.predictedDelay > 18
            ? "medium"
            : "low";

        alerts.push({
          id: `delay-${portId}-${Date.now()}`,
          portId,
          type: "delay",
          severity,
          message: `Predicted delay of ${Math.round(
            delayPrediction.predictedDelay
          )} hours due to weather conditions`,
          startTime: Date.now(),
          endTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
        });
      }

      // Add congestion alert if congestion is moderate or higher
      if (congestionPrediction.level !== "low") {
        const severity: "low" | "medium" | "high" =
          congestionPrediction.level === "severe"
            ? "high"
            : congestionPrediction.level === "high"
            ? "medium"
            : "low";

        alerts.push({
          id: `congestion-${portId}-${Date.now()}`,
          portId,
          type: "congestion",
          severity,
          message: `${
            congestionPrediction.level.charAt(0).toUpperCase() +
            congestionPrediction.level.slice(1)
          } port congestion expected for the next ${Math.round(
            congestionPrediction.estimatedDuration
          )} hours`,
          startTime: Date.now(),
        });
      }

      return alerts;
    } catch (error) {
      console.error("Error generating alerts:", error);
      return [];
    }
  },
};
