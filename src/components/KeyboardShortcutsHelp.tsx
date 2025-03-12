"use client";

import { useState, useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Keyboard } from "lucide-react";

export function KeyboardShortcutsHelp() {
  const { settings, speakText } = useAccessibility();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("navigation");

  // Listen for the custom event to show keyboard shortcuts
  useEffect(() => {
    const handleShowShortcuts = () => {
      setOpen(true);
      if (settings.textToSpeech) {
        speakText("Keyboard shortcuts help dialog opened");
      }
    };

    document.addEventListener("show-keyboard-shortcuts", handleShowShortcuts);

    return () => {
      document.removeEventListener("show-keyboard-shortcuts", handleShowShortcuts);
    };
  }, [settings.textToSpeech, speakText]);

  // Auto-read content when tab changes
  useEffect(() => {
    if (open && settings.autoReadContent) {
      let tabContent = "";
      
      switch (activeTab) {
        case "navigation":
          tabContent = "Navigation shortcuts. These shortcuts help you navigate through the application.";
          break;
        case "accessibility":
          tabContent = "Accessibility shortcuts. These shortcuts allow you to toggle accessibility features.";
          break;
        case "content":
          tabContent = "Content shortcuts. These shortcuts help you interact with content on the page.";
          break;
      }
      
      speakText(tabContent);
    }
  }, [activeTab, open, settings.autoReadContent, speakText]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Keyboard className="h-6 w-6" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and control the application.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="navigation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Shortcuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + H</div>
                    <div>Go to Home page</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + D</div>
                    <div>Go to Dashboard</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + J</div>
                    <div>Go to Jobs</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + R</div>
                    <div>Go to Resources</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + P</div>
                    <div>Go to Profile</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Tab</div>
                    <div>Move to next focusable element</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Shift + Tab</div>
                    <div>Move to previous focusable element</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Shortcuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + A</div>
                    <div>Open Accessibility Settings</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + C</div>
                    <div>Toggle High Contrast Mode</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + T</div>
                    <div>Toggle Large Text Mode</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + M</div>
                    <div>Toggle Reduced Motion</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Alt + S</div>
                    <div>Toggle Text-to-Speech</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Ctrl + Shift + ?</div>
                    <div>Show this Keyboard Shortcuts Help</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Shortcuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-mono bg-muted p-1 rounded text-center">Ctrl + Shift + R</div>
                    <div>Read current page content</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Space</div>
                    <div>Activate buttons and links when focused</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Enter</div>
                    <div>Activate buttons, links, and form controls</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Escape</div>
                    <div>Close dialogs and menus</div>
                    
                    <div className="font-mono bg-muted p-1 rounded text-center">Arrow Keys</div>
                    <div>Navigate within components (tabs, menus, etc.)</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Press <span className="font-mono bg-muted p-1 rounded">Ctrl + Shift + ?</span> at any time to show this dialog.
        </div>
      </DialogContent>
    </Dialog>
  );
} 