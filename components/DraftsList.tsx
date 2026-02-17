
import React, { useState, useMemo } from 'react';
import { InterventionReport } from '../types';

interface Props {
  reports: InterventionReport[];
  onEdit: (report: InterventionReport) => void;
}

const DraftsList: React.FC<Props> = ({ reports, onEdit }) => {
  const [view, setView] = useState<'drafts' | 'history'>('drafts');

  const filteredReports = useMemo(() => {
    if (view === 'drafts') {
      return reports
        .filter(r => r.status === 'draft')
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else {
      return reports
        .filter(r => r.status === 'synced')
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 10);
    }
  }, [reports, view]);

  return (
    <div className="h-full flex flex-col bg-background-dark overflow-hidden">
      <header className="px-6 pt-8 pb-4 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {view === 'drafts' ? 'Bozze salvate' : 'Cronologia'}
          </h1>
          
          <div className="bg-surface-dark border border-slate-800 rounded-lg p-1 flex">
            <button 
              onClick={() => setView('drafts')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'drafts' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Bozze
            </button>
            <button 
              onClick={() => setView('history')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'history' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Invii
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 hide-scrollbar">
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-600">
              <span className="material-icons-round text-6xl mb-4">
                {view === 'drafts' ? 'inventory_2' : 'history'}
              </span>
              <p>{view === 'drafts' ? 'Nessuna bozza trovata.' : 'Nessuno storico presente.'}</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div 
                key={report.id}
                onClick={() => report.status === 'draft' && onEdit(report)}
                className={`group relative overflow-hidden rounded-xl bg-surface-dark border p-5 shadow-sm transition-all active:scale-[0.98] ${
                  report.status === 'synced' ? 'border-slate-800 bg-surface-darker/50' : 'border-slate-700/50 hover:border-primary/50 cursor-pointer'
                }`}
              >
                {report.status === 'draft' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-neon"></div>
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {report.clientName || 'Cliente non specificato'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500 font-mono">Cod: {report.id}</p>
                      {report.isLinkedToPrevious && (
                        <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-bold uppercase">Linked</span>
                      )}
                    </div>
                  </div>
                  {report.status === 'synced' && (
                     <span className="material-icons-round text-green-500 text-sm">check_circle</span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="material-icons-round text-sm">calendar_today</span>
                    <span>{report.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="material-icons-round text-sm">timer</span>
                    <span>{report.startTime} - {report.endTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div className={`flex items-center gap-2 font-medium text-xs ${report.status === 'synced' ? 'text-slate-500' : 'text-primary'}`}>
                    <span className="material-icons-round text-base">
                      {report.status === 'synced' ? 'history' : 'cloud_upload'}
                    </span>
                    <span>{report.status === 'synced' ? 'Archiviato' : 'Pronto per invio'}</span>
                  </div>
                  <span className="material-icons-round text-slate-600 text-lg">chevron_right</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DraftsList;
