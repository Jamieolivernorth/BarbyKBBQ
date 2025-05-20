// Configuration utility functions
import { config, CURRENT_ENV, isEnvironment } from './environments';

// Export all from environments for easy access
export { config, CURRENT_ENV, isEnvironment };

// Helper functions for commonly used configuration values
export const getApiUrl = (): string => config.apiUrl;
export const getAppTitle = (): string => config.appTitle;
export const isProduction = (): boolean => config.isProduction;
export const isMockDataEnabled = (): boolean => config.enableMockData;
export const isAnalyticsEnabled = (): boolean => config.analyticsEnabled;

// Get the current environment banner text (for non-production environments)
export const getEnvironmentBanner = (): string | null => {
  if (CURRENT_ENV === 'production') return null;
  return CURRENT_ENV.toUpperCase();
};

// Helper to get environment-specific CSS classes
export const getEnvironmentClasses = (): string => {
  switch (CURRENT_ENV) {
    case 'local':
      return 'env-local';
    case 'staging':
      return 'env-staging';
    case 'production':
    default:
      return '';
  }
};