"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Settings, Eye, Volume2, Keyboard, Brain } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAccessibility } from '@/context/AccessibilityContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AccessibilityWidget() {
  const router = useRouter();
  const { data: session } = useSession();
  const { settings, updateSettings } = useAccessibility();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (session) {
      router.push('/profile#accessibility');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="fixed bottom-6 right-6" style={{ zIndex: 9999 }}>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={session ? handleClick : undefined}
            aria-label="Accessibility Settings"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </DialogTrigger>
      
      {!session && (
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Accessibility Settings</DialogTitle>
            <DialogDescription>
              Customize your accessibility preferences. Sign in to save these settings permanently.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="visual">
                <Eye className="h-4 w-4 mr-2" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="audio">
                <Volume2 className="h-4 w-4 mr-2" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="interaction">
                <Keyboard className="h-4 w-4 mr-2" />
                Interaction
              </TabsTrigger>
              <TabsTrigger value="cognitive">
                <Brain className="h-4 w-4 mr-2" />
                Cognitive
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="large-text">Large Text</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase text size throughout the application
                    </p>
                  </div>
                  <Switch
                    id="large-text"
                    checked={settings.largeText}
                    onCheckedChange={(checked) => updateSettings({ largeText: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color-blind-mode">Color Blind Mode</Label>
                  <Select
                    value={settings.colorBlindMode}
                    onValueChange={(value: any) => updateSettings({ colorBlindMode: value })}
                  >
                    <SelectTrigger id="color-blind-mode">
                      <SelectValue placeholder="Select a mode" />
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
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="text-to-speech">Text to Speech</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable text-to-speech functionality
                    </p>
                  </div>
                  <Switch
                    id="text-to-speech"
                    checked={settings.textToSpeech}
                    onCheckedChange={(checked) => updateSettings({ textToSpeech: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-read">Auto-Read Content</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically read page content
                    </p>
                  </div>
                  <Switch
                    id="auto-read"
                    checked={settings.autoReadContent}
                    onCheckedChange={(checked) => updateSettings({ autoReadContent: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="interaction" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enhanced-keyboard">Enhanced Keyboard Navigation</Label>
                    <p className="text-sm text-muted-foreground">
                      Improve keyboard navigation and shortcuts
                    </p>
                  </div>
                  <Switch
                    id="enhanced-keyboard"
                    checked={settings.enhancedKeyboardNav}
                    onCheckedChange={(checked) => updateSettings({ enhancedKeyboardNav: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="speech-recognition">Speech Recognition</Label>
                    <p className="text-sm text-muted-foreground">
                      Control using voice commands
                    </p>
                  </div>
                  <Switch
                    id="speech-recognition"
                    checked={settings.speechRecognition}
                    onCheckedChange={(checked) => updateSettings({ speechRecognition: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cognitive" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Optimize content for screen readers
                    </p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => updateSettings({ screenReader: checked })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      )}
    </Dialog>
  );
} 