
import { useWeatherData } from '@/hooks/useWeatherData';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake, Wind, Thermometer, Droplets, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WeatherPanelProps {
  portId: string | null;
}

const WeatherPanel = ({ portId }: WeatherPanelProps) => {
  const { currentWeather, loading, error } = useWeatherData(portId);

  const getWeatherIcon = () => {
    if (!currentWeather) return <Sun className="h-10 w-10 text-yellow-500" />;

    switch (currentWeather.weatherType) {
      case 'clear':
        return <Sun className="h-10 w-10 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-10 w-10 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-10 w-10 text-blue-400" />;
      case 'stormy':
        return <CloudLightning className="h-10 w-10 text-purple-500" />;
      case 'foggy':
        return <CloudFog className="h-10 w-10 text-gray-300" />;
      case 'snowy':
        return <Snowflake className="h-10 w-10 text-blue-200" />;
      default:
        return <Sun className="h-10 w-10 text-yellow-500" />;
    }
  };

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-700">Weather Data Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-maritime-700 flex items-center">
          <span>Current Weather</span>
        </CardTitle>
        <CardDescription>
          {loading ? 'Loading weather data...' : 'Live conditions at port'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getWeatherIcon()}
                <div className="ml-4">
                  <p className="text-lg font-semibold capitalize">
                    {currentWeather?.weatherType || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Updated {new Date(currentWeather?.timestamp || Date.now()).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold text-maritime-800">
                {currentWeather?.temperature || '--'}°C
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-maritime-50 rounded-lg flex items-center">
                <Wind className="h-5 w-5 text-maritime-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Wind</p>
                  <p className="font-medium">
                    {currentWeather?.windSpeed || '--'} km/h
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-maritime-50 rounded-lg flex items-center">
                <Droplets className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="font-medium">
                    {currentWeather?.humidity || '--'}%
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-maritime-50 rounded-lg flex items-center">
                <Eye className="h-5 w-5 text-purple-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Visibility</p>
                  <p className="font-medium">
                    {currentWeather?.visibility ? (currentWeather.visibility / 1000).toFixed(1) : '--'} km
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-maritime-50 rounded-lg flex items-center">
                <CloudRain className="h-5 w-5 text-blue-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Precipitation</p>
                  <p className="font-medium">
                    {currentWeather?.precipitation || '--'} mm
                  </p>
                </div>
              </div>
            </div>

            {currentWeather?.waveHeight !== undefined && (
              <div className="mt-3 p-3 bg-ocean-50 rounded-lg border border-ocean-100">
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    className="h-5 w-5 text-ocean-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Wave Height</p>
                    <p className="font-medium">
                      {currentWeather.waveHeight.toFixed(1)} m
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherPanel;
