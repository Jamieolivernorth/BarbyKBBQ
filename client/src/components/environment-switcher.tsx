import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EnvironmentManager } from "@shared/config/environment-switcher";
import { CURRENT_ENV } from "@shared/config";

export function EnvironmentSwitcher() {
  const [currentEnv, setCurrentEnv] = useState<string>(CURRENT_ENV);
  
  // Initialize environment on component mount
  useEffect(() => {
    EnvironmentManager.initialize();
    setCurrentEnv(EnvironmentManager.getCurrentEnvironment());
  }, []);
  
  // Get environment color based on current environment
  const getEnvironmentStyle = () => {
    const color = EnvironmentManager.getEnvironmentColor();
    return {
      backgroundColor: color,
      color: '#ffffff',
      fontSize: '0.7rem',
      padding: '0.1rem 0.4rem',
      borderRadius: '0.25rem',
      fontWeight: 'bold',
    };
  };
  
  const switchEnvironment = (env: 'local' | 'staging' | 'production') => {
    EnvironmentManager.switchEnvironment(env);
    setCurrentEnv(env);
  };
  
  // Only show in non-production environments unless explicitly enabled in dev tools
  const showSwitch = currentEnv !== 'production' || localStorage.getItem('show_env_switch') === 'true';
  
  if (!showSwitch) return null;
  
  return (
    <div className="fixed bottom-2 right-2 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border border-gray-300 shadow-sm"
          >
            <span style={getEnvironmentStyle()}>
              {EnvironmentManager.getEnvironmentLabel()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => switchEnvironment('local')}
            className={currentEnv === 'local' ? 'bg-blue-50' : ''}
          >
            Local Environment
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => switchEnvironment('staging')}
            className={currentEnv === 'staging' ? 'bg-amber-50' : ''}
          >
            Staging Environment
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => switchEnvironment('production')}
            className={currentEnv === 'production' ? 'bg-emerald-50' : ''}
          >
            Production Environment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}