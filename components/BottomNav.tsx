
import React from 'react';
import { AppRoute } from '../types';

interface Props {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onNewReport: () => void;
  hasNotifications?: boolean;
}

const BottomNav: React.FC<Props> = ({ currentRoute, onNavigate, onNewReport, hasNotifications = false }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full max-w-md mx-auto z-[100] bg-surface-darker/95 backdrop-blur-xl border-t border-slate-800/50 h-20 pb-4 px-2 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
      
      <button 
        onClick={() => onNavigate(AppRoute.DASHBOARD)}
        className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${currentRoute === AppRoute.DASHBOARD ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <span className="material-icons-round text-2xl">home</span>
        <span className="text-[10px] font-bold uppercase tracking-tight mt-0.5">Home</span>
      </button>

      <button 
        onClick={() => onNavigate(AppRoute.DRAFTS)}
        className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${currentRoute === AppRoute.DRAFTS ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <span className="material-icons-round text-2xl">description</span>
        <span className="text-[10px] font-bold uppercase tracking-tight mt-0.5">Interventi</span>
      </button>

      <div className="relative -top-6 flex flex-col items-center">
        <button 
          onClick={onNewReport}
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-neon-strong hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-background-dark"
        >
          <span className="text-3xl font-light leading-none">+</span>
        </button>
        <span className="text-[10px] font-bold uppercase tracking-tight text-primary mt-1">Nuovo</span>
      </div>

      <button 
        onClick={() => onNavigate(AppRoute.NOTIFICATIONS)}
        className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${currentRoute === AppRoute.NOTIFICATIONS ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <div className="relative">
          <span className="material-icons-round text-2xl">notifications</span>
          {hasNotifications && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface-darker animate-pulse"></span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tight mt-0.5">Avvisi</span>
      </button>

      <button 
        onClick={() => onNavigate(AppRoute.PROFILE)}
        className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${currentRoute === AppRoute.PROFILE ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <span className="material-icons-round text-2xl">person</span>
        <span className="text-[10px] font-bold uppercase tracking-tight mt-0.5">Profilo</span>
      </button>

    </nav>
  );
};

// Add default export
export default BottomNav;
