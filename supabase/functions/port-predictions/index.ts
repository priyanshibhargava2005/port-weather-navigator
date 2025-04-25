
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
    const { portId, historicalDays = 30 } = await req.json();
    
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

    // Simple ARIMA-like forecasting (simplified for demo)
    const predictCongestion = (data: any[]) => {
      const recentCongestion = data.slice(-5);
      const congestionLevels = ['low', 'moderate', 'high', 'severe'];
      
      // Calculate weighted average of recent congestion
      let severitySum = 0;
      recentCongestion.forEach((record, index) => {
        const weight = (index + 1) / recentCongestion.length;
        severitySum += congestionLevels.indexOf(record.congestion_level) * weight;
      });
      
      const avgSeverity = severitySum / recentCongestion.length;
      const predictedLevel = congestionLevels[Math.round(avgSeverity)];
      
      return {
        level: predictedLevel,
        confidence: 0.7 + (Math.random() * 0.2), // Simulated confidence
        estimated_duration: Math.round((24 + Math.random() * 48)) // 24-72 hours
      };
    };

    // Simple regression for delay prediction
    const predictDelay = (weatherData: any[], shippingData: any[]) => {
      // Simplified delay prediction based on weather severity and congestion
      const weatherSeverity = weatherData.reduce((acc, record) => {
        return acc + (
          record.wind_speed * 0.3 +
          record.precipitation * 0.4 +
          (1000 - record.visibility) * 0.3
        ) / 1000;
      }, 0) / weatherData.length;

      const congestionSeverity = shippingData.reduce((acc, record) => {
        const levels = { low: 0.25, moderate: 0.5, high: 0.75, severe: 1 };
        return acc + levels[record.congestion_level as keyof typeof levels];
      }, 0) / shippingData.length;

      const predictedDelay = Math.round((weatherSeverity + congestionSeverity) * 36); // Max 72 hours

      return {
        predicted_delay: predictedDelay,
        confidence_level: 0.65 + (Math.random() * 0.25),
        impacting_factors: [
          {
            factor: 'Weather Conditions',
            impact: weatherSeverity
          },
          {
            factor: 'Port Congestion',
            impact: congestionSeverity
          }
        ]
      };
    };

    // Generate predictions
    const congestionPrediction = predictCongestion(shippingData);
    const delayPrediction = predictDelay(weatherData, shippingData);

    // Store predictions in database
    const [congestionResult, delayResult] = await Promise.all([
      supabase.from('congestion_predictions').insert({
        port_id: portId,
        level: congestionPrediction.level,
        confidence: congestionPrediction.confidence,
        estimated_duration: congestionPrediction.estimated_duration,
        model_used: 'ARIMA-Simplified',
        timestamp: new Date().toISOString()
      }),

      supabase.from('delay_predictions').insert({
        port_id: portId,
        predicted_delay: delayPrediction.predicted_delay,
        confidence_level: delayPrediction.confidence_level,
        model_used: 'MultiVariate-Regression-Simplified',
        timestamp: new Date().toISOString()
      }).select('id')
    ]);

    // Store delay prediction factors
    if (delayResult.data?.[0]?.id) {
      await supabase.from('delay_prediction_factors').insert(
        delayPrediction.impacting_factors.map(factor => ({
          prediction_id: delayResult.data[0].id,
          factor: factor.factor,
          impact: factor.impact
        }))
      );
    }

    // Return predictions
    return new Response(JSON.stringify({
      congestion: congestionPrediction,
      delay: delayPrediction
    }), {
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
