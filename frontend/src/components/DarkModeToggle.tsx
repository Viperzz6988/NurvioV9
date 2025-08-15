import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DarkModeToggleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  darkMode, 
  toggleDarkMode, 
  position = 'bottom-right',
  className = ''
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <Button
      onClick={toggleDarkMode}
      size="icon"
      className={`
        fixed ${positionClasses[position]} z-50 
        dark-toggle
        w-12 h-12 rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300
        ${className}
      `}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-blue-600" />
      )}
    </Button>
  );
};

export default DarkModeToggle;