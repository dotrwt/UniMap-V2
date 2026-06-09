// src/components/ui/NavigationPanel.tsx
import { motion } from 'motion/react';
import { Navigation, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';

export interface NavigationPanelStep {
  instruction: string;
  direction: string;
  distance: string;
}

interface NavigationPanelProps {
  isNavigating: boolean;
  navigationDirections: NavigationPanelStep[];
  onResetNavigation: () => void;
}

export default function NavigationPanel({
  isNavigating,
  navigationDirections,
  onResetNavigation,
}: NavigationPanelProps) {
  if (!isNavigating) return null;

  const renderDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'right':
        return <ArrowRight className="w-4 h-4 text-blue-600" />;
      case 'left':
        return <ArrowLeft className="w-4 h-4 text-blue-600" />;
      case 'up':
        return <ArrowUp className="w-4 h-4 text-blue-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-blue-600" />;
      case 'straight':
      default:
        return <ChevronRight className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="surface-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-gray-900 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          Navigation Steps
        </h3>
        <Button
          onClick={onResetNavigation}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
        >
          End
        </Button>
      </div>

      {/* Directions List */}
      <div className="space-y-3">
        {navigationDirections.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
          >
            {/* Direction Icon */}
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg flex-shrink-0">
              {renderDirectionIcon(step.direction)}
            </div>
            
            {/* Instruction Text */}
            <div className="flex-1">
              <p className="text-sm text-gray-900">{step.instruction}</p>
              <p className="text-xs text-gray-500 mt-0.5">{step.distance}</p>
            </div>
            
            {/* Step Number Badge */}
            <Badge variant="default" className="text-xs">
              {index + 1}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
