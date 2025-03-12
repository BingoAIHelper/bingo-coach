"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Mic, Eye, Volume2, MessageSquare, Settings, Palette } from 'lucide-react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  colorBlindMode: string;
  textToSpeech: boolean;
  speechToText: boolean;
  simplifiedUI: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  colorBlindMode: 'none',
  textToSpeech: false,
  speechToText: false,
  simplifiedUI: false,
};

export function AccessibilityWidget() {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const { speak, cancel, speaking } = useSpeechSynthesis();

  // Apply settings to document
  const applySettings = () => {
    // Font size
    document.documentElement.style.fontSize = `${settings.fontSize}%`;

    // High contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    // Color blind mode
    document.documentElement.setAttribute('data-color-blind-mode', settings.colorBlindMode);

    // Simplified UI
    if (settings.simplifiedUI) {
      document.documentElement.classList.add('simplified-ui');
    } else {
      document.documentElement.classList.remove('simplified-ui');
    }

    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    applySettings();
  }, []);

  // Update a single setting
  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      // Save and apply immediately
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
      return newSettings;
    });
    applySettings();
  };

  // Reset all settings to default
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
    applySettings();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 rounded-full h-12 w-12 z-50">
          <Settings className="h-6 w-6" />
          <span className="sr-only">Accessibility Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="visual">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="visual">
              <Eye className="h-4 w-4 mr-2" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Volume2 className="h-4 w-4 mr-2" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="input">
              <MessageSquare className="h-4 w-4 mr-2" />
              Input
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="font-size">Font Size ({settings.fontSize}%)</Label>
                <Slider
                  id="font-size"
                  min={75}
                  max={200}
                  step={5}
                  value={[settings.fontSize]}
                  onValueChange={(value: number[]) => updateSetting('fontSize', value[0])}
                  className="mt-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast">High Contrast</Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color-blind-mode">Color Blind Mode</Label>
                <Select
                  value={settings.colorBlindMode}
                  onValueChange={(value) => updateSetting('colorBlindMode', value)}
                >
                  <SelectTrigger id="color-blind-mode">
                    <SelectValue placeholder="Select a color blind mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
                    <SelectItem value="achromatopsia">Achromatopsia (Monochromacy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="simplified-ui">Simplified UI</Label>
                <Switch
                  id="simplified-ui"
                  checked={settings.simplifiedUI}
                  onCheckedChange={(checked) => updateSetting('simplifiedUI', checked)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="text-to-speech">Text to Speech</Label>
                <Switch
                  id="text-to-speech"
                  checked={settings.textToSpeech}
                  onCheckedChange={(checked) => updateSetting('textToSpeech', checked)}
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label>Test Text to Speech</Label>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => speak({ text: 'This is a test of the text to speech feature on the Bingo Job Coach Platform.' })}
                    disabled={speaking}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Speak Test
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => cancel()}
                    disabled={!speaking}
                  >
                    Stop
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="input" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="speech-to-text">Speech to Text</Label>
                <Switch
                  id="speech-to-text"
                  checked={settings.speechToText}
                  onCheckedChange={(checked) => updateSetting('speechToText', checked)}
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label>Communication Preferences</Label>
                <Select defaultValue="text">
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred communication method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="asl">American Sign Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={resetSettings}>
            Reset to Default
          </Button>
          <Button onClick={applySettings}>
            Apply Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 