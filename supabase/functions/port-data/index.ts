
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWeatherData(latitude: number, longitude: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,visibility&current_weather=true`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  const data = await response.json();
  return data;
}

async function generateSamplePorts() {
  const samplePorts = [
    {
      name: 'Port of Rotterdam',
      code: 'NLRTM',
      country: 'Netherlands',
      latitude: 51.9225,
      longitude: 4.47917,
      size: 'large'
    },
    {
      name: 'Port of Singapore',
      code: 'SGSIN',
      country: 'Singapore',
      latitude: 1.29027,
      longitude: 103.851,
      size: 'large'
    },
    {
      name: 'Port of Los Angeles',
      code: 'USLAX',
      country: 'United States',
      latitude: 33.7395,
      longitude: -118.2593,
      size: 'large'
    }
  ];

  return samplePorts;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action } = await req.json();

    if (action === 'generate-ports') {
      const ports = await generateSamplePorts();
      
      for (const port of ports) {
        const { error: portError } = await supabaseClient
          .from('ports')
          .insert(port);
          
        if (portError) throw portError;
      }

      return new Response(JSON.stringify({ message: 'Sample ports generated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update-weather') {
      const { data: ports, error: portsError } = await supabaseClient
        .from('ports')
        .select('*');

      if (portsError) throw portsError;

      for (const port of ports) {
        const weatherData = await fetchWeatherData(port.latitude, port.longitude);
        const current = weatherData.current_weather;
        const hourly = weatherData.hourly;
        const currentIndex = hourly.time.findIndex((t: string) => 
          t.startsWith(current.time.split('T')[0])
        );

        const weatherEntry = {
          port_id: port.id,
          temperature: current.temperature,
          wind_speed: current.wind_speed,
          wind_direction: current.wind_direction,
          humidity: hourly.relative_humidity_2m[currentIndex],
          visibility: hourly.visibility[currentIndex],
          precipitation: hourly.precipitation[currentIndex],
          weather_type: current.temperature > 20 ? 'clear' : 'cloudy', // Simplified weather type logic
          timestamp: current.time
        };

        const { error: weatherError } = await supabaseClient
          .from('weather_data')
          .insert(weatherEntry);

        if (weatherError) throw weatherError;
      }

      return new Response(JSON.stringify({ message: 'Weather data updated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
