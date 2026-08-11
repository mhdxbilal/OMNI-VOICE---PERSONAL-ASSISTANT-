import React, { useState } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Lock,
  Sparkles,
} from 'lucide-react';
import { ModelPackage } from '../types';

interface ModelManagerSectionProps {
  models: ModelPackage[];
  onDownloadModel: (id: string) => void;
}

export const ModelManagerSection: React.FC<ModelManagerSectionProps> = ({
  models,
  onDownloadModel,
}) => {
  const totalDownloadedMb = models
    .filter((m) => m.isDownloaded)
    .reduce((acc, curr) => acc + curr.sizeMb, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Language & Speech Model Downloader
            <DownloadCloud className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Download local AI models and phonetic speech engines for zero-latency, 100% offline bilingual voice commands.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-800/90 px-4 py-2.5 rounded-2xl border border-slate-700/80">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs text-slate-400">Offline Storage Used</p>
            <p className="text-sm font-bold text-white font-mono">{totalDownloadedMb} MB / 2,048 MB</p>
          </div>
        </div>
      </div>

      {/* AES Encryption Security Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 text-slate-200 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AES-256 On-Device Hardware Data Encryption
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">
              All calendar appointments, phone contact details, and voice command logs are encrypted locally before saving.
            </p>
          </div>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-semibold">
          Vault Key: Hardware Enclave Locked
        </span>
      </div>

      {/* Models Download List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Available Offline Speech & Intelligence Packages</h3>

        <div className="space-y-4">
          {models.map((model) => (
            <div
              key={model.id}
              id={`model-card-${model.id}`}
              className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex-shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-white">{model.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-indigo-300 font-mono">
                        {model.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">{model.description}</p>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2 font-mono">
                      <span>Language: <strong className="text-slate-200">{model.language}</strong></span>
                      <span>•</span>
                      <span>Size: <strong className="text-slate-200">{model.sizeMb} MB</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  {model.isDownloaded ? (
                    <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Downloaded & Installed</span>
                    </div>
                  ) : (
                    <button
                      id={`dl-model-btn-${model.id}`}
                      onClick={() => onDownloadModel(model.id)}
                      disabled={model.isDownloading}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition-all active:scale-95"
                    >
                      {model.isDownloading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Downloading ({model.downloadProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="w-4 h-4" />
                          <span>Download Package</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Download Progress Bar */}
              {model.isDownloading && (
                <div className="space-y-1 pt-1">
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${model.downloadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-right text-slate-400 font-mono">
                    Downloading {Math.round((model.sizeMb * model.downloadProgress) / 100)} / {model.sizeMb} MB
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
