// Server environment configuration

// Get the current environment from NODE_ENV
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = process.env.NODE_ENV;
  if (env === 'production' || env === 'staging') {
    return env;
  }
  return 'development';
};

const environment = getEnvironment();

// Environment specific configuration
const configs = {
  development: {
    port: parseInt(process.env.PORT || '5000'),
    corsOrigins: ['http://localhost:3000', 'http://localhost:5000'],
    sessionSecret: 'dev-session-secret',
    logLevel: 'debug',
  },
  staging: {
    port: parseInt(process.env.PORT || '5000'),
    corsOrigins: ['https://staging.barbyandken.com'],
    sessionSecret: process.env.SESSION_SECRET || 'staging-session-secret',
    logLevel: 'info',
  },
  production: {
    port: parseInt(process.env.PORT || '5000'),
    corsOrigins: ['https://barbyandken.com', 'https://www.barbyandken.com'],
    sessionSecret: process.env.SESSION_SECRET || 'production-session-secret',
    logLevel: 'error',
  }
};

// Server configuration
export const config = {
  environment,
  isProduction: environment === 'production',
  isStaging: environment === 'staging',
  isDevelopment: environment === 'development',
  ...configs[environment],
  
  // Common configuration across all environments
  apiPrefix: '/api',
  maxUploadSize: '10mb',
  
  // Service APIs
  openWeatherMapApiKey: process.env.OPENWEATHERMAP_API_KEY,
  
  // Database configuration
  dbConnectionString: process.env.DATABASE_URL,
};

// Helper log function prefixed with environment
export function logWithEnv(message: string): void {
  console.log(`[${environment.toUpperCase()}] ${message}`);
}