import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PortSelector from '@/components/PortSelector';
import WeatherPanel from '@/components/WeatherPanel';
import DelayPrediction from '@/components/DelayPrediction';
import CongestionAnalytics from '@/components/CongestionAnalytics';
import Navbar from '@/components/Navbar';
import { CalendarDays, Ship, ArrowRight } from 'lucide-react';

const Index = () => {
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-maritime-800">Port Weather Navigator</h1>
            <p className="text-gray-500">Monitor weather impacts on port operations and shipping</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <PortSelector 
              selectedPortId={selectedPortId} 
              onSelectPort={setSelectedPortId} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <Card className="h-full">
              <CardContent className="p-4">
                <DelayPrediction portId={selectedPortId} />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardContent className="p-4">
                <WeatherPanel portId={selectedPortId} />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/predictions" className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-ocean-100 text-ocean-700 p-3 rounded-full mb-4">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">Predictive Forecasting</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Use AI and ARIMA time series modeling to predict future delays and optimize shipping schedules
                </p>
                <Button variant="outline" className="mt-auto">
                  <span>View Predictions</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-storm-100 text-storm-700 p-3 rounded-full mb-4">
                <Ship className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-2">Active Alerts</h3>
              <p className="text-gray-500 text-sm mb-4">
                Weather alerts and notifications for selected ports
              </p>
              <div className="w-full mt-2">
                <div className="p-2 bg-yellow-50 text-yellow-800 rounded-md mb-2 text-sm">
                  High winds expected at Rotterdam Port
                </div>
                <div className="p-2 bg-red-50 text-red-800 rounded-md mb-2 text-sm">
                  Severe storm approaching Singapore Port
                </div>
                <div className="p-2 bg-blue-50 text-blue-800 rounded-md text-sm">
                  Fog warnings issued for Hamburg Port
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
