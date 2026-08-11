import React, { useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Mic,
  ListOrdered,
  Sparkles,
  Zap,
  Sliders,
  X,
  Volume2,
  Calendar,
  Music,
  Headphones,
  MessageSquare,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Clock,
  RotateCw,
} from 'lucide-react';
import { VoiceShortcut, VoiceShortcutStep, ActionType, AssistantActionResponse } from '../types';

interface ShortcutBuilderSectionProps {
  shortcuts: VoiceShortcut[];
  onAddShortcut: (shortcut: VoiceShortcut) => void;
  onUpdateShortcut: (shortcut: VoiceShortcut) => void;
  onDeleteShortcut: (shortcutId: string) => void;
  onExecuteCommand: (commandText: string) => Promise<AssistantActionResponse | null>;
}

export const ShortcutBuilderSection: React.FC<ShortcutBuilderSectionProps> = ({
  shortcuts,
  onAddShortcut,
  onUpdateShortcut,
  onDeleteShortcut,
  onExecuteCommand,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [executingShortcut, setExecutingShortcut] = useState<VoiceShortcut | null>(null);
  const [currentExecutingStepIndex, setCurrentExecutingStepIndex] = useState<number>(-1);
  const [executedLogs, setExecutedLogs] = useState<{ stepIndex: number; responseText: string }[]>([]);

  // New shortcut form state
  const [title, setTitle] = useState('');
  const [triggerPhrase, setTriggerPhrase] = useState('');
  const [triggerPhraseMl, setTriggerPhraseMl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Morning Routine' | 'Commute' | 'Focus' | 'Evening' | 'Custom'>('Morning Routine');
  const [steps, setSteps] = useState<Omit<VoiceShortcutStep, 'id'>[]>([
    {
      actionType: 'CALENDAR',
      description: "Check today's appointments",
      commandText: 'Check calendar schedule for today',
    },
    {
      actionType: 'MUSIC_PLAY',
      description: "Play morning song 'Malare' on Spotify",
      commandText: 'Play Malare on Spotify',
    },
    {
      actionType: 'VOLUME',
      description: 'Set master volume to 80%',
      commandText: 'Set volume to 80 percent',
    },
  ]);

  const actionTypesList: { type: ActionType; label: string; icon: any; defaultCmd: string }[] = [
    { type: 'CALENDAR', label: 'Calendar Agenda', icon: Calendar, defaultCmd: 'Check calendar schedule for today' },
    { type: 'MUSIC_PLAY', label: 'Play Music', icon: Music, defaultCmd: 'Play Malare on Spotify' },
    { type: 'VOLUME', label: 'Adjust Volume', icon: Volume2, defaultCmd: 'Set volume to 80 percent' },
    { type: 'DEVICE', label: 'Audio Device', icon: Headphones, defaultCmd: 'Switch audio device to AirPods Pro' },
    { type: 'WHATSAPP_MSG', label: 'Send WhatsApp Msg', icon: MessageSquare, defaultCmd: 'Send WhatsApp message to Amma saying Good morning' },
    { type: 'WHATSAPP_CALL', label: 'WhatsApp Call', icon: Smartphone, defaultCmd: 'Call Amma on WhatsApp' },
    { type: 'SCROLL_REELS', label: 'Scroll Reels / Videos', icon: Play, defaultCmd: 'Scroll down reels' },
  ];

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        actionType: 'VOLUME',
        description: 'Set volume to 75%',
        commandText: 'Set volume to 75 percent',
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, field: keyof Omit<VoiceShortcutStep, 'id'>, value: any) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        if (field === 'actionType') {
          const matched = actionTypesList.find((a) => a.type === value);
          return {
            ...s,
            actionType: value,
            commandText: matched?.defaultCmd || s.commandText,
          };
        }
        return { ...s, [field]: value };
      })
    );
  };

  const handleSaveShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !triggerPhrase.trim() || steps.length === 0) return;

    const newShortcut: VoiceShortcut = {
      id: 'sc-' + Date.now(),
      title: title.trim(),
      triggerPhrase: triggerPhrase.trim(),
      triggerPhraseMl: triggerPhraseMl.trim() || undefined,
      description: description.trim() || `Multi-step voice routine with ${steps.length} actions.`,
      isEnabled: true,
      category,
      executionCount: 0,
      steps: steps.map((s, i) => ({ ...s, id: `st-${Date.now()}-${i}` })),
    };

    onAddShortcut(newShortcut);
    setIsCreating(false);

    // Reset form
    setTitle('');
    setTriggerPhrase('');
    setTriggerPhraseMl('');
    setDescription('');
    setCategory('Morning Routine');
  };

  // Run routine multi-step execution simulation
  const handleRunShortcutRoutine = async (shortcut: VoiceShortcut) => {
    setExecutingShortcut(shortcut);
    setCurrentExecutingStepIndex(0);
    setExecutedLogs([]);

    const updated = {
      ...shortcut,
      executionCount: shortcut.executionCount + 1,
      lastExecuted: 'Just now',
    };
    onUpdateShortcut(updated);

    for (let i = 0; i < shortcut.steps.length; i++) {
      setCurrentExecutingStepIndex(i);
      const step = shortcut.steps[i];

      // Execute command through backend assistant engine
      const res = await onExecuteCommand(step.commandText);

      setExecutedLogs((prev) => [
        ...prev,
        {
          stepIndex: i,
          responseText: res?.responseEn || res?.responseMl || `Executed ${step.description}`,
        },
      ]);

      // Small delay between steps
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    setCurrentExecutingStepIndex(-1);
  };

  const getActionIcon = (actionType: ActionType) => {
    switch (actionType) {
      case 'CALENDAR':
        return <Calendar className="w-4 h-4 text-sky-400" />;
      case 'MUSIC_PLAY':
      case 'MUSIC_CONTROL':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'VOLUME':
        return <Volume2 className="w-4 h-4 text-amber-400" />;
      case 'DEVICE':
        return <Headphones className="w-4 h-4 text-indigo-400" />;
      case 'WHATSAPP_MSG':
      case 'WHATSAPP_CALL':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      default:
        return <Zap className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Custom Voice Shortcut & Routine Builder
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Map specific phrases (e.g. <em>"Start my morning routine"</em>) to automated multi-step sequences like checking calendar, playing news, and adjusting audio.
          </p>
        </div>

        <button
          id="create-shortcut-btn"
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Shortcut</span>
        </button>
      </div>

      {/* New Shortcut Creation Drawer Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-indigo-500/50 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Multi-Step Voice Routine</h3>
                  <p className="text-xs text-slate-400">Map a trigger phrase to a sequence of actions</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShortcut} className="space-y-4 text-xs">
              {/* Shortcut Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Routine Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Morning Launch Routine"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Morning Routine">Morning Routine</option>
                    <option value="Commute">Commute / Drive</option>
                    <option value="Focus">Focus / Work</option>
                    <option value="Evening">Evening / Bedtime</option>
                    <option value="Custom">Custom Automation</option>
                  </select>
                </div>
              </div>

              {/* Trigger Phrases */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trigger Phrase (English) *</label>
                  <div className="relative">
                    <Mic className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                    <input
                      type="text"
                      required
                      value={triggerPhrase}
                      onChange={(e) => setTriggerPhrase(e.target.value)}
                      placeholder='e.g., "Start my morning routine"'
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trigger Phrase (Malayalam Script)</label>
                  <input
                    type="text"
                    value={triggerPhraseMl}
                    onChange={(e) => setTriggerPhraseMl(e.target.value)}
                    placeholder='e.g., "രാവിലെ ദിനചര്യ ആരംഭിക്കുക"'
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Short Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Checks calendar, plays news, and sets volume to 80%"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Multi-Step Action Sequence Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-white uppercase tracking-wider text-[11px]">
                    Sequence of Multi-Step Actions ({steps.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-semibold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>

                        {/* Action Type Dropdown */}
                        <select
                          value={step.actionType}
                          onChange={(e) => handleStepChange(idx, 'actionType', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                        >
                          {actionTypesList.map((a) => (
                            <option key={a.type} value={a.type}>
                              {a.label}
                            </option>
                          ))}
                        </select>

                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                            title="Remove Step"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={step.description}
                          onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                          placeholder="Step description e.g., Set volume to 80%"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          value={step.commandText}
                          onChange={(e) => handleStepChange(idx, 'commandText', e.target.value)}
                          placeholder="Exact command e.g., Set volume to 80 percent"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  Save Shortcut Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routine Execution Simulation Modal */}
      {executingShortcut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/60 p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300">
                  <Play className="w-5 h-5 fill-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{executingShortcut.title}</h3>
                  <p className="text-xs text-indigo-300 font-mono">"{executingShortcut.triggerPhrase}"</p>
                </div>
              </div>
              <button
                onClick={() => setExecutingShortcut(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Executing Step-by-Step Sequence ({executingShortcut.steps.length} Steps)...
              </p>

              <div className="space-y-2.5">
                {executingShortcut.steps.map((step, idx) => {
                  const isDone = currentExecutingStepIndex > idx || currentExecutingStepIndex === -1;
                  const isCurrent = currentExecutingStepIndex === idx;
                  const logItem = executedLogs.find((l) => l.stepIndex === idx);

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-indigo-950/80 border-indigo-500 shadow-lg ring-2 ring-indigo-500/50'
                          : isDone
                          ? 'bg-slate-800/80 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-800/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <RotateCw className="w-4 h-4 text-indigo-400 animate-spin" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                          )}
                          <span className="font-semibold">{step.description}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{step.actionType}</span>
                      </div>

                      {logItem && (
                        <p className="text-[11px] text-emerald-300 italic mt-1.5 pl-6 border-l-2 border-emerald-500/50">
                          "{logItem.responseText}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setExecutingShortcut(null)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
              >
                {currentExecutingStepIndex === -1 ? 'Routine Sequence Completed' : 'Close Routine Execution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Shortcuts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shortcuts.map((sc) => (
          <div
            key={sc.id}
            id={`shortcut-card-${sc.id}`}
            className={`rounded-3xl p-5 border transition-all space-y-4 ${
              sc.isEnabled
                ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/60 shadow-xl'
                : 'bg-slate-900/50 border-slate-800/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  {sc.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{sc.title}</h3>
              </div>

              {/* Enable / Disable Toggle */}
              <button
                id={`toggle-sc-${sc.id}`}
                onClick={() => onUpdateShortcut({ ...sc, isEnabled: !sc.isEnabled })}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  sc.isEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {sc.isEnabled ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Trigger Voice Phrase Badge */}
            <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/70 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-indigo-300 font-bold">
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>"{sc.triggerPhrase}"</span>
              </div>
              {sc.triggerPhraseMl && (
                <p className="text-[11px] text-slate-400 italic">"{sc.triggerPhraseMl}"</p>
              )}
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">{sc.description}</p>

            {/* Multi-step Preview Badges */}
            <div className="space-y-1.5 pt-1">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Multi-Step Sequence ({sc.steps.length} Steps)
              </span>
              <div className="space-y-1">
                {sc.steps.map((st, i) => (
                  <div
                    key={st.id}
                    className="flex items-center space-x-2 text-[11px] text-slate-300 bg-slate-800/40 px-2 py-1 rounded-lg border border-slate-800"
                  >
                    {getActionIcon(st.actionType)}
                    <span className="font-semibold text-slate-400">{i + 1}.</span>
                    <span className="truncate">{st.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Footer: Run Button & Delete */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Runs: {sc.executionCount}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id={`delete-sc-${sc.id}`}
                  onClick={() => onDeleteShortcut(sc.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Shortcut"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  id={`run-sc-${sc.id}`}
                  onClick={() => handleRunShortcutRoutine(sc)}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Routine</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
