"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Settings, ExternalLink, Key, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  storeApiKey,
  removeStoredApiKey,
  validateApiKeyFormat,
  getCurrentApiKeyConfig,
  hasUserApiKey,
} from "@/lib/api-key-storage";
import { ApiKeyConfig } from "@/types/api";

interface SettingsDialogProps {
  trigger?: React.ReactNode;
  onApiKeyChange?: (config: ApiKeyConfig | null) => void;
}

export function SettingsDialog({ trigger, onApiKeyChange }: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ApiKeyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load current configuration when dialog opens
  useEffect(() => {
    if (isOpen) {
      const config = getCurrentApiKeyConfig();
      setCurrentConfig(config);
      
      // Only show user key in input if it exists and is valid
      if (config?.source === 'user' && config.isValid) {
        setApiKeyInput(config.apiKey);
      } else {
        setApiKeyInput("");
      }
      
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!apiKeyInput.trim()) {
        setError("Please enter an API key");
        return;
      }

      const validation = validateApiKeyFormat(apiKeyInput);
      if (!validation.isValid) {
        setError(validation.error || "Invalid API key format");
        return;
      }

      const success = storeApiKey(apiKeyInput);
      if (!success) {
        setError("Failed to save API key. Please check your browser settings.");
        return;
      }

      // Update current configuration
      const newConfig: ApiKeyConfig = {
        apiKey: apiKeyInput.trim(),
        source: 'user',
        isValid: true
      };
      
      setCurrentConfig(newConfig);
      setSuccess("API key saved successfully!");
      
      // Notify parent component
      onApiKeyChange?.(newConfig);
      
      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const success = removeStoredApiKey();
      if (!success) {
        setError("Failed to clear API key");
        return;
      }

      setApiKeyInput("");
      
      // Update to environment config
      const newConfig: ApiKeyConfig = {
        apiKey: '',
        source: 'environment',
        isValid: true
      };
      
      setCurrentConfig(newConfig);
      setSuccess("API key cleared. Using environment key.");
      
      // Notify parent component
      onApiKeyChange?.(newConfig);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear API key");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <Settings className="h-4 w-4" />
      Settings
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Settings
          </DialogTitle>
          <DialogDescription>
            Configure your SERPAPI key for image search functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge variant={currentConfig?.source === 'user' ? 'default' : 'secondary'}>
                {currentConfig?.source === 'user' ? 'User Key' : 'Environment Key'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {currentConfig?.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apikey">
              SERPAPI Key
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="apikey"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your SERPAPI key (64 characters)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={isLoading}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showApiKey ? "Hide" : "Show"} API key
                </span>
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertTitle>Get your SERPAPI key</AlertTitle>
            <AlertDescription className="space-y-1">
              <p className="text-sm">
                1. Visit{" "}
                <a
                  href="https://serpapi.com/manage-api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:text-primary/80"
                >
                  serpapi.com/manage-api-key
                </a>
              </p>
              <p className="text-sm">2. Sign up or log in to your account</p>
              <p className="text-sm">3. Copy your API key and paste it above</p>
              <p className="text-xs text-muted-foreground mt-2">
                Your API key is stored locally and never sent to our servers.
              </p>
            </AlertDescription>
          </Alert>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                {success}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {hasUserApiKey() && (
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Key
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isLoading || !apiKeyInput.trim()}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}