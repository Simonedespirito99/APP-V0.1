
import React from 'react';

interface Props {
  notifications: any[];
  onBack: () => void;
}

const NotificationsScreen: React.FC<Props> = ({ notifications, onBack }) => {
  return (
    <div className="h-full flex flex-col bg-background-dark">
      <header className="px-6 py-6 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-background-dark/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400">
            <span className="material-icons-round">chevron_left</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-white">Avvisi</h1>
        </div>
        {notifications.length > 0 && (
          <button className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            Segna come letti
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 hide-scrollbar">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
            <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center">
              <span className="material-icons-round text-5xl text-slate-600">notifications_off</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Nessuna notifica</h3>
              <p className="text-sm text-slate-400 max-w-[200px] mx-auto">
                Ottimo lavoro! Non ci sono nuovi avvisi o compiti pendenti al momento.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface-dark border border-slate-800 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-primary text-xl">info</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                  <p className="text-xs text-slate-400 leading-tight">{notif.message}</p>
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block pt-1">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Add default export
export default NotificationsScreen;
