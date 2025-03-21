import { useState, useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AccessibilityOnboarding() {
  const { settings, updateSettings } = useAccessibility();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if it hasn't been completed
    if (!settings.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [settings.onboardingCompleted]);

  const handleComplete = () => {
    updateSettings({ ...settings, onboardingCompleted: true });
    setShowOnboarding(false);
  };

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <CardTitle>Accessibility Settings</CardTitle>
          <CardDescription>
            Let's customize your experience to meet your accessibility needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="textToSpeech">Screen Reader Support</Label>
              <Switch
                id="textToSpeech"
                checked={settings.textToSpeech}
                onCheckedChange={(checked) => updateSettings({ ...settings, textToSpeech: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Slider
                id="fontSize"
                min={12}
                max={24}
                step={1}
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSettings({ ...settings, fontSize: value })}
              />
              <div className="text-sm text-muted-foreground">
                Current size: {settings.fontSize}px
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrast">Contrast Level</Label>
              <Select
                value={settings.contrast}
                onValueChange={(value) => updateSettings({ ...settings, contrast: value })}
              >
                <SelectTrigger id="contrast">
                  <SelectValue placeholder="Select contrast level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="inverted">Inverted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoRead">Auto-read Content</Label>
              <Switch
                id="autoRead"
                checked={settings.autoReadContent}
                onCheckedChange={(checked) => updateSettings({ ...settings, autoReadContent: checked })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleComplete}>
            Complete Setup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 