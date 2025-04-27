import { useEffect, useRef, useState } from "react";
import { Port } from "@/lib/types";
import { api } from "@/lib/api";
import { MapIcon, AlertTriangle, Maximize2, Minimize2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MapProps {
  selectedPortId: string | null;
  onPortSelect: (portId: string) => void;
}

const Map = ({ selectedPortId, onPortSelect }: MapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullMap, setShowFullMap] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const portsData = await api.getPorts();
        setPorts(portsData);
      } catch (error) {
        console.error("Error fetching ports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPorts();
  }, []);

  // This component is currently using a simple representation
  // In a real app, this would integrate with a map library like Mapbox, Google Maps, or Leaflet
  return (
    <>
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-maritime-50 border border-maritime-100 shadow-sm">
        {loading ? (
          <div className="p-6 w-full h-full flex flex-col items-center justify-center">
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ) : (
          <div
            className="relative w-full h-full min-h-[300px]"
            ref={mapContainerRef}
          >
            {/* Simple map representation with port markers */}
            <div className="absolute inset-0 bg-ocean-50 p-4 flex items-center justify-center">
              {/* Map would be rendered here with a real map library */}
              <div className="text-center text-maritime-500">
                <MapIcon className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">
                  Interactive map visualization would be rendered here
                </p>
                <p className="text-xs mt-2 text-gray-500">
                  (Would integrate with Mapbox, Google Maps, or Leaflet in
                  production)
                </p>
              </div>

              {/* Placeholder port markers */}
              {ports.map((port) => (
                <div
                  key={port.id}
                  className={`absolute w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                    port.id === selectedPortId
                      ? "bg-maritime-600 ring-4 ring-maritime-200 z-10"
                      : "bg-maritime-400 hover:bg-maritime-500"
                  }`}
                  style={{
                    // Very simplified positioning - would use proper geo conversion in production
                    left: `${((port.longitude + 180) / 360) * 100}%`,
                    top: `${((90 - port.latitude) / 180) * 100}%`,
                  }}
                  onClick={() => onPortSelect(port.id)}
                  title={port.name}
                />
              ))}
            </div>

            {/* Toggle full map button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 bg-white text-maritime-700"
              onClick={() => setIsModalOpen(true)}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Expand Map
            </Button>

            {/* Selected port info panel */}
            {selectedPortId && (
              <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md border border-maritime-100 max-w-xs">
                <h3 className="font-medium text-maritime-800">
                  {ports.find((p) => p.id === selectedPortId)?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {ports.find((p) => p.id === selectedPortId)?.country} -{" "}
                  {ports.find((p) => p.id === selectedPortId)?.code}
                </p>
                <div className="mt-2 flex items-center text-xs text-amber-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Weather alert in effect</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full map modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 bg-maritime-700 text-white">
            <DialogTitle>Port Map</DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-full bg-ocean-50 p-4 flex items-center justify-center">
            {/* Map content in modal */}
            <div className="text-center text-maritime-500">
              <MapIcon className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">Expanded map view</p>
              <p className="text-sm mt-2 text-gray-500">
                (Would display a more detailed map in production)
              </p>
            </div>

            {/* Port markers in modal */}
            {ports.map((port) => (
              <div
                key={port.id}
                className={`absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                  port.id === selectedPortId
                    ? "bg-maritime-600 ring-4 ring-maritime-200 z-10"
                    : "bg-maritime-400 hover:bg-maritime-500"
                }`}
                style={{
                  left: `${((port.longitude + 180) / 360) * 100}%`,
                  top: `${((90 - port.latitude) / 180) * 100}%`,
                }}
                onClick={() => {
                  onPortSelect(port.id);
                }}
                title={port.name}
              />
            ))}

            {/* Selected port info panel in modal */}
            {selectedPortId && (
              <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md border border-maritime-100 max-w-xs">
                <h3 className="font-medium text-maritime-800 text-lg">
                  {ports.find((p) => p.id === selectedPortId)?.name}
                </h3>
                <p className="text-gray-500">
                  {ports.find((p) => p.id === selectedPortId)?.country} -{" "}
                  {ports.find((p) => p.id === selectedPortId)?.code}
                </p>
                <div className="mt-2 flex items-center text-amber-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Weather alert in effect</span>
                </div>
              </div>
            )}

            {/* Close modal button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 bg-white text-maritime-700"
              onClick={() => setIsModalOpen(false)}
            >
              <Minimize2 className="h-4 w-4 mr-1" />
              Collapse Map
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Map;
