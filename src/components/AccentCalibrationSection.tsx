import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Mic,
  CheckCircle2,
  Sparkles,
  Zap,
  Volume2,
  RefreshCw,
  Globe,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { VoiceAccentProfile } from '../types';

interface AccentCalibrationSectionProps {
  profiles: VoiceAccentProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCalibrateProfile: (id: string, newAccuracy: number) => void;
}

export const AccentCalibrationSection: React.FC<AccentCalibrationSectionProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCalibrateProfile,
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [pitchSensitivity, setPitchSensitivity] = useState(75);
  const [noiseSuppression, setNoiseSuppression] = useState(true);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedText('');
    setTimeout(() => {
      setIsRecording(false);
      setRecordedText(
        step === 1 ? activeProfile.samplePhraseMl : activeProfile.samplePhraseEn
      );
    }, 2500);
  };

  const handleFinishCalibration = () => {
    const updatedScore = Math.min(99.4, Number((activeProfile.accuracyScore + 1.2).toFixed(1)));
    onCalibrateProfile(activeProfile.id, updatedScore);
    setIsWizardOpen(false);
    setStep(1);
    setRecordedText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Voice Recognition & Accent Calibration Engine
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Customizes phoneme acoustic models to recognize specific user accents (e.g. Malayalam-English, South Asian) with up to 99% accuracy.
          </p>
        </div>

        <button
          id="open-wizard-btn"
          onClick={() => {
            setIsWizardOpen(true);
            setStep(1);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Calibrate My Accent</span>
        </button>
      </div>

      {/* Active Accent Profile Display */}
      {activeProfile && (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Accent Profile
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {activeProfile.region}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1">{activeProfile.name}</h3>
            </div>

            <div className="text-right bg-slate-900/90 px-5 py-3 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Accent Precision Score</p>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                {activeProfile.accuracyScore}%
              </p>
            </div>
          </div>

          {/* Sample Phonetic Calibration Phrases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <p className="text-xs text-slate-400 mb-1 font-medium">Malayalam Phonetic Test Phrase</p>
              <p className="text-sm font-sans font-medium text-emerald-200">
                "{activeProfile.samplePhraseMl}"
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <p className="text-xs text-slate-400 mb-1 font-medium">English Accent Test Phrase</p>
              <p className="text-sm font-medium text-indigo-200">
                "{activeProfile.samplePhraseEn}"
              </p>
            </div>
          </div>

          {/* Fine-Tuning Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">Pitch & Formant Sensitivity</span>
                <span className="font-mono text-indigo-300">{pitchSensitivity}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={pitchSensitivity}
                onChange={(e) => setPitchSensitivity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div>
                <p className="text-xs font-semibold text-white">Background Noise Suppression</p>
                <p className="text-[11px] text-slate-400">Filter background chatter & ambient noise</p>
              </div>
              <button
                id="noise-toggle-btn"
                onClick={() => setNoiseSuppression(!noiseSuppression)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  noiseSuppression
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {noiseSuppression ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Regional Accent Profiles Grid */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Preset Regional Accent Profiles</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => {
            const isSelected = profile.id === activeProfileId;
            return (
              <div
                key={profile.id}
                id={`profile-card-${profile.id}`}
                onClick={() => onSelectProfile(profile.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500/60 shadow-lg'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">{profile.name}</h4>
                      {profile.isCalibrated && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Calibrated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{profile.region}</p>
                  </div>

                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {profile.accuracyScore}%
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 italic truncate max-w-[200px]">
                    "{profile.samplePhraseMl}"
                  </span>
                  <button
                    id={`select-prof-${profile.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProfile(profile.id);
                    }}
                    className={`px-3 py-1 rounded-xl font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {isSelected ? 'Active' : 'Select'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Step Voice Calibration Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> 3-Step Accent Calibration Wizard
              </h3>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-800">
                Step {step} of 3
              </span>
            </div>

            {/* Step 1: Malayalam Audio Sample */}
            {step === 1 && (
              <div className="space-y-4 text-center py-2">
                <p className="text-xs text-slate-400">
                  Step 1: Read the Malayalam phrase aloud to calibrate phonetic vowels and consonants.
                </p>

                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-emerald-200 text-base font-semibold font-sans">
                  "{activeProfile.samplePhraseMl}"
                </div>

                <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                  <button
                    id="rec-step1-btn"
                    onClick={handleStartRecording}
                    disabled={isRecording}
                    className={`p-6 rounded-full text-white shadow-xl transition-all ${
                      isRecording
                        ? 'bg-rose-600 animate-bounce ring-4 ring-rose-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95'
                    }`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <p className="text-xs text-slate-400">
                    {isRecording ? 'Listening and measuring pitch frequency...' : 'Click to Record Voice'}
                  </p>
                </div>

                {recordedText && (
                  <div className="p-3 rounded-xl bg-slate-800 text-xs text-slate-300">
                    Recorded Audio Verified: "{recordedText}"
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    id="step1-next-btn"
                    disabled={!recordedText}
                    onClick={() => {
                      setStep(2);
                      setRecordedText('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-md"
                  >
                    Proceed to Step 2
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: English Accent Sample */}
            {step === 2 && (
              <div className="space-y-4 text-center py-2">
                <p className="text-xs text-slate-400">
                  Step 2: Read the English phrase aloud to adjust speed and intonation curves.
                </p>

                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-base font-semibold">
                  "{activeProfile.samplePhraseEn}"
                </div>

                <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                  <button
                    id="rec-step2-btn"
                    onClick={handleStartRecording}
                    disabled={isRecording}
                    className={`p-6 rounded-full text-white shadow-xl transition-all ${
                      isRecording
                        ? 'bg-rose-600 animate-bounce ring-4 ring-rose-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95'
                    }`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <p className="text-xs text-slate-400">
                    {isRecording ? 'Capturing formant spectrum...' : 'Click to Record Voice'}
                  </p>
                </div>

                {recordedText && (
                  <div className="p-3 rounded-xl bg-slate-800 text-xs text-slate-300">
                    Recorded Audio Verified: "{recordedText}"
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    id="step2-next-btn"
                    disabled={!recordedText}
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-md"
                  >
                    Proceed to Step 3
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Analysis & Calibration Summary */}
            {step === 3 && (
              <div className="space-y-4 text-center py-2">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                  <h4 className="text-lg font-extrabold text-white">Phonetic Acoustic Profile Calibrated!</h4>
                  <p className="text-xs text-slate-300">
                    New Accuracy Precision: <span className="font-mono font-bold text-emerald-400 text-sm">99.2%</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 text-left text-xs text-slate-300 space-y-1">
                  <p>• Vowel Length Tuning: Optimized for Kerala Malayalam diphthongs.</p>
                  <p>• Consonant Weighting: Adjusted retroflex plosives.</p>
                  <p>• Noise Floor Calibration: -42 dB target noise isolation.</p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    id="finish-calibration-btn"
                    onClick={handleFinishCalibration}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                  >
                    Apply Calibrated Model
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
