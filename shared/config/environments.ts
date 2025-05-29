// Environment configuration settings

type Environment = 'local' | 'staging' | 'production';

interface EnvironmentConfig {
  apiUrl: string;
  appTitle: string;
  isProduction: boolean;
  enableMockData: boolean;
  analyticsEnabled: boolean;
}

const environments: Record<Environment, EnvironmentConfig> = {
  local: {
    apiUrl: 'http://localhost:5000',
    appTitle: 'Barby & Ken BBQ (Local)',
    isProduction: false,
    enableMockData: true,
    analyticsEnabled: false
  },
  staging: {
    apiUrl: 'https://staging.barbyandken.com/api',
    appTitle: 'Barby & Ken BBQ (Staging)',
    isProduction: false,
    enableMockData: false,
    analyticsEnabled: true
  },
  production: {
    apiUrl: 'https://api.barbyandken.com',
    appTitle: 'Barby & Ken BBQ',
    isProduction: true,
    enableMockData: false,
    analyticsEnabled: true
  }
};

// Default to local environment
let currentEnvironment: Environment = 'local';

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Check if we're on a production domain first
  if (window.location.hostname === 'barbyandken.com' || 
      window.location.hostname === 'www.barbyandken.com') {
    currentEnvironment = 'production';
  } else if (window.location.hostname === 'staging.barbyandken.com') {
    currentEnvironment = 'staging';
  } else if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('.replit.')) {
    // Force local environment for development
    currentEnvironment = 'local';
  } else {
    // Get environment from URL or localStorage for other cases
    const urlParams = new URLSearchParams(window.location.search);
    const envParam = urlParams.get('env') as Environment | null;
    
    if (envParam && environments[envParam]) {
      currentEnvironment = envParam;
      localStorage.setItem('app_environment', envParam);
    } else {
      const storedEnv = localStorage.getItem('app_environment') as Environment | null;
      if (storedEnv && environments[storedEnv]) {
        currentEnvironment = storedEnv;
      }
    }
  }
} else {
  // Server-side - get from NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    currentEnvironment = 'production';
  } else if (nodeEnv === 'staging') {
    currentEnvironment = 'staging';
  }
}

export const config = environments[currentEnvironment];
export const CURRENT_ENV = currentEnvironment;

// Helper function to check current environment
export function isEnvironment(env: Environment): boolean {
  return currentEnvironment === env;
}