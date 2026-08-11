import React, { useState } from 'react';
import {
  Activity,
  Trash2,
  Cpu,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  X,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Download,
  FileJson,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { CommandLog, ActionType, AssistantActionResponse } from '../types';

interface VoiceLogDrawerProps {
  logs: CommandLog[];
  onClearLogs: () => void;
  onUpdateLog?: (updatedLog: CommandLog) => void;
  onExecuteCommand?: (commandText: string) => Promise<AssistantActionResponse | null>;
}

export const VoiceLogDrawer: React.FC<VoiceLogDrawerProps> = ({
  logs,
  onClearLogs,
  onUpdateLog,
  onExecuteCommand,
}) => {
  const [editingLog, setEditingLog] = useState<CommandLog | null>(null);
  const [correctedText, setCorrectedText] = useState('');
  const [correctedActionType, setCorrectedActionType] = useState<ActionType>('GENERAL_QUERY');
  const [isReExecuting, setIsReExecuting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string>('');

  const handleExportJSON = () => {
    if (logs.length === 0) return;
    const jsonString = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `voice_assistant_logs_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMsg(`Exported ${logs.length} log(s) as JSON`);
    setTimeout(() => setExportSuccessMsg(''), 3000);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const escapeCSV = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'ID',
      'Timestamp',
      'CommandText',
      'LanguageDetected',
      'ActionType',
      'IntentSummary',
      'SpokenResponse',
      'Confidence',
      'EngineUsed',
      'IsCorrected',
      'OriginalText',
    ];

    const rows = logs.map((log) => [
      escapeCSV(log.id),
      escapeCSV(log.timestamp),
      escapeCSV(log.commandText),
      escapeCSV(log.languageDetected),
      escapeCSV(log.actionType),
      escapeCSV(log.intentSummary),
      escapeCSV(log.spokenResponse),
      escapeCSV(log.confidence),
      escapeCSV(log.engineUsed),
      escapeCSV(log.isCorrected ? 'Yes' : 'No'),
      escapeCSV(log.originalText || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `voice_assistant_logs_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMsg(`Exported ${logs.length} log(s) as CSV`);
    setTimeout(() => setExportSuccessMsg(''), 3000);
  };

  const handleStartReview = (log: CommandLog) => {
    setEditingLog(log);
    setCorrectedText(log.commandText);
    setCorrectedActionType(log.actionType);
  };

  const handleSaveCorrection = async () => {
    if (!editingLog) return;

    const updated: CommandLog = {
      ...editingLog,
      commandText: correctedText.trim() || editingLog.commandText,
      originalText: editingLog.originalText || editingLog.commandText,
      actionType: correctedActionType,
      confidence: 1.0, // Corrected by user
      isCorrected: true,
      engineUsed: `${editingLog.engineUsed} (Corrected & Trained)`,
    };

    if (onUpdateLog) {
      onUpdateLog(updated);
    }

    if (onExecuteCommand && correctedText.trim()) {
      setIsReExecuting(true);
      await onExecuteCommand(correctedText.trim());
      setIsReExecuting(false);
    }

    setEditingLog(null);
  };

  const getConfidenceBadge = (confidence: number) => {
    const pct = Math.round(confidence * 100);
    if (pct >= 90) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>{pct}% High</span>
        </span>
      );
    } else if (pct >= 75) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
          <Activity className="w-3 h-3 text-amber-400" />
          <span>{pct}% Medium</span>
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>{pct}% Low Confidence</span>
        </span>
      );
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Assistant Command Activity Logs ({logs.length})
          </h3>
          <p className="text-xs text-slate-400">
            Real-time intent history with confidence scoring. Review and correct low-confidence transcriptions to train phonetic models.
          </p>
        </div>

        {logs.length > 0 && (
          <div className="flex items-center space-x-2">
            {exportSuccessMsg && (
              <span className="text-[11px] font-medium text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{exportSuccessMsg}</span>
              </span>
            )}

            {/* Export JSON Button */}
            <button
              id="export-json-btn"
              onClick={handleExportJSON}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white text-xs font-medium border border-indigo-500/40 transition-colors"
              title="Export activity log history as JSON file"
            >
              <FileJson className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>

            {/* Export CSV Button */}
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white text-xs font-medium border border-purple-500/40 transition-colors"
              title="Export activity log history as CSV file"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
              <span>Export CSV</span>
            </button>

            {/* Clear History Button */}
            <button
              id="clear-logs-btn"
              onClick={onClearLogs}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-medium border border-slate-700 hover:border-rose-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs">
          No command history yet. Try speaking a voice command or trigger routine above!
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {logs.map((log) => {
            const isLowConfidence = log.confidence < 0.85;

            return (
              <div
                key={log.id}
                id={`log-card-${log.id}`}
                className={`p-4 rounded-2xl border transition-all space-y-2 text-xs ${
                  log.isCorrected
                    ? 'bg-indigo-950/40 border-indigo-500/50'
                    : isLowConfidence
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-sm">
                      "{log.commandText}"
                    </span>
                    {log.isCorrected && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-400/30">
                        Corrected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Confidence Score Indicator */}
                    {getConfidenceBadge(log.confidence)}
                    <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                      {log.actionType}
                    </span>
                    <span className="text-slate-300">{log.intentSummary}</span>
                  </div>

                  {/* Review & Correct Option */}
                  <button
                    id={`review-correct-btn-${log.id}`}
                    onClick={() => handleStartReview(log)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      isLowConfidence
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md hover:bg-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Review & Correct</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800">
                  <span className="truncate text-slate-300 italic max-w-md">
                    "{log.spokenResponse}"
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                    <Cpu className="w-3 h-3 text-indigo-400" /> {log.engineUsed}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review and Correct Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/60 p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Review & Correct Voice Transcription</h3>
                  <p className="text-xs text-slate-400">
                    Fix misheard words to train MobileAction 270M's phonetic model
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Original Raw Audio Transcription:</span>
                <p className="font-mono text-amber-300">"{editingLog.commandText}"</p>
                <p className="text-[10px] text-slate-400">
                  Confidence: <span className="font-mono text-rose-400">{(editingLog.confidence * 100).toFixed(0)}%</span>
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Corrected Spoken Text *
                </label>
                <input
                  type="text"
                  value={correctedText}
                  onChange={(e) => setCorrectedText(e.target.value)}
                  placeholder="Enter exact spoken phrase..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Corrected Target Intent / Action
                </label>
                <select
                  value={correctedActionType}
                  onChange={(e: any) => setCorrectedActionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="WHATSAPP_CALL">WhatsApp Call</option>
                  <option value="SMS">SMS Text Message</option>
                  <option value="WHATSAPP_MSG">WhatsApp Message</option>
                  <option value="CALENDAR">Calendar Agenda</option>
                  <option value="MUSIC_PLAY">Play Music</option>
                  <option value="MUSIC_CONTROL">Playback Control</option>
                  <option value="VOLUME">Volume Control</option>
                  <option value="DEVICE">Audio Device Route</option>
                  <option value="APP_OPEN">Open Mobile App</option>
                  <option value="SCROLL_REELS">Scroll Reels/Videos</option>
                  <option value="GENERAL_QUERY">General Answer</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>
                  Saving this correction updates your local acoustic voice dictionary and re-executes the corrected action.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCorrection}
                disabled={isReExecuting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                {isReExecuting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Re-executing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save & Train Model</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
