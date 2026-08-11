sed -i '/const \[isSpeakingResponse, setIsSpeakingResponse\] = useState(false);/a \  const [actionStatus, setActionStatus] = useState<string | null>(null);' src/components/VoiceAssistantOrb.tsx
sed -i "s/alert('Action confirmed by user.')/setActionStatus('Confirmed')/g" src/components/VoiceAssistantOrb.tsx
sed -i "s/alert('Action cancelled.')/setActionStatus('Cancelled')/g" src/components/VoiceAssistantOrb.tsx
