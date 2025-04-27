import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import PortSelector from '@/components/PortSelector';
import TimeSeriesForecast from "@/components/TimeSeriesForecast";
import { api } from '@/lib/api';
import { Port, DelayPrediction, CongestionPrediction } from "@/lib/types";
import {
  Ship,
  Clock,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Map as MapIcon,
  RefreshCcw,
  Brain,
  Database,
  Loader2,
  Waves,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Predictions = () => {
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null);
  const [ports, setPorts] = useState<Port[]>([]);
  const [delayPredictions, setDelayPredictions] = useState<Record<string, DelayPrediction>>({});
  const [congestionPredictions, setCongestionPredictions] = useState<Record<string, CongestionPrediction>>({});
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [selectedTab, setSelectedTab] = useState<"current" | "timeseries">(
    "current"
  );
  const navigate = useNavigate();

  // Fetch ports and models on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [portsData, models] = await Promise.all([
          api.getPorts(),
          api.getAvailableModels(),
        ]);

        setPorts(portsData);
        setAvailableModels(models);

        if (models.length > 0) {
          setSelectedModel(models[0]);
        }

        if (portsData.length > 0 && !selectedPortId) {
          setSelectedPortId(portsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // When selected port changes, fetch predictions
  useEffect(() => {
    if (!selectedPortId) return;

    const fetchPortData = async () => {
      setLoading(true);
      try {
        // Find the selected port object
        const port = ports.find((p) => p.id === selectedPortId) || null;
        setSelectedPort(port);

        // Get delay prediction
        const delayPrediction = await api.getDelayPrediction(
          selectedPortId,
          selectedModel
        );
        setDelayPredictions((prev) => ({
          ...prev,
          [selectedPortId]: delayPrediction,
        }));

        // Get congestion prediction
        const congestionPrediction = await api.getCongestionPrediction(
          selectedPortId,
          selectedModel
        );
        setCongestionPredictions((prev) => ({
          ...prev,
          [selectedPortId]: congestionPrediction,
        }));
      } catch (error) {
        console.error("Error fetching port data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortData();
  }, [selectedPortId, ports, selectedModel]);

  const handleRefreshPredictions = async () => {
    if (!selectedPortId) return;

    setLoading(true);
    try {
      // Re-fetch predictions
      const [delayPrediction, congestionPrediction] = await Promise.all([
        api.getDelayPrediction(selectedPortId, selectedModel),
        api.getCongestionPrediction(selectedPortId, selectedModel),
      ]);

      setDelayPredictions((prev) => ({
        ...prev,
        [selectedPortId]: delayPrediction,
      }));

      setCongestionPredictions((prev) => ({
        ...prev,
        [selectedPortId]: congestionPrediction,
      }));
    } catch (error) {
      console.error("Error refreshing predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIPrediction = async () => {
    if (!selectedPortId) return;

    setGeneratingAI(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI processing
      handleRefreshPredictions();
    } catch (error) {
      console.error("Error generating AI prediction:", error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-maritime-800">
              Weather Predictions
            </h1>
            <p className="text-gray-500">Forecast delays and port congestion</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <PortSelector
              selectedPortId={selectedPortId}
              onSelectPort={setSelectedPortId}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Model
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Select Prediction Model</h4>
                  <p className="text-sm text-gray-500">
                    Choose which ML model to use for predictions
                  </p>
                  <Select
                    value={selectedModel}
                    onValueChange={handleModelChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPredictions}
              disabled={loading || !selectedPortId}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {!selectedPortId ? (
          <div className="text-center py-20">
            <Ship className="h-16 w-16 mx-auto text-maritime-300 mb-4" />
            <h2 className="text-xl font-medium text-maritime-700">
              Select a port to view predictions
            </h2>
            <p className="text-gray-500 mt-2">
              Choose a port from the dropdown above to explore weather impact
              predictions
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex space-x-2 border-b pb-4">
                    <Button
                      variant={selectedTab === "current" ? "default" : "ghost"}
                      onClick={() => setSelectedTab("current")}
                      className="flex items-center"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Current Predictions
                    </Button>
                    <Button
                      variant={
                        selectedTab === "timeseries" ? "default" : "ghost"
                      }
                      onClick={() => setSelectedTab("timeseries")}
                      className="flex items-center"
                    >
                      <Waves className="mr-2 h-4 w-4" />
                      Time Series Forecast
                    </Button>
                  </div>

                  {selectedTab === "current" ? (
                    <div className="py-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center">
                          <Ship className="mr-2 h-5 w-5 text-maritime-700" />
                          {selectedPort?.name || "Port"} Weather Impact
                          Predictions
                        </h2>

                        <Button
                          variant="secondary"
                          className="flex items-center"
                          onClick={handleGenerateAIPrediction}
                          disabled={generatingAI}
                        >
                          {generatingAI ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Brain className="mr-2 h-4 w-4" />
                              Generate AI Prediction
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-maritime-700 flex items-center">
                              <Clock className="mr-2 h-5 w-5 text-maritime-600" />
                              <span>Delay Prediction</span>
                            </CardTitle>
                            {delayPredictions[selectedPortId]?.modelUsed && (
                              <CardDescription className="text-xs">
                                Model:{" "}
                                {delayPredictions[selectedPortId].modelUsed}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            {loading ? (
                              <div className="space-y-3">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-20 w-full" />
                              </div>
                            ) : (
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <div>
                                    <h3 className="text-2xl font-bold">
                                      {delayPredictions[selectedPortId]
                                        ?.predictedDelay || "--"}{" "}
                                      <span className="text-sm font-normal text-gray-500">
                                        hours
                                      </span>
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Expected Weather Delay
                                    </p>
                                  </div>

                                  <div className="bg-maritime-50 p-2 rounded-full">
                                    {/* Icon based on severity */}
                                    {delayPredictions[selectedPortId]
                                      ?.predictedDelay > 24 ? (
                                      <AlertTriangle className="h-8 w-8 text-red-500" />
                                    ) : delayPredictions[selectedPortId]
                                        ?.predictedDelay > 12 ? (
                                      <AlertTriangle className="h-8 w-8 text-orange-500" />
                                    ) : delayPredictions[selectedPortId]
                                        ?.predictedDelay > 6 ? (
                                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                                    ) : (
                                      <Clock className="h-8 w-8 text-green-500" />
                                    )}
                                  </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                  <h4 className="text-sm font-medium">
                                    Impacting Factors
                                  </h4>

                                  {delayPredictions[
                                    selectedPortId
                                  ]?.impactingFactors.map((factor, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center text-sm"
                                    >
                                      <span>{factor.factor}</span>
                                      <span className="font-medium">
                                        {Math.round(factor.impact * 100)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-6">
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                      <span className="font-medium">
                                        Recommendation:
                                      </span>{" "}
                                      Plan for approximately{" "}
                                      {Math.ceil(
                                        delayPredictions[selectedPortId]
                                          ?.predictedDelay || 0
                                      )}{" "}
                                      hours of weather-related delay at this
                                      port.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-maritime-700 flex items-center">
                              <Ship className="mr-2 h-5 w-5 text-maritime-600" />
                              <span>Congestion Prediction</span>
                            </CardTitle>
                            {congestionPredictions[selectedPortId]
                              ?.modelUsed && (
                              <CardDescription className="text-xs">
                                Model:{" "}
                                {
                                  congestionPredictions[selectedPortId]
                                    .modelUsed
                                }
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            {loading ? (
                              <div className="space-y-3">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-24 w-full" />
                              </div>
                            ) : (
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <div>
                                    <h3 className="text-2xl font-bold capitalize">
                                      {congestionPredictions[selectedPortId]
                                        ?.level || "Unknown"}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Expected Port Congestion Level
                                    </p>
                                  </div>

                                  <div className="bg-maritime-50 p-2 rounded-full">
                                    {/* Icon based on congestion level */}
                                    {congestionPredictions[selectedPortId]
                                      ?.level === "severe" ? (
                                      <AlertTriangle className="h-8 w-8 text-red-500" />
                                    ) : congestionPredictions[selectedPortId]
                                        ?.level === "high" ? (
                                      <AlertTriangle className="h-8 w-8 text-orange-500" />
                                    ) : congestionPredictions[selectedPortId]
                                        ?.level === "moderate" ? (
                                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                                    ) : (
                                      <Ship className="h-8 w-8 text-green-500" />
                                    )}
                                  </div>
                                </div>

                                <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">
                                      Expected Duration
                                    </span>
                                    <span className="font-medium">
                                      {congestionPredictions[selectedPortId]
                                        ?.estimatedDuration || "--"}{" "}
                                      hours
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-sm">Confidence</span>
                                    <span className="font-medium">
                                      {congestionPredictions[selectedPortId]
                                        ? Math.round(
                                            congestionPredictions[
                                              selectedPortId
                                            ].confidence * 100
                                          )
                                        : "--"}
                                      %
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-6">
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                      <span className="font-medium">
                                        Recommendation:
                                      </span>{" "}
                                      {congestionPredictions[selectedPortId]
                                        ?.level === "severe" ||
                                      congestionPredictions[selectedPortId]
                                        ?.level === "high"
                                        ? "Consider rerouting or adjusting schedule if possible."
                                        : "Proceed with scheduled operations with minor adjustments."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-6 text-xs text-gray-500 flex justify-between">
                        <span>Data updated: {new Date().toLocaleString()}</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-maritime-600 p-0 h-auto"
                          onClick={() => navigate("/analytics")}
                        >
                          View detailed analytics
                          <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <TimeSeriesForecast portId={selectedPortId} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Predictions;
