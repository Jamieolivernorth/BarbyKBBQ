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
    apiUrl: 'https://barbyandken.com',
    appTitle: 'Barby & Ken BBQ',
    isProduction: true,
    enableMockData: false,
    analyticsEnabled: true
  }
};

// Force local environment for development
let currentEnvironment: Environment = 'local';

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Force local environment for development domains
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('replit.dev') ||
      window.location.hostname.includes('replit.app') ||
      window.location.hostname.includes('replit.')) {
    currentEnvironment = 'local';
  } else if (window.location.hostname === 'barbyandken.com' || 
            window.location.hostname === 'www.barbyandken.com') {
    currentEnvironment = 'production';
  } else if (window.location.hostname === 'staging.barbyandken.com') {
    currentEnvironment = 'staging';
  } else {
    // Default to local for any other development environment
    currentEnvironment = 'local';
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

// Force local config for development
export const config = environments['local'];
export const CURRENT_ENV = 'local';

// Helper function to check current environment
export function isEnvironment(env: Environment): boolean {
  return currentEnvironment === env;
}