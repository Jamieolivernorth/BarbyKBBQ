import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface DriverAuthProps {
  children: React.ReactNode;
}

export function RequireDriverAuth({ children }: DriverAuthProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if driver is authenticated
    const driverAccess = localStorage.getItem('driverAccess');
    
    if (!driverAccess) {
      setLocation("/driver-login");
      return;
    }
    
    setIsChecking(false);
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C8913B] border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}

export function detectSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Check if it's a subdomain (more than 2 parts for .com domains, more than 3 for .co.uk etc)
  if (parts.length > 2) {
    const subdomain = parts[0];
    return subdomain;
  }
  
  return null;
}

export function isDriverSubdomain(): boolean {
  const subdomain = detectSubdomain();
  return subdomain === 'driver' || subdomain === 'delivery';
}