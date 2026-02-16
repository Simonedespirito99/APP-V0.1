
import React, { useMemo } from 'react';
import { UserProfile } from '../types';
import { storageService } from '../services/storageService';

interface Props {
  user: UserProfile;
  onNewReport: () => void;
}

const Dashboard: React.FC<Props> = ({ user, onNewReport }) => {
  const latestId = useMemo(() => {
    const lastNum = storageService.getLastSentNumber();
    if (lastNum === 0) return "N/A";
    return `${user.prefix}-${lastNum.toString().padStart(4, '0')}`;
  }, [user.prefix]);

  const completedToday = useMemo(() => {
    const reports = storageService.getReports();
    const today = new Date().toISOString().split('T')[0];
    return reports.filter(r => r.status === 'synced' && r.date === today).length;
  }, []);

  return (
    <div className="h-full flex flex-col p-6 pb-28 overflow-y-auto hide-scrollbar relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <header className="mb-12 pt-4 flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center shadow-neon">
              <span className="font-bold text-white text-xs tracking-tighter">SM</span>
            </div>
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">SMIRT APP</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 leading-tight">
            Benvenuto,<br /><span className="text-primary">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-primary/30 p-0.5 shadow-neon">
          <img 
            src={user.avatar} 
            alt="Profilo" 
            className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-300" 
          />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
          <div className="relative w-64 h-64 rounded-full border border-white/10 bg-surface-darker/50 flex flex-col items-center justify-center backdrop-blur-sm shadow-2xl">
            <div className="absolute inset-2 rounded-full border border-primary/20 border-dashed animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-surface-darker px-3 py-1 rounded-full border border-primary/30 text-xs text-primary font-bold uppercase tracking-wider">
              Ultimo Invio
            </div>
            <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">{latestId}</span>
            <span className="text-sm text-slate-400 mt-2 font-medium tracking-wide">Archiviato</span>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <div className="bg-surface-dark/50 backdrop-blur-md rounded-2xl p-6 text-center border border-white/5 shadow-lg w-full max-w-[200px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="block text-4xl font-bold text-white mb-1 relative z-10">{completedToday}</span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold relative z-10">Completati Oggi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
