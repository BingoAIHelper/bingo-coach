"use client";

import { useState, useEffect, useRef } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { getSpeechRecognition, VOICE_COMMANDS } from "@/utils/speechRecognition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Ear, MousePointer, Monitor, Volume2, Mic, MicOff, HelpCircle } from "lucide-react";

export function AccessibilityOnboarding() {
  const { settings, updateSettings, speakText, stopSpeaking } = useAccessibility();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("visual");
  const [isListening, setIsListening] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (settings.speechRecognition && typeof window !== 'undefined') {
      const speechRecognition = getSpeechRecognition();
      
      // Set up voice commands
      speechRecognition.addCommand(VOICE_COMMANDS.NEXT, () => {
        if (activeTab === "visual") setActiveTab("hearing");
        else if (activeTab === "hearing") setActiveTab("motor");
        else if (activeTab === "motor") setActiveTab("cognitive");
        else if (activeTab === "cognitive") handleComplete();
      }, true);
      
      speechRecognition.addCommand(VOICE_COMMANDS.PREVIOUS, () => {
        if (activeTab === "hearing") setActiveTab("visual");
        else if (activeTab === "motor") setActiveTab("hearing");
        else if (activeTab === "cognitive") setActiveTab("motor");
      }, true);
      
      speechRecognition.addCommand(VOICE_COMMANDS.SUBMIT, () => {
        handleComplete();
      }, true);
      
      speechRecognition.addCommand(VOICE_COMMANDS.CANCEL, () => {
        handleSkip();
      }, true);
      
      speechRecognition.addCommand(VOICE_COMMANDS.HELP, () => {
        setShowHelp(true);
        speakText("Available voice commands: next, previous, submit, cancel, help, high contrast, large text, reduced motion, screen reader");
      }, true);
      
      speechRecognition.addCommand(VOICE_COMMANDS.HIGH_CONTRAST, () => {
        updateSettings({ highContrast: !settings.highContrast });
        speakText(`High contrast mode ${!settings.highContrast ? 'enabled' : 'disabled'}`);
      }, true);
      
      speechRecognition.addCommand(VOICE_COMMANDS.LARGE_TEXT, () => {
        updateSettings({ largeText: !settings.largeText });
        speakText(`Large text mode ${!settings.largeText ? 'enabled' : 'disabled'}`);
      }, true);
      
      speechRecognition.onStart(() => {
        setIsListening(true);
      });
      
      speechRecognition.onEnd(() => {
        setIsListening(false);
      });
      
      // Start listening if speech recognition is enabled
      if (settings.speechRecognition) {
        speechRecognition.start();
      }
      
      return () => {
        speechRecognition.stop();
      };
    }
  }, [settings.speechRecognition, activeTab, settings.highContrast, settings.largeText, updateSettings, speakText]);

  // Auto-read content when dialog opens
  useEffect(() => {
    if (open && settings.autoReadContent) {
      const welcomeText = "Welcome to Bingo! Let's customize your experience to meet your accessibility needs. These settings can be changed later in your profile.";
      speakText(welcomeText);
    }
    
    return () => {
      stopSpeaking();
    };
  }, [open, settings.autoReadContent, speakText, stopSpeaking]);

  // Auto-read content when tab changes
  useEffect(() => {
    if (open && settings.autoReadContent) {
      let tabContent = "";
      
      switch (activeTab) {
        case "visual":
          tabContent = "Visual Preferences. Adjust how content is displayed to improve visibility and readability. Options include high contrast, large text, and color blind mode.";
          break;
        case "hearing":
          tabContent = "Hearing Preferences. Adjust how audio content is presented. Options include automatic captions and visual alerts.";
          break;
        case "motor":
          tabContent = "Motor Preferences. Adjust how you interact with the application. Options include reduced motion and enhanced keyboard navigation.";
          break;
        case "cognitive":
          tabContent = "Cognitive Preferences. Adjust how content is organized and presented. Options include screen reader support and simplified interface.";
          break;
      }
      
      speakText(tabContent);
    }
  }, [activeTab, open, settings.autoReadContent, speakText]);

  // Show the modal if the user hasn't completed onboarding
  useEffect(() => {
    if (!settings.hasCompletedOnboarding) {
      setOpen(true);
    }
  }, [settings.hasCompletedOnboarding]);

  const handleComplete = () => {
    updateSettings({ hasCompletedOnboarding: true });
    setOpen(false);
    speakText("Accessibility settings saved. You can change these settings at any time by clicking the accessibility button in the bottom right corner.");
  };

  const handleSkip = () => {
    // Mark as completed but don't save any settings
    updateSettings({ hasCompletedOnboarding: true });
    setOpen(false);
    speakText("Accessibility setup skipped. You can configure accessibility settings at any time by clicking the accessibility button in the bottom right corner.");
  };

  const toggleSpeechRecognition = () => {
    const newValue = !settings.speechRecognition;
    updateSettings({ speechRecognition: newValue });
    
    const speechRecognition = getSpeechRecognition();
    if (newValue) {
      speechRecognition.start();
      speakText("Speech recognition enabled. You can now use voice commands.");
    } else {
      speechRecognition.stop();
      speakText("Speech recognition disabled.");
    }
  };

  const toggleAutoReadContent = () => {
    const newValue = !settings.autoReadContent;
    updateSettings({ autoReadContent: newValue });
    
    if (newValue) {
      speakText("Automatic reading enabled. Content will be read aloud.");
    } else {
      speakText("Automatic reading disabled.");
      stopSpeaking();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        if (activeTab === "visual") setActiveTab("hearing");
        else if (activeTab === "hearing") setActiveTab("motor");
        else if (activeTab === "motor") setActiveTab("cognitive");
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        if (activeTab === "hearing") setActiveTab("visual");
        else if (activeTab === "motor") setActiveTab("hearing");
        else if (activeTab === "cognitive") setActiveTab("motor");
        e.preventDefault();
        break;
      case 'Enter':
        if (document.activeElement === document.querySelector('[data-save-button]')) {
          handleComplete();
        } else if (document.activeElement === document.querySelector('[data-skip-button]')) {
          handleSkip();
        }
        break;
      case 'Escape':
        // Don't close the dialog if it's the initial onboarding
        if (settings.hasCompletedOnboarding) {
          setOpen(false);
        }
        break;
      case 'h':
        if (e.ctrlKey || e.metaKey) {
          setShowHelp(true);
          e.preventDefault();
        }
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
        ref={dialogRef}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Welcome to Bingo!
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2" 
              onClick={toggleAutoReadContent}
              aria-label={settings.autoReadContent ? "Disable automatic reading" : "Enable automatic reading"}
            >
              <Volume2 className={`h-5 w-5 ${settings.autoReadContent ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSpeechRecognition}
              aria-label={isListening ? "Disable voice commands" : "Enable voice commands"}
            >
              {isListening ? (
                <Mic className="h-5 w-5 text-primary" />
              ) : (
                <MicOff className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowHelp(true)}
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Let's customize your experience to meet your accessibility needs. These settings can be changed later in your profile.
          </DialogDescription>
        </DialogHeader>

        {showHelp ? (
          <div className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard and Voice Commands</CardTitle>
                <CardDescription>
                  You can navigate this dialog using keyboard or voice commands.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Keyboard Commands:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Tab: Navigate between elements</li>
                    <li>Arrow Right/Down: Move to next tab</li>
                    <li>Arrow Left/Up: Move to previous tab</li>
                    <li>Enter: Select or activate focused element</li>
                    <li>Escape: Close dialog (if not initial setup)</li>
                    <li>Ctrl+H: Show this help</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Voice Commands:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>"Next": Move to next tab</li>
                    <li>"Previous": Move to previous tab</li>
                    <li>"Submit": Save settings</li>
                    <li>"Cancel": Skip setup</li>
                    <li>"Help": Show this help</li>
                    <li>"High Contrast": Toggle high contrast mode</li>
                    <li>"Large Text": Toggle large text mode</li>
                    <li>"Reduced Motion": Toggle reduced motion</li>
                    <li>"Screen Reader": Toggle screen reader optimization</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setShowHelp(false)}>Close Help</Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="visual" className="flex flex-col items-center gap-2 py-3">
                  <Eye className="h-5 w-5" />
                  <span>Visual</span>
                </TabsTrigger>
                <TabsTrigger value="hearing" className="flex flex-col items-center gap-2 py-3">
                  <Ear className="h-5 w-5" />
                  <span>Hearing</span>
                </TabsTrigger>
                <TabsTrigger value="motor" className="flex flex-col items-center gap-2 py-3">
                  <MousePointer className="h-5 w-5" />
                  <span>Motor</span>
                </TabsTrigger>
                <TabsTrigger value="cognitive" className="flex flex-col items-center gap-2 py-3">
                  <Monitor className="h-5 w-5" />
                  <span>Cognitive</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Visual Preferences</CardTitle>
                    <CardDescription>
                      Adjust how content is displayed to improve visibility and readability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="high-contrast">High Contrast</Label>
                        <p className="text-sm text-muted-foreground">
                          Increase contrast between text and background
                        </p>
                      </div>
                      <Switch 
                        id="high-contrast" 
                        checked={settings.highContrast}
                        onCheckedChange={(checked) => {
                          updateSettings({ highContrast: checked });
                          speakText(`High contrast mode ${checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="large-text">Large Text</Label>
                        <p className="text-sm text-muted-foreground">
                          Increase text size throughout the application
                        </p>
                      </div>
                      <Switch 
                        id="large-text" 
                        checked={settings.largeText}
                        onCheckedChange={(checked) => {
                          updateSettings({ largeText: checked });
                          speakText(`Large text mode ${checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="color-blind-mode">Color Blind Mode</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Adjust colors for different types of color blindness
                      </p>
                      <select 
                        id="color-blind-mode"
                        className="w-full p-2 border rounded-md"
                        value={settings.colorBlindMode}
                        onChange={(e) => {
                          const value = e.target.value as "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
                          updateSettings({ colorBlindMode: value });
                          speakText(`Color blind mode set to ${value}`);
                        }}
                      >
                        <option value="none">None</option>
                        <option value="protanopia">Protanopia (Red-Blind)</option>
                        <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                        <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                        <option value="achromatopsia">Achromatopsia (Monochromacy)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hearing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Hearing Preferences</CardTitle>
                    <CardDescription>
                      Adjust how audio content is presented.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="text-to-speech">Text-to-Speech</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable text-to-speech for reading content aloud
                        </p>
                      </div>
                      <Switch 
                        id="text-to-speech" 
                        checked={settings.textToSpeech}
                        onCheckedChange={(checked) => {
                          updateSettings({ textToSpeech: checked });
                          if (checked) {
                            speakText("Text-to-speech enabled");
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-read">Auto-Read Content</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically read page content when it loads
                        </p>
                      </div>
                      <Switch 
                        id="auto-read" 
                        checked={settings.autoReadContent}
                        onCheckedChange={(checked) => {
                          updateSettings({ autoReadContent: checked });
                          speakText(`Automatic reading ${checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="captions">Automatic Captions</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable captions for video content
                        </p>
                      </div>
                      <Switch 
                        id="captions" 
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="visual-alerts">Visual Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Show visual cues for audio alerts
                        </p>
                      </div>
                      <Switch 
                        id="visual-alerts" 
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="motor" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Motor Preferences</CardTitle>
                    <CardDescription>
                      Adjust how you interact with the application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="reduced-motion">Reduced Motion</Label>
                        <p className="text-sm text-muted-foreground">
                          Minimize animations and transitions
                        </p>
                      </div>
                      <Switch 
                        id="reduced-motion" 
                        checked={settings.reducedMotion}
                        onCheckedChange={(checked) => {
                          updateSettings({ reducedMotion: checked });
                          speakText(`Reduced motion ${checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enhanced-keyboard">Enhanced Keyboard Navigation</Label>
                        <p className="text-sm text-muted-foreground">
                          Improve keyboard focus indicators and shortcuts
                        </p>
                      </div>
                      <Switch 
                        id="enhanced-keyboard" 
                        checked={settings.enhancedKeyboardNav}
                        onCheckedChange={(checked) => {
                          updateSettings({ enhancedKeyboardNav: checked });
                          speakText(`Enhanced keyboard navigation ${checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="speech-recognition">Speech Recognition</Label>
                        <p className="text-sm text-muted-foreground">
                          Control the application using voice commands
                        </p>
                      </div>
                      <Switch 
                        id="speech-recognition" 
                        checked={settings.speechRecognition}
                        onCheckedChange={(checked) => {
                          updateSettings({ speechRecognition: checked });
                          speakText(`Speech recognition ${checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cognitive" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cognitive Preferences</CardTitle>
                    <CardDescription>
                      Adjust how content is organized and presented.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="screen-reader">Screen Reader Support</Label>
                        <p className="text-sm text-muted-foreground">
                          Optimize content for screen readers
                        </p>
                      </div>
                      <Switch 
                        id="screen-reader" 
                        checked={settings.screenReader}
                        onCheckedChange={(checked) => {
                          updateSettings({ screenReader: checked });
                          speakText(`Screen reader optimization ${checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="simplified-interface">Simplified Interface</Label>
                        <p className="text-sm text-muted-foreground">
                          Reduce visual complexity and distractions
                        </p>
                      </div>
                      <Switch 
                        id="simplified-interface" 
                        checked={false}
                        onCheckedChange={() => {}}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            data-skip-button
          >
            Skip for now
          </Button>
          <Button 
            onClick={handleComplete}
            data-save-button
          >
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 