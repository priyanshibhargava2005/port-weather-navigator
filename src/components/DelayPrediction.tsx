
import { useShippingData } from '@/hooks/useShippingData';
import { Clock, AlertCircle, TrendingUp, BarChart, PieChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DelayPredictionProps {
  portId: string | null;
}

const DelayPrediction = ({ portId }: DelayPredictionProps) => {
  const { delayPrediction, loading, error } = useShippingData(portId);

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-700">Prediction Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDelayLevel = (hours: number) => {
    if (hours <= 6) return { label: 'Minimal', color: 'text-green-500' };
    if (hours <= 12) return { label: 'Minor', color: 'text-yellow-500' };
    if (hours <= 24) return { label: 'Moderate', color: 'text-orange-500' };
    return { label: 'Severe', color: 'text-red-500' };
  };

  const delayLevel = delayPrediction ? getDelayLevel(delayPrediction.predictedDelay) : { label: 'Unknown', color: 'text-gray-500' };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-maritime-700 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-maritime-600" />
          <span>Delay Prediction</span>
        </CardTitle>
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
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-2xl font-bold">{delayPrediction?.predictedDelay || '--'} <span className="text-sm font-normal text-gray-500">hours</span></h3>
                <p className={`text-sm font-medium ${delayLevel.color}`}>{delayLevel.label} Delay Expected</p>
              </div>
              
              <div className="bg-maritime-50 p-2 rounded-full">
                <AlertCircle className={`h-8 w-8 ${delayLevel.color}`} />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Prediction Confidence</span>
                <span className="font-medium">{delayPrediction ? Math.round(delayPrediction.confidenceLevel * 100) : '--'}%</span>
              </div>
              <Progress 
                value={delayPrediction ? delayPrediction.confidenceLevel * 100 : 0} 
                className={`h-2 ${delayPrediction ? getConfidenceColor(delayPrediction.confidenceLevel) : 'bg-gray-300'}`} 
              />
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-sm flex items-center mb-2">
                <TrendingUp className="h-4 w-4 mr-1 text-maritime-600" />
                <span>Key Factors</span>
              </h4>
              
              {delayPrediction?.impactingFactors.map((factor, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{factor.factor}</span>
                    <span className="font-medium">{Math.round(factor.impact * 100)}%</span>
                  </div>
                  <Progress value={factor.impact * 100} className="h-1.5 bg-maritime-200" />
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Prediction updated: {delayPrediction ? new Date(delayPrediction.timestamp).toLocaleString() : '--'}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DelayPrediction;
