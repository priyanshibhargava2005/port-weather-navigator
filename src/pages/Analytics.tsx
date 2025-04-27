import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import PortSelector from "@/components/PortSelector";
import { useWeatherData } from "@/hooks/useWeatherData";
import { useShippingData } from "@/hooks/useShippingData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CloudRain, Wind, Ship, AlertTriangle } from "lucide-react";

const Analytics = () => {
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null);
  const { historicalWeather } = useWeatherData(selectedPortId);
  const {
    currentShipping,
    delayPrediction,
    congestionPrediction,
    loading,
    error,
  } = useShippingData(selectedPortId);

  // Mock historical shipping data and alerts for now since they're not provided by the hook
  const historicalShipping = useMemo(() => {
    return Array(10)
      .fill(0)
      .map((_, index) => ({
        date: new Date(
          Date.now() - (9 - index) * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        shippingData: {
          vesselCount: Math.floor(Math.random() * 50) + 20,
          avgWaitTime: Math.floor(Math.random() * 30) + 10,
          delayedVessels: Math.floor(Math.random() * 15) + 5,
          congestionLevel: ["low", "moderate", "high", "severe"][
            Math.floor(Math.random() * 4)
          ],
        },
      }));
  }, []);

  const alerts = useMemo(() => {
    return Array(5)
      .fill(0)
      .map((_, index) => ({
        id: `alert-${index}`,
        type: "weather",
        severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        message: [
          "Strong winds predicted",
          "Heavy rainfall expected",
          "Poor visibility conditions",
          "High waves alert",
          "Storm warning in effect",
        ][Math.floor(Math.random() * 5)],
        startTime: new Date(
          Date.now() - Math.floor(Math.random() * 48) * 60 * 60 * 1000
        ).toISOString(),
      }));
  }, []);

  // Prepare data for weather chart
  const weatherChartData = historicalWeather.map((item) => ({
    date: item.date,
    temperature: item.weatherData.temperature,
    precipitation: item.weatherData.precipitation,
    windSpeed: item.weatherData.windSpeed,
  }));

  // Prepare data for shipping chart
  const shippingChartData = historicalShipping.map((item) => ({
    date: item.date,
    vessels: item.shippingData.vesselCount,
    waitTime: item.shippingData.avgWaitTime,
    delayed: item.shippingData.delayedVessels,
  }));

  // Calculate impact correlation data
  const correlationData = historicalWeather
    .map((weatherItem, index) => {
      if (index < historicalShipping.length) {
        const shippingItem = historicalShipping[index];
        return {
          date: weatherItem.date,
          weatherSeverity: calculateWeatherSeverity(weatherItem.weatherData),
          congestionLevel: calculateCongestionLevel(shippingItem.shippingData),
          delayHours: shippingItem.shippingData.avgWaitTime,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Prepare data for impact analysis
  const impactData = [
    { name: "Storm Impact", value: 35 },
    { name: "Fog Impact", value: 25 },
    { name: "High Winds", value: 20 },
    { name: "Heavy Rain", value: 15 },
    { name: "Other Factors", value: 5 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-maritime-800">
              Port Weather Analytics
            </h1>
            <p className="text-gray-500">
              Analyze historical weather patterns and shipping impacts
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <PortSelector
              selectedPortId={selectedPortId}
              onSelectPort={setSelectedPortId}
            />
          </div>
        </div>

        {!selectedPortId ? (
          <div className="text-center py-20">
            <Ship className="h-16 w-16 mx-auto text-maritime-300 mb-4" />
            <h2 className="text-xl font-medium text-maritime-700">
              Select a port to view analytics
            </h2>
            <p className="text-gray-500 mt-2">
              Choose a port from the dropdown above to explore detailed
              analytics
            </p>
          </div>
        ) : (
          <Tabs defaultValue="weather" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="weather" className="flex items-center">
                <CloudRain className="h-4 w-4 mr-2" />
                Weather Analytics
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center">
                <Ship className="h-4 w-4 mr-2" />
                Shipping Analytics
              </TabsTrigger>
              <TabsTrigger value="impact" className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Impact Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weather" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Weather Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={weatherChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="temperature"
                          stroke="#0ea5e9"
                          name="Temperature (°C)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="precipitation"
                          stroke="#8884d8"
                          name="Precipitation (mm)"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="windSpeed"
                          stroke="#82ca9d"
                          name="Wind Speed (km/h)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wind className="h-5 w-5 mr-2 text-maritime-600" />
                      Wind Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={weatherChartData.slice(-10)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="windSpeed"
                            name="Wind Speed (km/h)"
                            fill="#0ea5e9"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CloudRain className="h-5 w-5 mr-2 text-maritime-600" />
                      Precipitation Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={weatherChartData.slice(-10)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="precipitation"
                            name="Precipitation (mm)"
                            fill="#8884d8"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vessel Traffic and Wait Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={shippingChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="vessels"
                          stroke="#0ea5e9"
                          name="Vessel Count"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="waitTime"
                          stroke="#ff9800"
                          name="Wait Time (hours)"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="delayed"
                          stroke="#f44336"
                          name="Delayed Vessels"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Peak Traffic Times",
                    value: "06:00 - 10:00",
                    subtext: "Highest vessel arrivals",
                    trend: "+15% vs last month",
                  },
                  {
                    title: "Average Processing Time",
                    value: "28.4 hours",
                    subtext: "For all vessels",
                    trend: "-5% vs last month",
                  },
                  {
                    title: "Delay Frequency",
                    value: "18%",
                    subtext: "Of vessels experience delays",
                    trend: "+3% vs last month",
                  },
                ].map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h3 className="font-medium text-gray-500">
                        {metric.title}
                      </h3>
                      <p className="text-2xl font-bold text-maritime-700 mt-2">
                        {metric.value}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {metric.subtext}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          metric.trend.startsWith("+")
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {metric.trend}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="impact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weather Impact on Port Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={correlationData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="weatherSeverity"
                          stroke="#0ea5e9"
                          name="Weather Severity Index"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="delayHours"
                          stroke="#f44336"
                          name="Delay Hours"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="congestionLevel"
                          stroke="#ff9800"
                          name="Congestion Level"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weather Disruption Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={impactData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {impactData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Weather Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                      {alerts
                        .filter((alert) => alert.type === "weather")
                        .slice(0, 5)
                        .map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-lg border-l-4 ${
                              alert.severity === "high"
                                ? "border-red-500 bg-red-50"
                                : alert.severity === "medium"
                                ? "border-yellow-500 bg-yellow-50"
                                : "border-blue-400 bg-blue-50"
                            }`}
                          >
                            <div className="flex justify-between">
                              <p className="font-medium text-gray-800">
                                {alert.message}
                              </p>
                              <span
                                className={`text-xs rounded-full px-2 py-0.5 ${
                                  alert.severity === "high"
                                    ? "bg-red-100 text-red-800"
                                    : alert.severity === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(alert.startTime).toLocaleString()}
                            </p>
                          </div>
                        ))}

                      {alerts.filter((alert) => alert.type === "weather")
                        .length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          No recent weather alerts
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

// Helper functions
const calculateWeatherSeverity = (weather: any) => {
  // Simple severity calculation based on weather parameters
  let severity = 0;

  // Add points for high winds
  severity += weather.windSpeed / 10;

  // Add points for low visibility
  severity += (10000 - weather.visibility) / 1000;

  // Add points for precipitation
  severity += weather.precipitation / 10;

  // Add points for extreme temperatures
  severity += Math.abs(weather.temperature - 20) / 5;

  // Add points for specific weather types
  if (weather.weatherType === "stormy") severity += 5;
  if (weather.weatherType === "foggy") severity += 3;
  if (weather.weatherType === "rainy") severity += 2;

  return Math.min(Math.max(severity, 0), 10);
};

const calculateCongestionLevel = (shipping: any) => {
  // Convert congestion level to numeric value
  switch (shipping.congestionLevel) {
    case "severe":
      return 10;
    case "high":
      return 7;
    case "moderate":
      return 4;
    case "low":
      return 1;
    default:
      return 0;
  }
};

export default Analytics;
