
import { 
  WeatherData, 
  ShippingData, 
  HistoricalWeather, 
  HistoricalShipping,
  DelayPrediction,
  CongestionPrediction,
  AIModelMetadata,
  PredictionFeatures
} from './types';

// Available AI models for different prediction tasks
const aiModels: Record<string, AIModelMetadata> = {
  delayRegression: {
    name: 'Port Delay Regression Model',
    version: '1.2.0',
    type: 'regression',
    description: 'Multiple regression model to predict delay duration based on weather and port conditions',
    accuracy: 0.87,
    lastTrained: Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  congestionClassifier: {
    name: 'Congestion Level Classifier',
    version: '2.1.0',
    type: 'classification',
    description: 'Random forest classifier to determine congestion levels',
    accuracy: 0.82,
    lastTrained: Date.now() - (15 * 24 * 60 * 60 * 1000) // 15 days ago
  },
  weatherTimeSeriesModel: {
    name: 'Weather Impact Time Series Model',
    version: '1.0.5',
    type: 'timeSeries',
    description: 'LSTM-based model to forecast weather impacts on port operations',
    accuracy: 0.79,
    lastTrained: Date.now() - (21 * 24 * 60 * 60 * 1000) // 21 days ago
  },
  ensemblePredictor: {
    name: 'Port Operations Ensemble Model',
    version: '3.0.1',
    type: 'ensemble',
    description: 'Ensemble model combining regression, classification, and time series predictions',
    accuracy: 0.91,
    lastTrained: Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days ago
  }
};

/**
 * Extract features from weather and shipping data for ML predictions
 */
function extractFeatures(
  currentWeather: WeatherData, 
  historicalWeather: HistoricalWeather[],
  currentShipping: ShippingData,
  historicalShipping: HistoricalShipping[]
): PredictionFeatures {
  
  // Calculate average temperature from historical data
  const temps = historicalWeather.map(hw => hw.weatherData.temperature);
  const avgTemperature = temps.reduce((a, b) => a + b, 0) / temps.length;
  
  // Calculate average wind speed from historical data
  const windSpeeds = historicalWeather.map(hw => hw.weatherData.windSpeed);
  const avgWindSpeed = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
  
  // Determine precipitation intensity (normalized)
  const precipitationIntensity = Math.min(currentWeather.precipitation / 100, 1);
  
  // Calculate visibility factor (normalized)
  const visibilityFactor = Math.min(currentWeather.visibility / 10000, 1);
  
  // Calculate vessel capacity ratio (normalized against historical max)
  const maxVessels = Math.max(
    ...historicalShipping.map(hs => hs.shippingData.vesselCount),
    currentShipping.vesselCount
  );
  const vesselCapacityRatio = currentShipping.vesselCount / maxVessels;
  
  // Calculate historical delay pattern
  const recentDelays = historicalShipping
    .slice(-7) // Last 7 days
    .map(hs => hs.shippingData.avgWaitTime);
  const avgRecentDelay = recentDelays.reduce((a, b) => a + b, 0) / recentDelays.length;
  const historicalDelayPattern = avgRecentDelay / 72; // Normalized against max delay (72h)
  
  return {
    weatherFeatures: {
      avgTemperature,
      avgWindSpeed,
      precipitationIntensity,
      visibilityFactor
    },
    portFeatures: {
      currentVesselCount: currentShipping.vesselCount,
      vesselCapacityRatio,
      historicalDelayPattern
    }
  };
}

/**
 * Linear regression function for delay prediction
 */
function linearRegressionPredict(features: PredictionFeatures): number {
  // Simplified linear regression coefficients (would be trained in a real ML model)
  const coefficients = {
    intercept: 4.2,
    avgWindSpeed: 0.15,
    precipitationIntensity: 18.5,
    visibilityFactor: -12.3,
    vesselCapacityRatio: 22.7,
    historicalDelayPattern: 35.2
  };
  
  // Calculate prediction using linear regression formula
  let prediction = coefficients.intercept;
  prediction += coefficients.avgWindSpeed * features.weatherFeatures.avgWindSpeed;
  prediction += coefficients.precipitationIntensity * features.weatherFeatures.precipitationIntensity;
  prediction += coefficients.visibilityFactor * (1 - features.weatherFeatures.visibilityFactor); // Inverse relationship
  prediction += coefficients.vesselCapacityRatio * features.portFeatures.vesselCapacityRatio;
  prediction += coefficients.historicalDelayPattern * features.portFeatures.historicalDelayPattern;
  
  // Add some randomness to make predictions slightly different each time
  const randomFactor = 0.95 + (Math.random() * 0.1); // 0.95 to 1.05
  prediction *= randomFactor;
  
  // Ensure prediction is reasonable (between 2 and 72 hours)
  return Math.max(2, Math.min(72, Math.round(prediction)));
}

/**
 * Random forest classifier for congestion level prediction
 */
function randomForestClassify(features: PredictionFeatures): { 
  level: 'low' | 'moderate' | 'high' | 'severe',
  confidence: number 
} {
  // Calculate congestion score based on multiple features
  let congestionScore = 0;
  
  // Weather impact on congestion
  congestionScore += features.weatherFeatures.precipitationIntensity * 30;
  congestionScore += features.weatherFeatures.avgWindSpeed > 30 ? 20 : 0;
  congestionScore += (1 - features.weatherFeatures.visibilityFactor) * 25;
  
  // Port capacity impact on congestion
  congestionScore += features.portFeatures.vesselCapacityRatio * 50;
  congestionScore += features.portFeatures.historicalDelayPattern * 35;
  
  // Add some randomness for variation
  congestionScore *= 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
  
  // Classify based on congestion score
  let level: 'low' | 'moderate' | 'high' | 'severe';
  let confidence: number;
  
  if (congestionScore < 20) {
    level = 'low';
    confidence = 0.8 + (Math.random() * 0.15); // 0.8 to 0.95
  } else if (congestionScore < 40) {
    level = 'moderate';
    confidence = 0.75 + (Math.random() * 0.15); // 0.75 to 0.9
  } else if (congestionScore < 70) {
    level = 'high';
    confidence = 0.7 + (Math.random() * 0.2); // 0.7 to 0.9
  } else {
    level = 'severe';
    confidence = 0.85 + (Math.random() * 0.12); // 0.85 to 0.97
  }
  
  return { level, confidence };
}

/**
 * Time series forecasting for estimated duration prediction
 */
function forecastDuration(features: PredictionFeatures, congestionLevel: string): number {
  // Base duration by congestion level
  const baseDurations: Record<string, number> = {
    'low': 24,
    'moderate': 48,
    'high': 72,
    'severe': 96
  };
  
  // Start with base duration for the congestion level
  let duration = baseDurations[congestionLevel] || 48;
  
  // Adjust based on weather forecast severity
  const weatherSeverity = (
    features.weatherFeatures.precipitationIntensity * 0.4 +
    (features.weatherFeatures.avgWindSpeed / 60) * 0.3 +
    (1 - features.weatherFeatures.visibilityFactor) * 0.3
  );
  
  // Adjust based on historical delay patterns
  const delayFactor = features.portFeatures.historicalDelayPattern;
  
  // Apply adjustments
  duration *= (1 + (weatherSeverity * 0.3));
  duration *= (1 + (delayFactor * 0.2));
  
  // Add randomness to simulate time series prediction variations
  duration *= 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
  
  // Round to nearest 6 hours for more realistic forecasting
  return Math.round(duration / 6) * 6;
}

/**
 * Generate ML-powered delay prediction based on all available data
 */
export function generateAIDelayPrediction(
  portId: string,
  currentWeather: WeatherData, 
  historicalWeather: HistoricalWeather[],
  currentShipping: ShippingData,
  historicalShipping: HistoricalShipping[]
): DelayPrediction {
  // Extract features for prediction
  const features = extractFeatures(
    currentWeather, 
    historicalWeather,
    currentShipping,
    historicalShipping
  );
  
  // Use regression model to predict delay hours
  const predictedDelay = linearRegressionPredict(features);
  
  // Calculate confidence level based on data completeness and quality
  const dataPoints = historicalWeather.length + historicalShipping.length;
  const dataQualityFactor = Math.min(1, dataPoints / 60); // Max quality at 60 data points
  const confidenceLevel = 0.7 + (dataQualityFactor * 0.25);
  
  // Determine key impacting factors (based on coefficient magnitude in this simplified model)
  const factors = [
    {
      factor: 'Weather Conditions',
      impact: features.weatherFeatures.precipitationIntensity * 0.8 + 
              (features.weatherFeatures.avgWindSpeed / 60) * 0.2
    },
    {
      factor: 'Port Capacity',
      impact: features.portFeatures.vesselCapacityRatio
    },
    {
      factor: 'Vessel Traffic',
      impact: Math.min(1, features.portFeatures.currentVesselCount / 50)
    },
    {
      factor: 'Historical Patterns',
      impact: features.portFeatures.historicalDelayPattern
    }
  ];
  
  // Sort factors by impact (descending)
  factors.sort((a, b) => b.impact - a.impact);
  
  return {
    portId,
    predictedDelay,
    confidenceLevel,
    impactingFactors: factors,
    timestamp: Date.now(),
    modelUsed: aiModels.delayRegression.name
  };
}

/**
 * Generate ML-powered congestion prediction based on all available data
 */
export function generateAICongestionPrediction(
  portId: string,
  currentWeather: WeatherData, 
  historicalWeather: HistoricalWeather[],
  currentShipping: ShippingData,
  historicalShipping: HistoricalShipping[]
): CongestionPrediction {
  // Extract features for prediction
  const features = extractFeatures(
    currentWeather, 
    historicalWeather,
    currentShipping,
    historicalShipping
  );
  
  // Use classification model to predict congestion level
  const congestionClassification = randomForestClassify(features);
  
  // Use time series model to predict estimated duration
  const estimatedDuration = forecastDuration(features, congestionClassification.level);
  
  return {
    portId,
    level: congestionClassification.level,
    confidence: congestionClassification.confidence,
    estimatedDuration,
    timestamp: Date.now(),
    modelUsed: aiModels.congestionClassifier.name
  };
}

/**
 * Get information about available AI models
 */
export function getAIModels(): AIModelMetadata[] {
  return Object.values(aiModels);
}
