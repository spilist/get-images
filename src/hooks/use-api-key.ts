"use client";

import { useState, useEffect, useCallback } from 'react';
import { ApiKeyConfig } from '@/types/api';
import { getCurrentApiKeyConfig } from '@/lib/api-key-storage';

export function useApiKey() {
  const [config, setConfig] = useState<ApiKeyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial configuration
  useEffect(() => {
    const loadConfig = () => {
      try {
        const currentConfig = getCurrentApiKeyConfig();
        setConfig(currentConfig);
      } catch (error) {
        console.error('Failed to load API key configuration:', error);
        // Fallback to environment key
        setConfig({
          apiKey: '',
          source: 'environment',
          isValid: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Update configuration (called from settings dialog)
  const updateConfig = useCallback((newConfig: ApiKeyConfig | null) => {
    setConfig(newConfig);
  }, []);

  // Refresh configuration (useful after external changes)
  const refreshConfig = useCallback(() => {
    setIsLoading(true);
    try {
      const currentConfig = getCurrentApiKeyConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to refresh API key configuration:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get the API key for making requests
  const getApiKey = useCallback((): string | null => {
    if (!config) return null;
    
    if (config.source === 'user' && config.isValid) {
      return config.apiKey;
    }
    
    // For environment keys, return null to let the server handle it
    return null;
  }, [config]);

  return {
    config,
    isLoading,
    hasUserKey: config?.source === 'user',
    isValid: config?.isValid ?? false,
    updateConfig,
    refreshConfig,
    getApiKey
  };
}