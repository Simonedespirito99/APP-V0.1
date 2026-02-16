
import React, { useState, useEffect } from 'react';
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
  const [aiReview, setAiReview] = useState('Analisi rapporto in corso...');
  const [isSyncing, setIsSyncing] = useState(false);
  const user: UserProfile = storageService.getProfile();

  useEffect(() => {
    geminiService.reviewReport(report).then(setAiReview);
  }, [report]);

  const handleSync = async () => {
    setIsSyncing(true);
    // Passiamo anche il nome utente per la colonna B del foglio
    const success = await geminiService.syncToSheets(report, user.name);
    if (success) {
      onSync({ ...report, status: 'synced', timestamp: Date.now() });
    } else {
      setIsSyncing(false);
      alert("Invio fallito. Controlla la connessione.");
    }
  };

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
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 items-start">
          <span className="material-icons-round text-primary text-xl">psychology</span>
          <div>
            <h4 className="text-[10px] font-bold text-primary uppercase mb-1 tracking-widest">AI Audit</h4>
            <p className="text-sm text-slate-300 leading-tight">{aiReview}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="material-icons-round text-primary text-sm">domain</span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cliente e Luogo</h2>
          </div>
          <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Responsabile (Col. B)</span>
              <span className="text-xs font-bold text-primary">{user.name}</span>
            </div>
            <div className="h-px bg-slate-800"></div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Cliente (Col. C)</span>
              <span className="text-xs font-bold">{report.clientName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Luogo (Col. D)</span>
              <span className="text-xs font-bold">{report.locationId || '-'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="material-icons-round text-primary text-sm">group</span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Personale Addizionale (Col. P)</h2>
          </div>
          <div className="bg-surface-dark border border-slate-800 rounded-xl p-4">
             <div className="flex flex-col gap-2">
                {report.assistantTechnicians && report.assistantTechnicians.length > 0 ? (
                  report.assistantTechnicians.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tecnico Assistente</span>
                      <span className="font-bold">{t}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Nessun tecnico aggiuntivo</span>
                )}
             </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="material-icons-round text-primary text-sm">engineering</span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Dettagli Intervento (Col. I, J, K)</h2>
          </div>
          <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 space-y-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Task Selezionati (Col. I)</p>
              <div className="flex flex-wrap gap-1">
                {report.selectedTasks.map(t => (
                  <span key={t} className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Schede/Componenti (Col. J)</p>
              <p className="text-xs font-mono text-primary font-bold">
                {report.selectedUnits.length > 0 ? report.selectedUnits.sort((a,b)=>a-b).join(", ") : "Nessuna"}
              </p>
            </div>
            <div className="pt-2">
              <p className="text-[10px] text-slate-500 uppercase mb-2">Note (Col. K)</p>
              <p className="text-xs leading-relaxed text-slate-300">{report.description || 'Nessuna descrizione.'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-10">
          <div className="flex items-center gap-2 px-1">
            <span className="material-icons-round text-primary text-sm">inventory_2</span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Materiali (Col. L)</h2>
          </div>
          <div className="bg-surface-dark border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                <tr>
                  <th className="px-4 py-2">Articolo</th>
                  <th className="px-4 py-2 text-right">Quantità</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800">
                {report.materials.map(m => (
                  <tr key={m.id}>
                    <td className="px-4 py-3">{m.name || 'Misc'}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary">{m.qty}</td>
                  </tr>
                ))}
                {report.materials.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-3 text-center text-slate-600 italic">Nessun materiale</td></tr>
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
              SINCRONIZZAZIONE...
            </>
          ) : (
            <>
              <span className="material-icons-round">cloud_upload</span>
              CONFERMA E INVIA
            </>
          )}
        </button>
        <button 
          onClick={() => onSaveDraft(report)}
          className="w-full text-sm font-semibold text-slate-500 hover:text-white transition-colors py-2 text-center"
        >
          Salva come bozza locale
        </button>
      </footer>
    </div>
  );
};

export default ReviewScreen;
