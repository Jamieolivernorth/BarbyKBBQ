/**
 * Feature flags configuration
 * Used to enable/disable features across the application
 */

export interface FeatureFlags {
  aiShopping: boolean;
  aiRecommendations: boolean;
  aiAssistant: boolean;
  aiMenuGenerator: boolean;
  aiBookingAnalyzer: boolean;
  weatherWidget: boolean;
  affiliateSystem: boolean;
  beachCleanupContribution: boolean;
  cryptoPayments: boolean;
  socialSharing: boolean;
}

// Default feature flags - can be overridden by environment or admin settings
export const defaultFeatureFlags: FeatureFlags = {
  aiShopping: false,           // Disable AI shopping until OpenAI quota is available
  aiRecommendations: false,    // Disable AI recommendations
  aiAssistant: false,          // Disable AI chat assistant
  aiMenuGenerator: false,      // Disable AI menu generator
  aiBookingAnalyzer: false,    // Disable AI booking analyzer
  weatherWidget: true,         // Keep weather widget enabled
  affiliateSystem: true,       // Keep affiliate system enabled
  beachCleanupContribution: true, // Keep beach cleanup contribution enabled
  cryptoPayments: false,       // Disable crypto payments for now
  socialSharing: true,         // Keep social sharing enabled
};

/**
 * Get current feature flags
 * Can be extended to read from localStorage, admin settings, or environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  // Load from localStorage if available, otherwise use defaults
  return loadFeatureFlagsFromStorage();
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Admin function to toggle feature flags
 * This could be connected to an admin panel in the future
 */
export function setFeatureFlag(feature: keyof FeatureFlags, enabled: boolean): void {
  // For now, just update the default flags
  // In production, this would save to a database or localStorage
  defaultFeatureFlags[feature] = enabled;
  
  // Optionally store in localStorage for persistence
  if (typeof window !== 'undefined') {
    const currentFlags = JSON.parse(localStorage.getItem('featureFlags') || '{}');
    currentFlags[feature] = enabled;
    localStorage.setItem('featureFlags', JSON.stringify(currentFlags));
  }
}

/**
 * Load feature flags from localStorage if available
 */
export function loadFeatureFlagsFromStorage(): FeatureFlags {
  if (typeof window === 'undefined') {
    return defaultFeatureFlags;
  }
  
  try {
    const storedFlags = localStorage.getItem('featureFlags');
    if (storedFlags) {
      const parsedFlags = JSON.parse(storedFlags);
      return { ...defaultFeatureFlags, ...parsedFlags };
    }
  } catch (error) {
    console.warn('Failed to load feature flags from localStorage:', error);
  }
  
  return defaultFeatureFlags;
}