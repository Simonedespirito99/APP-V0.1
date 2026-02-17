import React, { useState } from 'react';
import { InterventionReport, UserProfile } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface Props {
  report: InterventionReport;
  onSync: (report: InterventionReport) => void;
  onEdit: () => void;
  onBack: () => void;
  onSaveDraft: (report: InterventionReport) => void;
}

const ReviewScreen: React.FC<Props> = ({ report, onSync, onEdit, onBack, onSaveDraft }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const user: UserProfile = storageService.getProfile();

  const handleSync = async () => {
    setIsSyncing(true);
    const success = await geminiService.syncToSheets(report, user.name);
    if (success) {
      onSync({ ...report, status: 'synced', timestamp: Date.now() });
    } else {
      setIsSyncing(false);
      alert("Invio fallito. Controlla la connessione.");
    }
  };

  const allTechs = [user.name, ...report.assistantTechnicians].filter(Boolean);

  return (
    <div className="h-full flex flex-col bg-background-dark overflow-hidden">
      <header className="px-4 h-16 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-background-dark/95 backdrop-blur-sm z-20">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
          <span className="material-icons-round">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Revisione Finale</span>
          <h1 className="text-lg font-bold">Rapporto: {report.id}</h1>
        </div>
        <button onClick={onEdit} className="text-primary font-bold text-sm">Modifica</button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="material-icons-round text-primary text-sm">domain</span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cliente e Luogo</h2>
          </div>
          <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Responsabile</span>
              <span className="text-xs font-bold text-primary">{user.name}</span>
            </div>
            {report.isLinkedToPrevious && (
              <div className="flex justify-between items-center bg-primary/5 -mx-2 px-2 py-1 rounded">
                <span className="text-[10px] font-bold text-primary uppercase">Riferimento</span>
                <span className="text-xs font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  {report.previousActivityId || 'NON SPECIFICATO'}
                </span>
              </div>
            )}
            <div className="h-px bg-slate-800"></div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Cliente</span>
              <span className="text-xs font-bold">{report.clientName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Luogo</span>
              <span className="text-xs font-bold">{report.locationId || '-'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="material-icons-round text-primary text-sm">group</span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Team Tecnico</h2>
          </div>
          <div className="bg-surface-dark border border-slate-800 rounded-xl p-4">
             <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Responsabile</span>
                  <span className="font-bold text-primary">{user.name}</span>
                </div>
                {report.assistantTechnicians.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Assistente</span>
                    <span className="font-bold">{t}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Totale Operatori</span>
                  <span className="text-xs font-black text-white">{allTechs.length}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="material-icons-round text-primary text-sm">engineering</span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Dettagli Intervento</h2>
          </div>
          <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 space-y-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Attività</p>
              <div className="flex flex-wrap gap-1">
                {report.selectedTasks.length > 0 ? report.selectedTasks.map(t => (
                  <span key={t} className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700">{t}</span>
                )) : <span className="text-[10px] text-slate-600">Nessuna attività selezionata</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Componenti/Unità</p>
              <p className="text-xs font-mono text-primary font-bold">
                {report.selectedUnits.length > 0 ? report.selectedUnits.sort((a,b)=>a-b).join(", ") : "Nessuna"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-10">
          <div className="flex items-center gap-2 px-1">
            <span className="material-icons-round text-primary text-sm">inventory_2</span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Materiali Utilizzati</h2>
          </div>
          <div className="bg-surface-dark border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                <tr>
                  <th className="px-4 py-2">Articolo</th>
                  <th className="px-4 py-2 text-right">Q.tà</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800">
                {report.materials.length > 0 ? report.materials.map(m => (
                  <tr key={m.id}>
                    <td className="px-4 py-3">{m.name || 'Articolo generico'}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary">{m.qty}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-center text-slate-600 italic">Nessun materiale registrato</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="p-5 pb-8 bg-background-dark border-t border-slate-800 sticky bottom-0 z-20 space-y-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-neon transition-all flex items-center justify-center gap-2 text-lg active:scale-95 disabled:opacity-50"
        >
          {isSyncing ? (
            <>
              <span className="material-icons-round animate-spin">sync</span>
              Sincronizzazione...
            </>
          ) : (
            <>
              <span className="material-icons-round">cloud_upload</span>
              INVIA RAPPORTO
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default ReviewScreen;