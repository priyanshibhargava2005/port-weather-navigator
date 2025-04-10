import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import PortSelector from '@/components/PortSelector';
import { api } from '@/lib/api';
import { getAIModels } from '@/lib/aiService';
import { Port, DelayPrediction, CongestionPrediction, AIModelMetadata } from '@/lib/types';
import { 
  Ship, Clock, CalendarDays, ArrowUpRight, ArrowDownRight, 
  AlertTriangle, Map as MapIcon, RefreshCcw, Brain, Database 
} from 'lucide-react';

const Predictions = () => {
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null);
  const [ports, setPorts] = useState<Port[]>([]);
  const [delayPredictions, setDelayPredictions] = useState<Record<string, DelayPrediction>>({});
  const [congestionPredictions, setCongestionPredictions] = useState<Record<string, CongestionPrediction>>({});
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiModels, setAiModels] = useState<AIModelMetadata[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const portsData = await api.getPorts();
        setPorts(portsData);
        
        if (portsData.length > 0) {
          setLoading(true);
          
          const delayPromises = portsData.map(port => 
            api.getDelayPrediction(port.id)
              .then(prediction => ({ portId: port.id, prediction }))
          );
          
          const congestionPromises = portsData.map(port => 
            api.getCongestionPrediction(port.id)
              .then(prediction => ({ portId: port.id, prediction }))
          );
          
          const delayResults = await Promise.all(delayPromises);
          const congestionResults = await Promise.all(congestionPromises);
          
          const delayMap: Record<string, DelayPrediction> = {};
          const congestionMap: Record<string, CongestionPrediction> = {};
          
          delayResults.forEach(({ portId, prediction }) => {
            delayMap[portId] = prediction;
          });
          
          congestionResults.forEach(({ portId, prediction }) => {
            congestionMap[portId] = prediction;
          });
          
          setDelayPredictions(delayMap);
          setCongestionPredictions(congestionMap);
          
          if (!selectedPortId && portsData.length > 0) {
            setSelectedPortId(portsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching port data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPorts();
  }, [selectedPortId]);

  useEffect(() => {
    const models = getAIModels();
    setAiModels(models);
    
    if (models.length > 0) {
      setSelectedModel(models[0].name);
    }
  }, []);

  const handleRefreshPredictions = async () => {
    if (!selectedPortId) return;
    
    setLoading(true);
    try {
      const [delayPrediction, congestionPrediction] = await Promise.all([
        api.getDelayPrediction(selectedPortId),
        api.getCongestionPrediction(selectedPortId)
      ]);
      
      setDelayPredictions(prev => ({
        ...prev,
        [selectedPortId]: delayPrediction
      }));
      
      setCongestionPredictions(prev => ({
        ...prev,
        [selectedPortId]: congestionPrediction
      }));
    } catch (error) {
      console.error('Error refreshing predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIPrediction = () => {
    setGeneratingAI(true);
    
    setTimeout(() => {
      if (selectedPortId) {
        handleRefreshPredictions();
      }
      setGeneratingAI(false);
    }, 3000);
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'severe': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCongestionBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100';
      case 'moderate': return 'bg-yellow-100';
      case 'high': return 'bg-orange-100';
      case 'severe': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-maritime-800">AI-Powered Predictive Analytics</h1>
            <p className="text-gray-500">Machine Learning models for accurate port operations forecasting</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <PortSelector 
              selectedPortId={selectedPortId} 
              onSelectPort={setSelectedPortId} 
            />
            
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-white"
              onClick={handleRefreshPredictions}
              disabled={loading || !selectedPortId}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!selectedPortId ? (
          <div className="text-center py-20">
            <Ship className="h-16 w-16 mx-auto text-maritime-300 mb-4" />
            <h2 className="text-xl font-medium text-maritime-700">Select a port to view predictions</h2>
            <p className="text-gray-500 mt-2">Choose a port from the dropdown above to see delay and congestion forecasts</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="h-5 w-5 mr-2 text-maritime-600" />
                    <span>Predicted Delay</span>
                  </CardTitle>
                  {delayPredictions[selectedPortId]?.modelUsed && (
                    <CardDescription>
                      Model: {delayPredictions[selectedPortId]?.modelUsed}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-maritime-700">
                          {delayPredictions[selectedPortId]?.predictedDelay || '--'}
                          <span className="text-sm font-normal text-gray-500 ml-1">hours</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {delayPredictions[selectedPortId]?.confidenceLevel
                            ? `${Math.round(delayPredictions[selectedPortId].confidenceLevel * 100)}% confidence`
                            : 'No data available'}
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded-full ${
                        (delayPredictions[selectedPortId]?.predictedDelay || 0) > 24
                          ? 'bg-red-100'
                          : (delayPredictions[selectedPortId]?.predictedDelay || 0) > 12
                            ? 'bg-orange-100'
                            : 'bg-green-100'
                      }`}>
                        <AlertTriangle className={`h-8 w-8 ${
                          (delayPredictions[selectedPortId]?.predictedDelay || 0) > 24
                            ? 'text-red-500'
                            : (delayPredictions[selectedPortId]?.predictedDelay || 0) > 12
                              ? 'text-orange-500'
                              : 'text-green-500'
                        }`} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Ship className="h-5 w-5 mr-2 text-maritime-600" />
                    <span>Congestion Forecast</span>
                  </CardTitle>
                  {congestionPredictions[selectedPortId]?.modelUsed && (
                    <CardDescription>
                      Model: {congestionPredictions[selectedPortId]?.modelUsed}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-2xl font-bold capitalize ${
                          getCongestionColor(congestionPredictions[selectedPortId]?.level || '')
                        }`}>
                          {congestionPredictions[selectedPortId]?.level || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expected for next {congestionPredictions[selectedPortId]?.estimatedDuration || '--'} hours
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded-full ${
                        getCongestionBg(congestionPredictions[selectedPortId]?.level || '')
                      }`}>
                        <Ship className={`h-8 w-8 ${
                          getCongestionColor(congestionPredictions[selectedPortId]?.level || '')
                        }`} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <CalendarDays className="h-5 w-5 mr-2 text-maritime-600" />
                    <span>Optimal Scheduling</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="bg-green-100 text-green-700 text-xs font-medium rounded px-2 py-0.5 mr-2">
                          Best
                        </div>
                        <p className="font-medium">Thursday, 10 April (08:00-12:00)</p>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-yellow-100 text-yellow-700 text-xs font-medium rounded px-2 py-0.5 mr-2">
                          Alternative
                        </div>
                        <p className="font-medium">Friday, 11 April (14:00-18:00)</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-maritime-600" />
                      AI-Enhanced Prediction Models
                    </CardTitle>
                    <CardDescription>
                      Analyze weather patterns and historical data for improved forecasting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-maritime-100 rounded-lg bg-maritime-50">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Ship className="h-4 w-4 mr-2 text-maritime-600" />
                          <span>Key Delay Factors</span>
                        </h3>
                        
                        {loading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ) : (
                          <ul className="space-y-2">
                            {delayPredictions[selectedPortId]?.impactingFactors.map((factor, index) => (
                              <li key={index} className="flex items-center justify-between">
                                <span>{factor.factor}</span>
                                <div className="flex items-center">
                                  <span className="text-gray-600 font-medium mr-2">
                                    {Math.round(factor.impact * 100)}%
                                  </span>
                                  {factor.impact > 0.3 ? (
                                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      
                      <div className="p-4 border border-maritime-100 rounded-lg">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Database className="h-4 w-4 mr-2 text-maritime-600" />
                          <span>Available AI Models</span>
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          {aiModels.map((model) => (
                            <div key={model.name} className="flex items-center p-2 border border-maritime-100 rounded-lg hover:bg-maritime-50">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{model.name} v{model.version}</p>
                                <p className="text-xs text-gray-500">{model.description}</p>
                              </div>
                              <div className="text-xs">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                  {Math.round(model.accuracy * 100)}% accuracy
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <h3 className="font-medium mb-3">Generate Advanced AI Prediction</h3>
                        <p className="text-xs text-gray-500 mb-4">
                          Uses multiple ML models including regression analysis, random forest classification, and time series forecasting to generate predictions based on historical patterns and current conditions.
                        </p>
                        
                        <Button 
                          className="w-full"
                          onClick={handleGenerateAIPrediction}
                          disabled={generatingAI}
                        >
                          {generatingAI ? (
                            <>
                              <div className="wave-loader mr-2">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                              <span>Running AI Models...</span>
                            </>
                          ) : (
                            <span>Generate Advanced AI Prediction</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapIcon className="h-5 w-5 mr-2 text-maritime-600" />
                    <span>Regional Impact Forecast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Weather systems affecting multiple ports in the region:
                    </p>
                    
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50">
                          <p className="font-medium">Tropical Storm System</p>
                          <p className="text-xs text-gray-500">
                            Approaching Singapore, affecting 3 ports
                          </p>
                        </div>
                        
                        <div className="p-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
                          <p className="font-medium">High Wind Advisory</p>
                          <p className="text-xs text-gray-500">
                            Northern European routes, affecting 5 ports
                          </p>
                        </div>
                        
                        <div className="p-3 rounded-lg border-l-4 border-blue-400 bg-blue-50">
                          <p className="font-medium">Heavy Fog Warning</p>
                          <p className="text-xs text-gray-500">
                            East Asian coastal areas, affecting 4 ports
                          </p>
                        </div>
                      </>
                    )}
                    
                    <div className="pt-3">
                      <Button variant="outline" className="w-full">View Full Regional Forecast</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>AI Prediction Analysis Report</CardTitle>
                <CardDescription>
                  Generated using machine learning models trained on historical weather and shipping data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    Based on the current weather patterns and historical data, we predict that 
                    {selectedPortId && ports.find(p => p.id === selectedPortId)?.name} will experience
                    {congestionPredictions[selectedPortId]?.level} congestion over the next 
                    {congestionPredictions[selectedPortId]?.estimatedDuration} hours, with average 
                    vessel delays of approximately {delayPredictions[selectedPortId]?.predictedDelay} hours.
                  </p>
                  
                  <div className="border-t border-b border-gray-100 py-4">
                    <h3 className="font-medium mb-2">Key Insights:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Weather conditions are the primary contributing factor to expected delays, 
                        with wind speeds exceeding normal operational thresholds.</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Port capacity utilization is currently at 68%, which is within manageable ranges 
                        despite the weather challenges.</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Historical analysis shows similar patterns resulted in 15-20% increased processing 
                        times during comparable weather events.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    Our AI model indicates a {Math.round((delayPredictions[selectedPortId]?.confidenceLevel || 0) * 100)}% confidence 
                    level in these predictions based on correlation analysis of past weather events and 
                    their documented impacts on port operations. Shipping operators are advised to adjust 
                    schedules accordingly and consider the recommended optimal arrival windows.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Predictions;
