"use client";

import { useState, useEffect, useRef } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { getSpeechRecognition, VOICE_COMMANDS } from "@/utils/speechRecognition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogOverlay } from "@/components/ui/dialog";
import { Accessibility, Eye, Ear, MousePointer, Monitor, Volume2, Mic, MicOff, HelpCircle, Keyboard, X } from "lucide-react";

export function AccessibilityButton() {
  const { settings, updateSettings, speakText, stopSpeaking } = useAccessibility();
  const [activeTab, setActiveTab] = useState("visual");
  const [isListening, setIsListening] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (settings.speechRecognition && typeof window !== 'undefined') {
      const speechRecognition = getSpeechRecognition();
      
      // Set up voice commands
      speechRecognition.addCommand(VOICE_COMMANDS.NEXT, () => {
        if (activeTab === "visual") setActiveTab("hearing");
        else if (activeTab === "hearing") setActiveTab("motor");
        else if (activeTab === "motor") setActiveTab("cognitive");
      }, true);
      
      speechRecognition.addCommand(VOICE_COMMANDS.PREVIOUS, () => {
        if (activeTab === "hearing") setActiveTab("visual");
        else if (activeTab === "motor") setActiveTab("hearing");
        else if (activeTab === "cognitive") setActiveTab("motor");
      }, true);
      
      speechRecognition.addCommand(VOICE_COMMANDS.SUBMIT, () => {
        setOpen(false);
        speakText("Settings saved");
      }, true);
      
      speechRecognition.addCommand(VOICE_COMMANDS.CANCEL, () => {
        setOpen(false);
        speakText("Settings dialog closed");
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
  }, [settings.speechRecognition, activeTab, settings.highContrast, settings.largeText, updateSettings, speakText, open]);

  // Auto-read content when dialog opens
  useEffect(() => {
    if (open && settings.autoReadContent) {
      const welcomeText = "Accessibility Settings. Customize your experience to meet your accessibility needs.";
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
          tabContent = "Hearing Preferences. Adjust how audio content is presented. Options include text-to-speech, automatic captions, and visual alerts.";
          break;
        case "motor":
          tabContent = "Motor Preferences. Adjust how you interact with the application. Options include reduced motion, enhanced keyboard navigation, and speech recognition.";
          break;
        case "cognitive":
          tabContent = "Cognitive Preferences. Adjust how content is organized and presented. Options include screen reader support and simplified interface.";
          break;
      }
      
      speakText(tabContent);
    }
  }, [activeTab, open, settings.autoReadContent, speakText]);

  // Listen for custom event to toggle the dialog
  useEffect(() => {
    const handleToggleDialog = () => {
      setOpen(prevOpen => !prevOpen);
      if (!open && settings.textToSpeech) {
        speakText("Accessibility settings opened");
      }
    };

    document.addEventListener("toggle-accessibility-dialog", handleToggleDialog);

    return () => {
      document.removeEventListener("toggle-accessibility-dialog", handleToggleDialog);
    };
  }, [open, settings.textToSpeech, speakText]);

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

  // Handle keyboard navigation and focus management
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle tab key for focus trapping
    if (e.key === 'Tab') {
      if (!e.shiftKey && document.activeElement === lastFocusableRef.current) {
        e.preventDefault();
        firstFocusableRef.current?.focus();
      } else if (e.shiftKey && document.activeElement === firstFocusableRef.current) {
        e.preventDefault();
        lastFocusableRef.current?.focus();
      }
      return;
    }

    // Handle arrow keys for tab navigation
    const tabOrder = ["visual", "hearing", "motor", "cognitive"];
    const currentIndex = tabOrder.indexOf(activeTab);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabOrder.length;
      setActiveTab(tabOrder[nextIndex]);
      
      // Focus the newly selected tab
      const nextTab = dialogRef.current?.querySelector(`[value="${tabOrder[nextIndex]}"]`) as HTMLElement;
      nextTab?.focus();
      
      // Announce tab change for screen readers
      if (settings.screenReader) {
        speakText(`${tabOrder[nextIndex]} preferences tab`);
      }
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
      setActiveTab(tabOrder[prevIndex]);
      
      // Focus the newly selected tab
      const prevTab = dialogRef.current?.querySelector(`[value="${tabOrder[prevIndex]}"]`) as HTMLElement;
      prevTab?.focus();
      
      // Announce tab change for screen readers
      if (settings.screenReader) {
        speakText(`${tabOrder[prevIndex]} preferences tab`);
      }
    }

    // Handle other keyboard shortcuts
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        if (settings.screenReader) {
          speakText("Closing accessibility settings");
        }
        break;

      case 'h':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setShowHelp(prev => !prev);
          if (settings.screenReader) {
            speakText(showHelp ? 'Closing help guide' : 'Opening help guide');
          }
        }
        break;

      case ' ':
      case 'Enter':
        // Handle activation of interactive elements
        if (document.activeElement?.getAttribute('role') === 'tab') {
          e.preventDefault();
          (document.activeElement as HTMLElement).click();
        } else if (document.activeElement?.tagName.toLowerCase() === 'button') {
          e.preventDefault();
          (document.activeElement as HTMLElement).click();
        }
        break;
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 shadow-lg"
              aria-label="Accessibility Settings"
              onClick={() => {
                if (settings.textToSpeech) {
                  speakText("Accessibility settings opened");
                }
              }}
            >
              <Accessibility className="h-6 w-6" />
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
          className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6"
          onKeyDown={handleKeyDown}
          ref={dialogRef}
          aria-labelledby="accessibility-dialog-title"
          role="dialog"
        >
          <DialogHeader className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle id="accessibility-dialog-title" className="text-2xl font-bold">
                Accessibility Settings
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleAutoReadContent}
                  aria-label={settings.autoReadContent ? "Disable automatic reading" : "Enable automatic reading"}
                  className="rounded-full hover:bg-accent"
                >
                  <Volume2 className={`h-5 w-5 ${settings.autoReadContent ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSpeechRecognition}
                  aria-label={isListening ? "Disable voice commands" : "Enable voice commands"}
                  className="rounded-full hover:bg-accent"
                >
                  {isListening ? (
                    <Mic className="h-5 w-5 text-primary" />
                  ) : (
                    <MicOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowHelp(true)}
                  aria-label="Show accessibility help"
                  className="rounded-full hover:bg-accent"
                >
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <DialogDescription className="text-lg">
              Customize your experience to meet your accessibility needs.
            </DialogDescription>
          </DialogHeader>

          {showHelp ? (
            <div className="py-6" role="region" aria-label="Accessibility Help">
              <Card className="border-2">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <HelpCircle className="h-6 w-6" />
                    Accessibility Commands Guide
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Navigate and control settings using keyboard or voice commands.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard Navigation
                      </h3>
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <ul className="space-y-3" role="list">
                          {[
                            { key: 'Tab', action: 'Navigate between elements' },
                            { key: '→/↓', action: 'Move to next tab' },
                            { key: '←/↑', action: 'Move to previous tab' },
                            { key: 'Enter/Space', action: 'Activate focused element' },
                            { key: 'Escape', action: 'Close dialog' },
                            { key: 'Ctrl+H', action: 'Show/hide this help' }
                          ].map(({ key, action }) => (
                            <li key={key} className="flex items-center gap-2">
                              <kbd className="px-2 py-1 bg-background rounded border shadow-sm min-w-[3rem] text-center">
                                {key}
                              </kbd>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Mic className="h-5 w-5" />
                        Voice Commands
                      </h3>
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <ul className="space-y-3" role="list">
                          {[
                            { command: 'Next/Previous', action: 'Navigate tabs' },
                            { command: 'Submit/Cancel', action: 'Save or close' },
                            { command: 'Help', action: 'Show this guide' },
                            { command: 'High Contrast', action: 'Toggle contrast' },
                            { command: 'Large Text', action: 'Toggle text size' },
                            { command: 'Screen Reader', action: 'Toggle optimization' }
                          ].map(({ command, action }) => (
                            <li key={command} className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-background rounded border shadow-sm min-w-[8rem]">
                                "{command}"
                              </span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-4">
                  <Button
                    onClick={() => setShowHelp(false)}
                    className="flex items-center gap-2"
                    aria-label="Close help guide"
                  >
                    <X className="h-4 w-4" />
                    Close Guide
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="py-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-8"
                aria-label="Accessibility preference categories"
              >
                <div className="relative">
                  <TabsList
                    className="w-full grid grid-cols-4 gap-2 p-2 bg-muted rounded-xl"
                    aria-label="Select accessibility category"
                  >
                    <TabsTrigger
                      value="visual"
                      className="flex flex-col items-center gap-2 py-3 px-2 h-[72px] data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
                      aria-label="Visual preferences"
                    >
                      <Eye className="h-5 w-5" />
                      <span className="font-medium text-sm">Visual</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="hearing"
                      className="flex flex-col items-center gap-2 py-3 px-2 h-[72px] data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
                      aria-label="Hearing preferences"
                    >
                      <Ear className="h-5 w-5" />
                      <span className="font-medium text-sm">Hearing</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="motor"
                      className="flex flex-col items-center gap-2 py-3 px-2 h-[72px] data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
                      aria-label="Motor preferences"
                    >
                      <MousePointer className="h-5 w-5" />
                      <span className="font-medium text-sm">Motor</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="cognitive"
                      className="flex flex-col items-center gap-2 py-3 px-2 h-[72px] data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
                      aria-label="Cognitive preferences"
                    >
                      <Monitor className="h-5 w-5" />
                      <span className="font-medium text-sm">Cognitive</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

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
                          <Label htmlFor="high-contrast-settings">High Contrast</Label>
                          <p className="text-sm text-muted-foreground">
                            Increase contrast between text and background
                          </p>
                        </div>
                        <Switch 
                          id="high-contrast-settings" 
                          checked={settings.highContrast}
                          onCheckedChange={(checked) => {
                            updateSettings({ highContrast: checked });
                            speakText(`High contrast mode ${checked ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="large-text-settings">Large Text</Label>
                          <p className="text-sm text-muted-foreground">
                            Increase text size throughout the application
                          </p>
                        </div>
                        <Switch 
                          id="large-text-settings" 
                          checked={settings.largeText}
                          onCheckedChange={(checked) => {
                            updateSettings({ largeText: checked });
                            speakText(`Large text mode ${checked ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="color-blind-mode-settings">Color Blind Mode</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Adjust colors for different types of color blindness
                        </p>
                        <select 
                          id="color-blind-mode-settings"
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
                          <Label htmlFor="text-to-speech-settings">Text-to-Speech</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable text-to-speech for reading content aloud
                          </p>
                        </div>
                        <Switch 
                          id="text-to-speech-settings" 
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
                          <Label htmlFor="auto-read-settings">Auto-Read Content</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically read page content when it loads
                          </p>
                        </div>
                        <Switch 
                          id="auto-read-settings" 
                          checked={settings.autoReadContent}
                          onCheckedChange={(checked) => {
                            updateSettings({ autoReadContent: checked });
                            speakText(`Automatic reading ${checked ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="captions-settings">Automatic Captions</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable captions for video content
                          </p>
                        </div>
                        <Switch 
                          id="captions-settings" 
                          checked={true}
                          onCheckedChange={() => {}}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="visual-alerts-settings">Visual Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Show visual cues for audio alerts
                          </p>
                        </div>
                        <Switch 
                          id="visual-alerts-settings" 
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
                          <Label htmlFor="reduced-motion-settings">Reduced Motion</Label>
                          <p className="text-sm text-muted-foreground">
                            Minimize animations and transitions
                          </p>
                        </div>
                        <Switch 
                          id="reduced-motion-settings" 
                          checked={settings.reducedMotion}
                          onCheckedChange={(checked) => {
                            updateSettings({ reducedMotion: checked });
                            speakText(`Reduced motion ${checked ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enhanced-keyboard-settings">Enhanced Keyboard Navigation</Label>
                          <p className="text-sm text-muted-foreground">
                            Improve keyboard focus indicators and shortcuts
                          </p>
                        </div>
                        <Switch 
                          id="enhanced-keyboard-settings" 
                          checked={settings.enhancedKeyboardNav}
                          onCheckedChange={(checked) => {
                            updateSettings({ enhancedKeyboardNav: checked });
                            speakText(`Enhanced keyboard navigation ${checked ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="speech-recognition-settings">Speech Recognition</Label>
                          <p className="text-sm text-muted-foreground">
                            Control the application using voice commands
                          </p>
                        </div>
                        <Switch 
                          id="speech-recognition-settings" 
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
                          <Label htmlFor="screen-reader-settings">Screen Reader Support</Label>
                          <p className="text-sm text-muted-foreground">
                            Optimize content for screen readers
                          </p>
                        </div>
                        <Switch 
                          id="screen-reader-settings" 
                          checked={settings.screenReader}
                          onCheckedChange={(checked) => {
                            updateSettings({ screenReader: checked });
                            speakText(`Screen reader optimization ${checked ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="simplified-interface-settings">Simplified Interface</Label>
                          <p className="text-sm text-muted-foreground">
                            Reduce visual complexity and distractions
                          </p>
                        </div>
                        <Switch 
                          id="simplified-interface-settings" 
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

          <div className="flex justify-end mt-4">
            <Button onClick={() => {
              setOpen(false);
              speakText("Settings saved");
            }}>
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 