import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  Bell,
  Trash2,
  CalendarCheck,
} from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarPlannerSectionProps {
  events: CalendarEvent[];
  onAddEvent: (newEvent: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  language: string;
}

export const CalendarPlannerSection: React.FC<CalendarPlannerSectionProps> = ({
  events,
  onAddEvent,
  onDeleteEvent,
  language,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<'Meeting' | 'Call' | 'Personal' | 'Routine' | 'Medical'>('Meeting');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title,
      date,
      time,
      location: location || undefined,
      durationMinutes: 45,
      category,
      isAutomated: true,
    });

    setTitle('');
    setLocation('');
    setShowModal(false);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Medical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Meeting':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Call':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Routine':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Planner Overview Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            MobileAction Calendar & Task Automation
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Appointments and routine tasks scheduled seamlessly via hands-free voice commands.
          </p>
        </div>

        <button
          id="add-event-btn"
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* MobileAction Automated Task Routines Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 text-slate-200 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-400" /> Active Voice Automations
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
            On-Device Engine Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Morning Routine (07:00 AM)</p>
              <p className="text-slate-400">Sync calendar, start Malayalam devotional music on Spotify, read agenda aloud.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start space-x-3">
            <PhoneCall className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Evening Family Reminder (07:00 PM)</p>
              <p className="text-slate-400">Prompt voice call to Amma and send location SMS update hands-free.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-indigo-400" /> Scheduled Appointments ({events.length})
        </h3>

        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No events scheduled. Use voice command "Schedule meeting with Team tomorrow at 3 PM" or click above.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                id={`event-item-${evt.id}`}
                className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all gap-3"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-indigo-400 flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-white">{evt.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getCategoryBadge(evt.category)}`}>
                        {evt.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono text-indigo-300">
                        <Clock className="w-3.5 h-3.5" /> {evt.date} at {evt.time} ({evt.durationMinutes} mins)
                      </span>
                      {evt.location && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" /> {evt.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {evt.isAutomated && (
                    <span className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium">
                      Voice Created
                    </span>
                  )}
                  <button
                    id={`delete-evt-${evt.id}`}
                    onClick={() => onDeleteEvent(evt.id)}
                    className="p-2 rounded-xl bg-slate-700/60 hover:bg-rose-600/20 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Remove Appointment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Schedule New Appointment</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dr. Alex Consultation, Team Sync..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Location / Link</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Google Meet, Kochi Clinic..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Call">Call</option>
                  <option value="Medical">Medical</option>
                  <option value="Routine">Routine</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
