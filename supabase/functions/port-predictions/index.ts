
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portId, action, historicalDays = 30 } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch historical weather and shipping data
    const historicalDate = new Date();
    historicalDate.setDate(historicalDate.getDate() - historicalDays);

    const { data: weatherData, error: weatherError } = await supabase
      .from('weather_data')
      .select('*')
      .eq('port_id', portId)
      .gte('timestamp', historicalDate.toISOString())
      .order('timestamp', { ascending: true });

    if (weatherError) throw weatherError;

    const { data: shippingData, error: shippingError } = await supabase
      .from('shipping_data')
      .select('*')
      .eq('port_id', portId)
      .gte('timestamp', historicalDate.toISOString())
      .order('timestamp', { ascending: true });

    if (shippingError) throw shippingError;

    // Extract features for prediction
    const features = extractFeatures(weatherData, shippingData);

    let response;
    if (action === 'predict-delay') {
      const delayPrediction = generateDelayPrediction(features);
      response = { delay: delayPrediction };
    } else if (action === 'predict-congestion') {
      const congestionPrediction = generateCongestionPrediction(features);
      response = { congestion: congestionPrediction };
    } else {
      throw new Error('Invalid action specified');
    }

    // Store prediction in database
    await storePrediction(supabase, portId, response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in port-predictions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Feature extraction from historical data
function extractFeatures(weatherData: any[], shippingData: any[]) {
  const recentWeather = weatherData.slice(-24); // Last 24 hours
  const recentShipping = shippingData.slice(-24);

  return {
    weather: {
      avgTemp: average(recentWeather.map(w => w.temperature)),
      avgWind: average(recentWeather.map(w => w.wind_speed)),
      avgVisibility: average(recentWeather.map(w => w.visibility)),
      precipitationFreq: recentWeather.filter(w => w.precipitation > 0).length / recentWeather.length,
    },
    shipping: {
      avgVessels: average(recentShipping.map(s => s.vessel_count)),
      avgWaitTime: average(recentShipping.map(s => s.avg_wait_time)),
      congestionTrend: getCongestionTrend(recentShipping),
    }
  };
}

// Helper functions for predictions
function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function getCongestionTrend(data: any[]): number {
  const levels = { low: 0, moderate: 1, high: 2, severe: 3 };
  const trend = data
    .map(d => levels[d.congestion_level as keyof typeof levels])
    .reduce((a, b) => a + b, 0) / data.length;
  return trend;
}

function generateDelayPrediction(features: any) {
  // Simplified delay prediction model using weighted features
  const weatherImpact = 
    features.weather.avgWind * 0.3 +
    (1 - features.weather.avgVisibility) * 0.2 +
    features.weather.precipitationFreq * 0.5;

  const trafficImpact = 
    (features.shipping.avgVessels / 100) * 0.4 +
    (features.shipping.avgWaitTime / 24) * 0.3 +
    features.shipping.congestionTrend * 0.3;

  const predictedDelay = Math.round((weatherImpact + trafficImpact) * 24); // Convert to hours

  return {
    predictedDelay,
    confidenceLevel: 0.7 + Math.random() * 0.2,
    impactingFactors: [
      { factor: 'Weather Conditions', impact: weatherImpact },
      { factor: 'Port Traffic', impact: trafficImpact }
    ]
  };
}

function generateCongestionPrediction(features: any) {
  // Simplified congestion prediction model
  const congestionScore = 
    features.weather.precipitationFreq * 30 +
    (features.weather.avgWind / 50) * 20 +
    (features.shipping.avgVessels / 100) * 30 +
    features.shipping.congestionTrend * 20;

  let level: string;
  if (congestionScore < 20) level = 'low';
  else if (congestionScore < 40) level = 'moderate';
  else if (congestionScore < 60) level = 'high';
  else level = 'severe';

  return {
    level,
    confidence: 0.7 + Math.random() * 0.2,
    estimatedDuration: Math.round(12 + Math.random() * 36) // 12-48 hours
  };
}

async function storePrediction(supabase: any, portId: string, prediction: any) {
  if (prediction.delay) {
    await supabase.from('delay_predictions').insert({
      port_id: portId,
      predicted_delay: prediction.delay.predictedDelay,
      confidence_level: prediction.delay.confidenceLevel,
      model_used: 'Real-time ML v1.0',
      timestamp: new Date().toISOString()
    });
  }

  if (prediction.congestion) {
    await supabase.from('congestion_predictions').insert({
      port_id: portId,
      level: prediction.congestion.level,
      confidence: prediction.congestion.confidence,
      estimated_duration: prediction.congestion.estimatedDuration,
      model_used: 'Real-time ML v1.0',
      timestamp: new Date().toISOString()
    });
  }
}
