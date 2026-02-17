
import React, { useMemo } from 'react';
import { UserProfile, InterventionReport } from '../types';
import { storageService } from '../services/storageService';

interface Props {
  user: UserProfile;
  reports: InterventionReport[];
  onNewReport: () => void;
  isSyncing?: boolean;
  remoteLastId?: string | null;
  onRefresh?: () => void;
  syncError?: string | null;
}

const Dashboard: React.FC<Props> = ({ user, reports, onNewReport, isSyncing, remoteLastId, onRefresh, syncError }) => {
  const latestId = useMemo(() => {
    if (remoteLastId && remoteLastId !== "N/A") return remoteLastId;
    const synced = reports
      .filter(r => r.status === 'synced')
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    if (synced.length > 0) return synced[0].id;
    const lastNum = storageService.getLastSentNumber();
    if (lastNum === 0) return "N/A";
    return `${user.prefix}-${lastNum.toString().padStart(4, '0')}`;
  }, [user.prefix, reports, remoteLastId]);

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return reports.filter(r => r.status === 'synced' && r.date === today).length;
  }, [reports]);

  return (
    <div className="h-full flex flex-col p-6 pb-28 overflow-y-auto hide-scrollbar relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <header className="mb-12 pt-10 flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center shadow-neon">
              <span className="font-bold text-white text-xs tracking-tighter">SM</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold tracking-widest text-primary uppercase leading-none mb-1">SMIRT APP</span>
              <div className="flex items-center gap-1">
                {isSyncing ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
                    <span className="text-[8px] text-primary font-bold uppercase tracking-tighter animate-pulse">Sync Cloud...</span>
                  </>
                ) : syncError ? (
                  <span className="text-[8px] text-red-500 font-bold uppercase tracking-tighter">Sync Fallito</span>
                ) : (
                  <span className="text-[8px] text-green-500/50 font-bold uppercase tracking-tighter">Online</span>
                )}
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 leading-tight">
            Benvenuto,<br /><span className="text-primary">{user.name.split(' ')[0] || 'Utente'}</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 p-0.5 shadow-neon bg-surface-dark overflow-hidden">
            <img 
              src={user.avatar || 'https://picsum.photos/seed/tech/200'} 
              alt="Profilo" 
              className="w-full h-full object-cover grayscale" 
            />
          </div>
          <button 
            onClick={onRefresh}
            disabled={isSyncing}
            className={`p-2 rounded-full bg-surface-dark border border-slate-800 text-slate-400 hover:text-primary transition-all active:rotate-180 duration-500 ${isSyncing ? 'animate-spin' : ''}`}
          >
            <span className="material-icons-round text-lg">sync</span>
          </button>
        </div>
      </header>

      {syncError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="material-icons-round text-red-500 text-lg">error_outline</span>
          <div className="flex flex-col">
            <span className="text-[10px] text-red-400 font-bold uppercase">Errore Database Remoto</span>
            <span className="text-[11px] text-red-300 leading-tight">{syncError}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
          <div className="relative w-64 h-64 rounded-full border border-white/10 bg-surface-darker/50 flex flex-col items-center justify-center backdrop-blur-sm shadow-2xl">
            <div className={`absolute inset-2 rounded-full border border-primary/20 border-dashed ${isSyncing ? 'animate-spin' : 'animate-[spin_60s_linear_infinite]'}`}></div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-surface-darker px-3 py-1 rounded-full border border-primary/30 text-[10px] text-primary font-bold uppercase tracking-wider whitespace-nowrap">
              Ultimo Archivio
            </div>
            <span className="text-4xl font-black text-white tracking-tighter drop-shadow-lg text-center px-4">
              {latestId}
            </span>
            <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              {remoteLastId ? 'Rilevato da Cloud' : 'Database Locale'}
            </span>
          </div>
        </div>

        <div className="w-full flex justify-center gap-4">
          <div className="bg-surface-dark/50 backdrop-blur-md rounded-2xl p-5 text-center border border-white/5 shadow-lg flex-1 max-w-[160px] relative overflow-hidden">
            <span className="block text-3xl font-bold text-white mb-1 relative z-10">{completedToday}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold relative z-10 leading-tight">Inviati Oggi</span>
          </div>
          
          <div className="bg-surface-dark/50 backdrop-blur-md rounded-2xl p-5 text-center border border-white/5 shadow-lg flex-1 max-w-[160px] relative overflow-hidden">
            <span className="block text-3xl font-bold text-primary mb-1 relative z-10">
              {reports.filter(r => r.status === 'synced').length}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold relative z-10 leading-tight">Storico Totale</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
