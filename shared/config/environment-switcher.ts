/**
 * Environment Switcher Utility
 * 
 * This utility allows switching between local, staging, and production environments
 * without modifying package.json or vite.config.ts.
 */

import { config, CURRENT_ENV } from './index';

export class EnvironmentManager {
  // Store the current active environment
  private static activeEnvironment = CURRENT_ENV;
  
  // Registry of environment-specific settings
  private static envSettings = {
    // API endpoints
    apiEndpoints: {
      local: 'http://localhost:5000',
      staging: 'https://staging.barbyandken.com/api',
      production: 'https://api.barbyandken.com'
    },
    
    // Environment colors for visual identification
    colors: {
      local: '#3b82f6', // blue
      staging: '#f59e0b', // amber
      production: '#10b981' // emerald
    },
    
    // Environment labels
    labels: {
      local: 'LOCAL',
      staging: 'STAGING',
      production: 'PRODUCTION'
    }
  };
  
  /**
   * Get the current environment
   */
  static getCurrentEnvironment(): string {
    return this.activeEnvironment;
  }
  
  /**
   * Get environment color for UI indicators
   */
  static getEnvironmentColor(): string {
    return this.envSettings.colors[this.activeEnvironment as keyof typeof this.envSettings.colors];
  }
  
  /**
   * Get environment label for UI
   */
  static getEnvironmentLabel(): string {
    return this.envSettings.labels[this.activeEnvironment as keyof typeof this.envSettings.labels];
  }
  
  /**
   * Get correct API URL based on environment
   */
  static getApiUrl(path: string): string {
    const baseUrl = this.envSettings.apiEndpoints[this.activeEnvironment as keyof typeof this.envSettings.apiEndpoints];
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
  
  /**
   * Change the active environment at runtime
   * This can be triggered from a settings menu
   */
  static switchEnvironment(env: 'local' | 'staging' | 'production'): void {
    // Don't change if it's the same environment
    if (env === this.activeEnvironment) return;
    
    // Update active environment
    this.activeEnvironment = env;
    
    // Store in local storage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_environment', env);
    }
    
    // Trigger a page reload to apply changes
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
  
  /**
   * Initialize environment based on URL or localStorage
   * Call this on application startup
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;
    
    // Check URL parameters for env switch
    const params = new URLSearchParams(window.location.search);
    const envParam = params.get('env');
    
    if (envParam && ['local', 'staging', 'production'].includes(envParam)) {
      this.activeEnvironment = envParam as 'local' | 'staging' | 'production';
      localStorage.setItem('app_environment', envParam);
    } else {
      // Check localStorage for previously set environment
      const storedEnv = localStorage.getItem('app_environment');
      if (storedEnv && ['local', 'staging', 'production'].includes(storedEnv)) {
        this.activeEnvironment = storedEnv as 'local' | 'staging' | 'production';
      }
    }
    
    // Domain-based automatic environment detection
    if (window.location.hostname === 'barbyandken.com' || 
        window.location.hostname === 'www.barbyandken.com') {
      this.activeEnvironment = 'production';
    } else if (window.location.hostname === 'staging.barbyandken.com') {
      this.activeEnvironment = 'staging';
    }
    
    console.log(`Environment initialized: ${this.activeEnvironment.toUpperCase()}`);
  }
}