
import { useShippingData } from '@/hooks/useShippingData';
import { Ship, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CongestionAnalyticsProps {
  portId: string | null;
}

const CongestionAnalytics = ({ portId }: CongestionAnalyticsProps) => {
  const { currentShipping, congestionPrediction, loading, error } = useShippingData(portId);

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-700">Analytics Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-maritime-700 flex items-center">
          <Ship className="mr-2 h-5 w-5 text-maritime-600" />
          <span>Port Congestion</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold capitalize">
                  {currentShipping?.congestionLevel || 'Unknown'}
                </h3>
                <p className="text-sm text-gray-500">Current Congestion Level</p>
              </div>
              
              <div className={`p-2 rounded-full ${getCongestionBg(currentShipping?.congestionLevel || '')}`}>
                <AlertTriangle className={`h-6 w-6 ${getCongestionColor(currentShipping?.congestionLevel || '')}`} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-maritime-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Vessels in Port</p>
                <p className="text-xl font-bold">{currentShipping?.vesselCount || '--'}</p>
              </div>
              
              <div className="bg-maritime-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Average Wait Time</p>
                <p className="text-xl font-bold">{currentShipping?.avgWaitTime || '--'} <span className="text-sm font-normal">hrs</span></p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Congestion Forecast</h4>
              
              <div className={`p-3 rounded-lg ${getCongestionBg(congestionPrediction?.level || '')}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-bold capitalize ${getCongestionColor(congestionPrediction?.level || '')}`}>
                      {congestionPrediction?.level || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-700">Predicted for next {congestionPrediction?.estimatedDuration || '--'} hours</p>
                  </div>
                  
                  <div className="flex items-center">
                    {congestionPrediction && currentShipping && (
                      congestionPrediction.level === currentShipping.congestionLevel ? (
                        <span className="text-gray-500 text-sm flex items-center">
                          Stable
                        </span>
                      ) : (
                        getCongestionSeverity(congestionPrediction.level) > 
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
                        )
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              {currentShipping?.delayedVessels} vessels currently experiencing delays
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to convert congestion level to a numeric value for comparison
const getCongestionSeverity = (level: string): number => {
  switch (level) {
    case 'low': return 1;
    case 'moderate': return 2;
    case 'high': return 3;
    case 'severe': return 4;
    default: return 0;
  }
};

export default CongestionAnalytics;
