
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';

interface Props {
  onLogin: (userData: { name: string; prefix: string }) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await geminiService.verifyLogin(username, password);

      if (result && result.success) {
        onLogin({ 
          name: result.username || username, 
          prefix: result.prefix || 'C' 
        });
      } else {
        setError(result?.message || 'Credenziali errate o server non risponde');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Errore di connessione al database');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 bg-background-dark relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm space-y-10 relative z-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-neon-strong">
            <span className="material-icons-round text-white text-4xl">engineering</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter text-white mb-1">SMIRT</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Portale Tecnico</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <div className="relative group">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg">person</span>
              <input 
                type="text"
                placeholder="Utente"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-dark border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary outline-none transition-all"
              />
            </div>
            
            <div className="relative group">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg">lock</span>
              <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-dark border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 animate-bounce">
              <span className="material-icons-round text-red-500 text-sm">error</span>
              <span className="text-[11px] text-red-400 font-bold uppercase">{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-neon transition-all flex items-center justify-center gap-3 ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>ACCEDI</span>
                <span className="material-icons-round text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
