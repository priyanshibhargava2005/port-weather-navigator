
import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { api } from '@/lib/api';
import { Port } from '@/lib/types';

interface PortSelectorProps {
  onSelectPort: (portId: string) => void;
  selectedPortId: string | null;
}

const PortSelector = ({ onSelectPort, selectedPortId }: PortSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const portsData = await api.getPorts();
        setPorts(portsData);
        
        // Set initial port if none selected
        if (!selectedPortId && portsData.length > 0) {
          onSelectPort(portsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching ports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPorts();
  }, [onSelectPort, selectedPortId]);

  const selectedPort = ports.find(port => port.id === selectedPortId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[250px] justify-between bg-white border-maritime-200"
          disabled={loading}
        >
          {loading ? (
            <div className="wave-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : selectedPort ? (
            <>
              <span>{selectedPort.name}</span>
              <span className="ml-2 text-xs text-gray-500">({selectedPort.code})</span>
            </>
          ) : (
            "Select port..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search port..." />
          <CommandEmpty>No port found.</CommandEmpty>
          <CommandGroup>
            {ports.map((port) => (
              <CommandItem
                key={port.id}
                value={port.id}
                onSelect={() => {
                  onSelectPort(port.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedPortId === port.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{port.name}</span>
                  <span className="text-xs text-gray-500">{port.country} ({port.code})</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PortSelector;
