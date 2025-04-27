import { useShippingData } from "@/hooks/useShippingData";
import { Ship, ArrowUp, ArrowDown, Clock, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface CongestionAnalyticsProps {
  portId: string | null;
}

const CongestionAnalytics = ({ portId }: CongestionAnalyticsProps) => {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const { currentShipping, congestionPrediction, loading, error, refreshData } =
    useShippingData(portId, selectedModel);

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await api.getAvailableModels();
        setAvailableModels(models);
        if (models.length > 0 && !selectedModel) {
          setSelectedModel(models[0]);
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
      }
    };

    fetchModels();
  }, []);

  // Refresh data when model changes
  useEffect(() => {
    if (selectedModel && portId) {
      refreshData();
    }
  }, [selectedModel, portId, refreshData]);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-700">
            Congestion Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-500";
      case "moderate":
        return "text-yellow-500";
      case "high":
        return "text-orange-500";
      case "severe":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getCongestionSeverity = (level: string): number => {
    switch (level) {
      case "low":
        return 1;
      case "moderate":
        return 2;
      case "high":
        return 3;
      case "severe":
        return 4;
      default:
        return 0;
    }
  };

  const getCongestionProgress = (level: string): number => {
    switch (level) {
      case "low":
        return 25;
      case "moderate":
        return 50;
      case "high":
        return 75;
      case "severe":
        return 100;
      default:
        return 0;
    }
  };

  const getProgressClass = (level: string): string => {
    switch (level) {
      case "low":
        return "bg-green-500";
      case "moderate":
        return "bg-yellow-500";
      case "high":
        return "bg-orange-500";
      case "severe":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-maritime-700 flex items-center">
              <Ship className="mr-2 h-5 w-5 text-maritime-600" />
              <span>Port Congestion</span>
            </CardTitle>
            {congestionPrediction?.modelUsed && (
              <CardDescription className="flex items-center text-xs">
                <Brain className="mr-1 h-3 w-3" />
                AI Model: {congestionPrediction.modelUsed}
              </CardDescription>
            )}
          </div>

          {availableModels.length > 0 && (
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
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
          <>
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">
                    Current Congestion
                  </p>
                  <p
                      className={`font-bold capitalize ${currentShipping
                        ? getCongestionColor(currentShipping.congestionLevel)
                        : "text-gray-400"
                        }`}
                  >
                    {currentShipping?.congestionLevel || "Unknown"}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">Predicted Level</p>
                  <p
                    className={`font-bold capitalize ${getCongestionColor(
                      congestionPrediction?.level || ""
                    )}`}
                  >
                    {congestionPrediction?.level || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-700">
                    Predicted for next{" "}
                    {congestionPrediction?.estimatedDuration || "--"} hours
                  </p>
                </div>

                <div className="flex items-center">
                  {congestionPrediction &&
                    currentShipping &&
                    (congestionPrediction.level ===
                      currentShipping.congestionLevel ? (
                      <span className="text-gray-500 text-sm flex items-center">
                        Stable
                      </span>
                    ) : getCongestionSeverity(congestionPrediction.level) >
                      getCongestionSeverity(currentShipping.congestionLevel) ? (
                      <span className="text-red-500 text-sm flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Worsening
                      </span>
                    ) : (
                      <span className="text-green-500 text-sm flex items-center">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        Improving
                      </span>
                    ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Severe</span>
                </div>
                <Progress
                  value={
                    congestionPrediction
                      ? getCongestionProgress(congestionPrediction.level)
                      : 0
                  }
                    className={`h-2 ${congestionPrediction
                      ? getProgressClass(congestionPrediction.level)
                      : "bg-gray-300"
                    }`}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Current Vessels</span>
                  <span className="font-bold">
                    {currentShipping?.vesselCount || "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Current Wait Time</span>
                  <span className="font-bold">
                    {currentShipping?.avgWaitTime || "--"} hours
                  </span>
                </div>

              </div>

              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Updated {new Date().toLocaleTimeString()}
                </span>
                {congestionPrediction && currentShipping && (
                  <span
                      className={`text-xs font-medium ${getCongestionSeverity(congestionPrediction.level) >
                        getCongestionSeverity(currentShipping.congestionLevel)
                        ? "text-red-500"
                        : "text-green-500"
                        }`}
                  >
                    {getCongestionSeverity(congestionPrediction.level) >
                        getCongestionSeverity(currentShipping.congestionLevel)
                        ? `+${getCongestionSeverity(congestionPrediction.level) -
                        getCongestionSeverity(currentShipping.congestionLevel)
                        } severity`
                      : getCongestionSeverity(congestionPrediction.level) <
                        getCongestionSeverity(currentShipping.congestionLevel)
                          ? `-${getCongestionSeverity(
                            currentShipping.congestionLevel
                          ) - getCongestionSeverity(congestionPrediction.level)
                        } severity`
                          : "No change expected"}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CongestionAnalytics;
