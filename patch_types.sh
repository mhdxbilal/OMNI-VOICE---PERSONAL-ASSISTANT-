sed -i 's/downloadModel: (url: string, title: string, description: string) => void;/&\n      openAssistantSettings: () => void;\n      openAccessibilitySettings: () => void;/g' src/types.ts
