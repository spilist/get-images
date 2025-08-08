"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Eye, EyeOff, Settings, ExternalLink, Key, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  storeApiKey,
  removeStoredApiKey,
  validateApiKeyFormat,
  getCurrentApiKeyConfig,
  hasUserApiKey,
  getStoredSearchFilters,
  storeSearchFilters,
} from "@/lib/api-key-storage";
import type { SearchFilters, LicenseType, AspectRatio, ImageSize, ImageType } from '@/lib/serpapi.service';
import type { ApiKeyUsage } from '@/lib/api-key-usage';
import languages from '@/../references/google-languages.json';
import { ApiKeyConfig } from "@/types/api";
import LanguageSwitcher from "@/components/language-switcher";

interface SettingsDialogProps {
  trigger?: React.ReactNode;
  onApiKeyChange?: (config: ApiKeyConfig | null) => void;
}

export function SettingsDialog({ trigger, onApiKeyChange }: SettingsDialogProps) {
  const { t } = useTranslation(['common', 'settings']);
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ApiKeyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Search filters state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [startDate, setStartDate] = useState<Date>();
  
  // API usage monitoring state
  const [apiUsages, setApiUsages] = useState<(ApiKeyUsage & { keyType: string })[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);

  // Function to fetch API usage
  const fetchApiUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const response = await fetch('/api/usage', {
        headers: currentConfig?.source === 'user' ? { 'X-API-Key': currentConfig.apiKey } : {}
      });
      const data = await response.json();
      if (data.success) {
        setApiUsages(data.usages);
      }
    } catch (error) {
      console.error('Failed to fetch API usage:', error);
    } finally {
      setUsageLoading(false);
    }
  }, [currentConfig?.source, currentConfig?.apiKey]);

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
      
      // Load saved search filters
      const savedFilters = getStoredSearchFilters();
      if (savedFilters) {
        setSearchFilters(savedFilters);
        // Parse start_date if it exists
        if (savedFilters.start_date) {
          const year = parseInt(savedFilters.start_date.slice(0, 4));
          const month = parseInt(savedFilters.start_date.slice(4, 6)) - 1; // Month is 0-indexed
          const day = parseInt(savedFilters.start_date.slice(6, 8));
          setStartDate(new Date(year, month, day));
        }
      }
      
      setError(null);
      setSuccess(null);
      
      // Fetch API usage information
      fetchApiUsage();
    }
  }, [isOpen, fetchApiUsage]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!apiKeyInput.trim()) {
        setError(t('settings:apiKey.validationError'));
        return;
      }

      const validation = validateApiKeyFormat(apiKeyInput);
      if (!validation.isValid) {
        setError(validation.error || t('settings:apiKey.formatError'));
        return;
      }

      const success = storeApiKey(apiKeyInput);
      if (!success) {
        setError(t('settings:apiKey.saveError'));
        return;
      }

      // Update current configuration
      const newConfig: ApiKeyConfig = {
        apiKey: apiKeyInput.trim(),
        source: 'user',
        isValid: true
      };
      
      setCurrentConfig(newConfig);
      setSuccess(t('settings:apiKey.saveSuccess'));
      
      // Notify parent component
      onApiKeyChange?.(newConfig);
      
      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings:apiKey.saveError'));
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
        setError(t('settings:apiKey.clearError'));
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
      setSuccess(t('settings:apiKey.clearSuccess'));
      
      // Notify parent component
      onApiKeyChange?.(newConfig);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings:apiKey.clearError'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      const formattedDate = format(date, 'yyyyMMdd');
      updateFilter('start_date', formattedDate);
    } else {
      updateFilter('start_date', undefined);
    }
  };

  const handleSaveFilters = () => {
    const success = storeSearchFilters(searchFilters);
    if (success) {
      setSuccess(t('settings:searchOptions.saveSuccess'));
    } else {
      setError(t('settings:searchOptions.saveError'));
    }
  };

  const handleResetFilters = () => {
    setSearchFilters({});
    setStartDate(undefined);
    setSuccess(t('settings:searchOptions.resetSuccess'));
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <Settings className="h-4 w-4" />
      {t('settings:title')}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('settings:title')}
          </DialogTitle>
          <DialogDescription>
            {t('settings:instructions.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Key Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <h3 className="text-lg font-semibold">{t('settings:apiKey.title')}</h3>
              </div>
              <div className="flex gap-2">
                {hasUserApiKey() && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClear}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('settings:apiKey.clear')}
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !apiKeyInput.trim()}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? t('common:saving') : t('settings:apiKey.save')}
                </Button>
              </div>
            </div>
            
            {/* Current Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('settings:status.currentStatus')}</span>
              <Badge variant={currentConfig?.source === 'user' ? 'default' : 'secondary'}>
                {currentConfig?.source === 'user' ? t('settings:status.userKey') : t('settings:status.environmentKey')}
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
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apikey">
              {t('settings:apiKey.label')}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="apikey"
                type={showApiKey ? "text" : "password"}
                placeholder={t('settings:apiKey.placeholder')}
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
                  {showApiKey ? t('settings:apiKey.hide') : t('settings:apiKey.show')} API key
                </span>
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertTitle>{t('settings:apiKey.getKey')}</AlertTitle>
            <AlertDescription className="space-y-1">
              <p className="text-sm">
                <Trans
                  i18nKey="settings:instructions.steps.visitSerpapi"
                  components={{
                    serpapiLink: <a
                      href="https://serpapi.com/manage-api-key"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary hover:text-primary/80"
                    />
                  }}
                />
              </p>
              <p className="text-sm">{t('settings:instructions.steps.signUp')}</p>
              <p className="text-sm">{t('settings:instructions.steps.copyKey')}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('settings:apiKey.xssWarning')}
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

          <Separator />

          {/* API Usage Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <h3 className="text-lg font-semibold">{t('settings:apiKey.usage')}</h3>
              </div>
              <Button variant="outline" size="sm" onClick={fetchApiUsage} disabled={usageLoading}>
                {usageLoading ? t('common:loading') : t('common:refresh')}
              </Button>
            </div>

            {usageLoading ? (
              <div className="text-center py-4 text-muted-foreground">
{t('common:loading')} API usage information...
              </div>
            ) : (
              <div className="space-y-3">
                {apiUsages.length > 0 ? (
                  apiUsages.map((usage, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={usage.keyType === 'user' ? 'default' : 'secondary'}>
                            {usage.keyType === 'user' ? t('settings:status.yourKey') : t('settings:status.environmentKey')} {usage.apiKey}
                          </Badge>
                          {usage.isExhausted && (
                            <Badge variant="destructive">{t('settings:apiKey.exhausted')}</Badge>
                          )}
                          {usage.error && (
                            <Badge variant="outline" className="text-yellow-600">Error</Badge>
                          )}
                        </div>
                      </div>
                      
                      {usage.error ? (
                        <div className="text-sm text-muted-foreground">
                          Error: {usage.error}
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground mb-1">{t('settings:apiKey.monthlySearchesLeft')}</div>
                            <div className={`text-2xl font-bold ${usage.planSearchesLeft === 0 ? 'text-red-500' : usage.planSearchesLeft < 100 ? 'text-yellow-500' : 'text-green-500'}`}>
                              {usage.planSearchesLeft.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex-1 text-right">
                            <div className="text-sm text-muted-foreground mb-1">{t('settings:usage.usedThisMonth')}</div>
                            <div className="text-xl font-semibold text-muted-foreground">
                              {usage.thisMonthUsage.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        {t('settings:usage.lastChecked')}: {new Date(usage.lastChecked).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No API keys configured or unable to fetch usage information.
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Search Options Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <h3 className="text-lg font-semibold">{t('settings:searchOptions.title')}</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  {t('common:reset')}
                </Button>
                <Button size="sm" onClick={handleSaveFilters}>
                  {t('settings:searchOptions.saveOptions')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Engine Selection */}
              <div className="space-y-2">
                <Label htmlFor="engine" className="text-sm font-medium">
                  {t('settings:searchOptions.engine.label')}
                </Label>
                <Select
                  value={searchFilters.engine || 'google_images'}
                  onValueChange={(value: 'google_images' | 'google_images_light') => updateFilter('engine', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings:searchOptions.engine.placeholder')}>
                      {searchFilters.engine === 'google_images_light' ? t('settings:searchOptions.engine.googleImagesLight') : t('settings:searchOptions.engine.googleImages')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google_images_light">
                      <div className="flex flex-col">
                        <span>{t('settings:searchOptions.engine.googleImagesLight')}</span>
                        <span className="text-xs text-muted-foreground">{t('settings:searchOptions.engine.googleImagesLightDescription')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="google_images">
                      <div className="flex flex-col">
                        <span>{t('settings:searchOptions.engine.googleImages')}</span>
                        <span className="text-xs text-muted-foreground">{t('settings:searchOptions.engine.googleImagesDescription')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Licenses */}
              <div className="space-y-2">
                <Label htmlFor="licenses" className="text-sm font-medium">
                  {t('settings:searchOptions.licenses.label')}
                </Label>
                <Select
                  value={searchFilters.licenses || 'all'}
                  onValueChange={(value: string) => updateFilter('licenses', value === 'all' ? undefined : value as LicenseType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings:searchOptions.licenses.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('settings:searchOptions.licenses.options.all')}</SelectItem>
                    <SelectItem value="f">{t('settings:searchOptions.licenses.options.f')}</SelectItem>
                    <SelectItem value="fc">{t('settings:searchOptions.licenses.options.fc')}</SelectItem>
                    <SelectItem value="fm">{t('settings:searchOptions.licenses.options.fm')}</SelectItem>
                    <SelectItem value="fmc">{t('settings:searchOptions.licenses.options.fmc')}</SelectItem>
                    <SelectItem value="cl">{t('settings:searchOptions.licenses.options.cl')}</SelectItem>
                    <SelectItem value="ol">{t('settings:searchOptions.licenses.options.ol')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings:searchOptions.language.label')}</Label>
                <Select
                  value={searchFilters.hl || 'default'}
                  onValueChange={(value: string) => updateFilter('hl', value === 'default' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings:searchOptions.language.placeholder')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="default">{t('common:default')}</SelectItem>
                    {/* Popular languages first */}
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="zh-cn">Chinese (Simplified)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    {/* All other languages */}
                    {languages.filter(lang => 
                      !['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh-cn'].includes(lang.language_code)
                    ).map((lang) => (
                      <SelectItem key={lang.language_code} value={lang.language_code}>
                        {lang.language_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>{t('settings:searchOptions.startDate.label')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>{t('settings:datePicker.placeholder')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label htmlFor="aspect">{t('settings:searchOptions.aspect.label')}</Label>
                <Select
                  value={searchFilters.imgar || 'any'}
                  onValueChange={(value: string) => updateFilter('imgar', value === 'any' ? undefined : value as AspectRatio)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings:searchOptions.aspect.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('settings:searchOptions.aspect.any')}</SelectItem>
                    <SelectItem value="s">{t('settings:searchOptions.aspect.square')}</SelectItem>
                    <SelectItem value="t">{t('settings:searchOptions.aspect.tall')}</SelectItem>
                    <SelectItem value="w">{t('settings:searchOptions.aspect.wide')}</SelectItem>
                    <SelectItem value="xw">{t('settings:searchOptions.aspect.panoramic')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Size */}
              <div className="space-y-2">
                <Label htmlFor="size">{t('settings:searchOptions.size.label')}</Label>
                <Select
                  value={searchFilters.imgsz || 'any'}
                  onValueChange={(value: string) => updateFilter('imgsz', value === 'any' ? undefined : value as ImageSize)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings:searchOptions.size.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('settings:searchOptions.size.any')}</SelectItem>
                    <SelectItem value="i">{t('settings:searchOptions.size.icon')}</SelectItem>
                    <SelectItem value="m">{t('settings:searchOptions.size.medium')}</SelectItem>
                    <SelectItem value="l">{t('settings:searchOptions.size.large')}</SelectItem>
                    <SelectItem value="2mp">2MP</SelectItem>
                    <SelectItem value="4mp">4MP</SelectItem>
                    <SelectItem value="6mp">6MP</SelectItem>
                    <SelectItem value="8mp">8MP</SelectItem>
                    <SelectItem value="10mp">10MP</SelectItem>
                    <SelectItem value="12mp">12MP</SelectItem>
                    <SelectItem value="15mp">15MP</SelectItem>
                    <SelectItem value="20mp">20MP</SelectItem>
                    <SelectItem value="40mp">40MP</SelectItem>
                    <SelectItem value="70mp">70MP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Type */}
              <div className="space-y-2">
                <Label htmlFor="type">{t('settings:searchOptions.type.label')}</Label>
                <Select
                  value={searchFilters.image_type || 'any'}
                  onValueChange={(value: string) => updateFilter('image_type', value === 'any' ? undefined : value as ImageType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings:searchOptions.type.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('settings:searchOptions.type.any')}</SelectItem>
                    <SelectItem value="face">{t('settings:searchOptions.type.face')}</SelectItem>
                    <SelectItem value="photo">{t('settings:searchOptions.type.photo')}</SelectItem>
                    <SelectItem value="clipart">{t('settings:searchOptions.type.clipart')}</SelectItem>
                    <SelectItem value="lineart">{t('settings:searchOptions.type.lineart')}</SelectItem>
                    <SelectItem value="animated">{t('settings:searchOptions.type.animated')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Safe Search */}
              <div className="space-y-2">
                <Label>{t('settings:searchOptions.safeSearch.label')}</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="safe-search"
                    checked={searchFilters.safe !== 'off'}
                    onCheckedChange={(checked) => updateFilter('safe', checked ? 'active' : 'off')}
                  />
                  <Label htmlFor="safe-search" className="text-sm">
                    {t('settings:searchOptions.safeSearch.description')}
                  </Label>
                </div>
              </div>
          </div>

          <Separator />

          {/* Interface Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="text-lg font-semibold">{t('settings:interface.title')}</h3>
            </div>
            
            <LanguageSwitcher />
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}