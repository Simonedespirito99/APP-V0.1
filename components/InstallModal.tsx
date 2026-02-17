
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess: () => void;
}

const InstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center px-4 pb-10 sm:items-center">
      <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-surface-dark border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        <div className="bg-primary/10 p-6 flex flex-col items-center text-center border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-neon-strong mb-4">
            <span className="material-icons-round text-white text-4xl">smartphone</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Versione Mobile</h2>
          <p className="text-sm text-slate-400">Ottieni SMIRT come App Nativa.</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Dato che questa è un'anteprima, non è possibile installarla direttamente da qui.
            </p>
            <p className="text-xs text-white font-bold leading-relaxed">
              Per avere l'app sul telefono dei tecnici (file APK o iOS):
            </p>
            <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4">
              <li>Scarica la cartella del progetto sul tuo PC.</li>
              <li>Leggi il file <code className="text-primary font-bold">ISTRUZIONI_MOBILE.md</code> incluso.</li>
              <li>Segui i 3 semplici passi per creare l'installatore.</li>
            </ul>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all text-xs uppercase"
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;
