import { useTimeSeriesForecasting } from '@/hooks/useTimeSeriesForecasting';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarDays, RefreshCcw, Waves, Brain } from 'lucide-react';

interface TimeSeriesForecastProps {
  portId: string | null;
}

const TimeSeriesForecast = ({ portId }: TimeSeriesForecastProps) => {
  const { 
    forecast, 
    loading, 
    error, 
    useSeasonalModel, 
    forecastDays, 
    toggleSeasonalModel, 
    updateForecastDays 
  } = useTimeSeriesForecasting(portId);

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-700">Forecast Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = forecast?.forecastDates.map((date, index) => {
    const dataPoint: Record<string, any> = {
      date,
      forecast: forecast.forecastValues[index]
    };

    // Add confidence intervals if available
    if (forecast.confidenceIntervals) {
      dataPoint.lowerBound = forecast.confidenceIntervals.lowerBound[index];
      dataPoint.upperBound = forecast.confidenceIntervals.upperBound[index];
    }

    return dataPoint;
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-maritime-700 flex items-center">
          <Waves className="mr-2 h-5 w-5 text-maritime-600" />
          <span>Weather Delay Time Series Forecast</span>
        </CardTitle>
        {forecast?.modelUsed && (
          <CardDescription className="flex items-center text-xs">
            <Brain className="mr-1 h-3 w-3" />
            Model: {forecast.modelUsed}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[300px] w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium">{forecastDays}-Day Weather Delay Forecast</h3>
                  <p className="text-sm text-gray-500">
                    Based on historical patterns and ARIMA time series modeling
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center" 
                  onClick={() => {
                    // Fetch new forecast by toggling and toggling back
                    toggleSeasonalModel();
                    setTimeout(() => toggleSeasonalModel(), 100);
                  }}
                >
                  <RefreshCcw className="mr-1 h-3 w-3" />
                  <span>Refresh</span>
                </Button>
              </div>
              
              <div className="h-[300px] mt-4">
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} hours`, 'Delay']} />
                      <Legend />
                      
                      {forecast?.confidenceIntervals && (
                        <Area 
                          type="monotone" 
                          dataKey="upperBound" 
                          stroke="transparent" 
                          fill="#0ea5e9" 
                          fillOpacity={0.1} 
                          activeDot={false} 
                          legendType="none"
                        />
                      )}
                      
                      {forecast?.confidenceIntervals && (
                        <Area 
                          type="monotone" 
                          dataKey="lowerBound" 
                          stroke="transparent" 
                          fill="#0ea5e9" 
                          fillOpacity={0.1} 
                          activeDot={false} 
                          legendType="none"
                        />
                      )}
                      
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        name="Predicted Delay (hours)"
                        activeDot={{ r: 8 }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No forecast data available</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-4 mt-6">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="forecast-days" className="text-sm">Forecast Range</Label>
                  <span className="text-sm font-medium">{forecastDays} days</span>
                </div>
                <Slider
                  id="forecast-days"
                  value={[forecastDays]}
                  min={7}
                  max={30}
                  step={1}
                  onValueChange={(value) => updateForecastDays(value[0])}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Use Seasonal Model</span>
                  <span className="text-xs text-gray-500">SARIMA model with seasonality</span>
                </div>
                <Switch
                  checked={useSeasonalModel}
                  onCheckedChange={toggleSeasonalModel}
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-maritime-50 rounded-lg">
              <h4 className="text-sm font-medium flex items-center">
                <CalendarDays className="mr-1 h-4 w-4 text-maritime-600" />
                <span>Key Insights</span>
              </h4>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Average predicted delay: {chartData && chartData.length > 0 ? 
                  (chartData.reduce((sum, item) => sum + item.forecast, 0) / chartData.length).toFixed(1) : '0'} hours</li>
                <li>• Peak delay: {chartData && chartData.length > 0 ? 
                  Math.max(...chartData.map(item => item.forecast)).toFixed(1) : '0'} hours</li>
                <li>• Projected trend: {chartData && chartData.length > 2 && 
                  chartData[chartData.length - 1].forecast > chartData[0].forecast ? 
                  'Increasing delays expected' : 'Improving conditions expected'}</li>
              </ul>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 flex justify-between">
              <span>Updated: {forecast ? new Date(forecast.timestamp).toLocaleString() : '--'}</span>
              <span>ARIMA Time Series Model</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSeriesForecast;