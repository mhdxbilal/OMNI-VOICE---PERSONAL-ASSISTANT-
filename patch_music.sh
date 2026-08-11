sed -i '/\/\/ Simulate timeline ticking when playing/i \  useEffect(() => {\n    setCurrentTime(0);\n  }, [currentTrack.id]);' src/components/MusicPlayerSection.tsx
