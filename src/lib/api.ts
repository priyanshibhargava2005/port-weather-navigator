import { supabase } from "@/integrations/supabase/client";
import { 
  Port, 
  WeatherData, 
  ShippingData, 
  DelayPrediction, 
  CongestionPrediction, 
  Alert
} from './types';

export const api = {
  getPorts: async (): Promise<Port[]> => {
    const { data, error } = await supabase
      .from('ports')
      .select('*');
      
    if (error) throw error;
    return data.map(port => ({
      ...port,
      size: port.size as 'small' | 'medium' | 'large'
    }));
  },
  
  getPortById: async (id: string): Promise<Port | undefined> => {
    const { data, error } = await supabase
      .from('ports')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data ? {
      ...data,
      size: data.size as 'small' | 'medium' | 'large'
    } : undefined;
  },
  
  getCurrentWeather: async (portId: string): Promise<WeatherData> => {
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('port_id', portId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    return {
      portId: data.port_id,
      temperature: data.temperature,
      humidity: data.humidity,
      windSpeed: data.wind_speed,
      windDirection: data.wind_direction,
      precipitation: data.precipitation,
      visibility: data.visibility,
      weatherType: data.weather_type as WeatherData['weatherType'],
      waveHeight: data.wave_height,
      timestamp: new Date(data.timestamp).getTime()
    };
  },
  
  getCurrentShippingData: async (portId: string): Promise<ShippingData> => {
    const { data, error } = await supabase
      .from('shipping_data')
      .select('*')
      .eq('port_id', portId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    return {
      portId: data.port_id,
      vesselCount: data.vessel_count,
      avgWaitTime: data.avg_wait_time,
      delayedVessels: data.delayed_vessels,
      congestionLevel: data.congestion_level as ShippingData['congestionLevel'],
      timestamp: new Date(data.timestamp).getTime()
    };
  },
  
  getHistoricalData: async (portId: string, days: number = 30) => {
    const historicalDate = new Date();
    historicalDate.setDate(historicalDate.getDate() - days);
    
    const [weatherData, shippingData] = await Promise.all([
      supabase
        .from('weather_data')
        .select('*')
        .eq('port_id', portId)
        .gte('timestamp', historicalDate.toISOString())
        .order('timestamp', { ascending: true }),
        
      supabase
        .from('shipping_data')
        .select('*')
        .eq('port_id', portId)
        .gte('timestamp', historicalDate.toISOString())
        .order('timestamp', { ascending: true })
    ]);
    
    if (weatherData.error) throw weatherData.error;
    if (shippingData.error) throw shippingData.error;
    
    return {
      weatherHistory: weatherData.data.map(wd => ({
        date: new Date(wd.timestamp).toISOString().split('T')[0],
        weatherData: wd
      })),
      shippingHistory: shippingData.data.map(sd => ({
        date: new Date(sd.timestamp).toISOString().split('T')[0],
        shippingData: sd
      }))
    };
  },
  
  getDelayPrediction: async (portId: string): Promise<DelayPrediction> => {
    // Call our Edge Function for predictions
    const { data: predictions, error } = await supabase.functions.invoke('port-predictions', {
      body: { portId, action: 'predict-delay' }
    });
    
    if (error) throw error;
    return predictions.delay;
  },
  
  getCongestionPrediction: async (portId: string): Promise<CongestionPrediction> => {
    // Call our Edge Function for predictions
    const { data: predictions, error } = await supabase.functions.invoke('port-predictions', {
      body: { portId, action: 'predict-congestion' }
    });
    
    if (error) throw error;
    return predictions.congestion;
  },
  
  getAlerts: async (portId: string): Promise<Alert[]> => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('port_id', portId)
      .order('start_time', { ascending: false });
      
    if (error) throw error;
    return data.map(alert => ({
      id: alert.id,
      portId: alert.port_id,
      type: alert.type as Alert['type'],
      severity: alert.severity as Alert['severity'],
      message: alert.message,
      startTime: new Date(alert.start_time).getTime(),
      endTime: alert.end_time ? new Date(alert.end_time).getTime() : undefined
    }));
  }
};
