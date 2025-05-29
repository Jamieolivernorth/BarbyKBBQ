import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFeatureFlags, setFeatureFlag, type FeatureFlags } from "@shared/config/feature-flags";

export default function FeatureFlagsAdmin() {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());
  const { toast } = useToast();

  const featureDescriptions = {
    aiShopping: "AI Shopping Assistant - Complete AI-powered shopping experience",
    aiRecommendations: "AI BBQ Recommendations - Personalized package suggestions",
    aiAssistant: "AI Chat Assistant - Real-time booking help",
    aiMenuGenerator: "AI Menu Generator - Custom BBQ menu creation",
    aiBookingAnalyzer: "AI Booking Analyzer - Booking improvement suggestions",
    weatherWidget: "Weather Widget - Real-time weather information",
    affiliateSystem: "Affiliate System - Referral link management",
    beachCleanupContribution: "Beach Cleanup Contribution - Environmental support option",
    cryptoPayments: "Cryptocurrency Payments - Accept crypto payments",
    socialSharing: "Social Sharing - Share bookings on social media"
  };

  const handleToggle = (feature: keyof FeatureFlags, enabled: boolean) => {
    setFeatureFlag(feature, enabled);
    setFlags(prev => ({ ...prev, [feature]: enabled }));
    
    toast({
      title: "Feature Updated",
      description: `${feature} has been ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const resetToDefaults = () => {
    // Reset all flags to their default values
    const defaultFlags = getFeatureFlags();
    Object.keys(defaultFlags).forEach(key => {
      setFeatureFlag(key as keyof FeatureFlags, defaultFlags[key as keyof FeatureFlags]);
    });
    setFlags(defaultFlags);
    
    toast({
      title: "Reset Complete",
      description: "All feature flags have been reset to default values",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-gray-600">Control which features are available to users</p>
        </div>
        <Button onClick={resetToDefaults} variant="outline">
          Reset to Defaults
        </Button>
      </div>

      <div className="grid gap-4">
        {Object.entries(featureDescriptions).map(([feature, description]) => (
          <Card key={feature}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={feature}
                    checked={flags[feature as keyof FeatureFlags]}
                    onCheckedChange={(checked) => 
                      handleToggle(feature as keyof FeatureFlags, checked)
                    }
                  />
                  <Label htmlFor={feature} className="sr-only">
                    Toggle {feature}
                  </Label>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Important Notes
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>AI features require valid OpenAI API credentials and sufficient quota</li>
                  <li>Weather widget requires OpenWeatherMap API key</li>
                  <li>Changes take effect immediately for new page loads</li>
                  <li>Feature flags are stored in browser localStorage</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}