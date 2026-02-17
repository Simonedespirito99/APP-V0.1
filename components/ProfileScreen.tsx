
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
  onLogout: () => void;
}

const ProfileScreen: React.FC<Props> = ({ user, onUpdate, onLogout }) => {
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  
  const [showSignatureConfirm, setShowSignatureConfirm] = useState(false);
  const [showNameConfirm, setShowNameConfirm] = useState(false);
  const [showPhotoConfirm, setShowPhotoConfirm] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  const toggleSetting = (key: keyof UserProfile['settings']) => {
    onUpdate({
      ...user,
      settings: { ...user.settings, [key]: !user.settings[key] }
    });
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      onUpdate({ ...user, name: tempName.trim() });
      setIsEditingName(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = '#067ff9';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
    }
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const endDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      onUpdate({ ...user, permanentSignature: signatureData });
      setIsEditingSignature(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-dark">
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-background-dark/95 z-10 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Profilo e Impostazioni</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-8 space-y-8 hide-scrollbar">
        {/* Header Profilo */}
        <section className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-primary/30 p-1 shadow-neon overflow-hidden bg-surface-dark">
              <img 
                src={user.avatar} 
                className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-300" 
                alt="Avatar"
              />
            </div>
            <button 
              onClick={() => setShowPhotoConfirm(true)}
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-2 border-background-dark shadow-lg active:scale-90 transition-transform"
            >
              <span className="material-icons-round text-sm">photo_camera</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
          
          <div className="text-center w-full max-w-[240px]">
            {isEditingName ? (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <input 
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="text-lg font-bold bg-surface-dark border border-primary rounded-lg text-center w-full py-2 outline-none"
                  placeholder="Nome Cognome"
                />
                <div className="flex gap-2">
                   <button onClick={() => { setIsEditingName(false); setTempName(user.name); }} className="flex-1 py-1 text-xs font-bold text-slate-500 uppercase">Annulla</button>
                   <button onClick={handleNameSave} className="flex-1 py-1 text-xs font-bold text-primary uppercase">Salva</button>
                </div>
              </div>
            ) : (
              <div className="group cursor-pointer" onClick={() => setShowNameConfirm(true)}>
                <h2 className="text-xl font-bold flex items-center justify-center gap-2 group-hover:text-primary transition-colors">
                  {user.name}
                  <span className="material-icons-round text-xs opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                </h2>
                <p className="text-xs text-primary uppercase tracking-widest font-bold mt-1">{user.role}</p>
              </div>
            )}
          </div>
        </section>

        {/* Info Tecniche */}
        <section className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Configurazione ID</h3>
          <div className="bg-surface-dark border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold">Prefisso Rapporti</span>
                <span className="text-[10px] text-slate-500">Utilizzato per generare codici ID</span>
              </div>
              <input 
                value={user.prefix}
                onChange={(e) => onUpdate({ ...user, prefix: e.target.value.toUpperCase().slice(0, 2) })}
                className="w-16 bg-surface-darker border border-slate-700 rounded-lg py-2 text-center text-primary font-black uppercase focus:border-primary outline-none transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-600 italic">Esempio ID: {user.prefix}-0001 (Resetta a Capodanno)</p>
          </div>
        </section>

        {/* Gestione Firma */}
        <section className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Firma del Tecnico</h3>
          
          {!isEditingSignature ? (
            <div 
              onClick={() => setShowSignatureConfirm(true)}
              className="bg-surface-dark border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all group min-h-[120px]"
            >
              {user.permanentSignature ? (
                <img src={user.permanentSignature} alt="Firma Tecnico" className="max-h-24 object-contain invert brightness-200" />
              ) : (
                <div className="text-center py-4">
                  <span className="material-icons-round text-slate-600 text-4xl mb-2">draw</span>
                  <p className="text-xs text-slate-500">Nessuna firma salvata. Clicca per aggiungere.</p>
                </div>
              )}
              <div className="mt-2 text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                CLICCA PER MODIFICARE
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-surface-darker border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden h-48 relative">
                <canvas 
                  ref={canvasRef}
                  width={400}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                  className="w-full h-full touch-none"
                />
                <button 
                  onClick={clearCanvas}
                  className="absolute top-2 right-2 p-2 bg-slate-800/80 rounded-full text-slate-400 hover:text-white"
                >
                  <span className="material-icons-round text-sm">refresh</span>
                </button>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditingSignature(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs"
                >
                  ANNULLA
                </button>
                <button 
                  onClick={saveSignature}
                  className="flex-2 py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-neon"
                >
                  SALVA FIRMA
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Modal Conferma Modifica Nome */}
        {showNameConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowNameConfirm(false)}></div>
            <div className="relative bg-surface-dark border border-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
              <h4 className="text-lg font-bold text-center mb-2">Modifica Nome</h4>
              <p className="text-sm text-slate-400 text-center mb-6">Vuoi modificare il nome visualizzato?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowNameConfirm(false)} className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs uppercase">No</button>
                <button onClick={() => { setShowNameConfirm(false); setIsEditingName(true); }} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-neon uppercase">Sì</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Conferma Modifica Foto */}
        {showPhotoConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowPhotoConfirm(false)}></div>
            <div className="relative bg-surface-dark border border-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
              <h4 className="text-lg font-bold text-center mb-2">Modifica Foto</h4>
              <p className="text-sm text-slate-400 text-center mb-6">Vuoi cambiare l'immagine del profilo?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowPhotoConfirm(false)} className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs uppercase">No</button>
                <button onClick={() => { setShowPhotoConfirm(false); fileInputRef.current?.click(); }} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-neon uppercase">Sì</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Conferma Modifica Firma */}
        {showSignatureConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowSignatureConfirm(false)}></div>
            <div className="relative bg-surface-dark border border-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
              <h4 className="text-lg font-bold text-center mb-2">Modifica Firma</h4>
              <p className="text-sm text-slate-400 text-center mb-6">Vuoi modificare la firma salvata nell'app?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowSignatureConfirm(false)} className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs uppercase">No</button>
                <button onClick={() => { setShowSignatureConfirm(false); setIsEditingSignature(true); }} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-neon uppercase">Sì</button>
              </div>
            </div>
          </div>
        )}

        <section className="space-y-3">
          <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Preferenze App</h3>
          <div className="bg-surface-dark rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800 shadow-md">
            
            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleSetting('darkMode')}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <span className="material-icons-round">dark_mode</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Modalità Scura</span>
                  <span className="text-[10px] text-slate-500">Ottimizzata per lavori notturni</span>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${user.settings.darkMode ? 'bg-primary' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${user.settings.darkMode ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleSetting('syncWifiOnly')}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <span className="material-icons-round">wifi</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Preferenze Sincronizzazione</span>
                  <span className="text-[10px] text-slate-500">Modalità Solo WiFi</span>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${user.settings.syncWifiOnly ? 'bg-primary' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${user.settings.syncWifiOnly ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleSetting('notifications')}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <span className="material-icons-round">notifications</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Notifiche Push</span>
                  <span className="text-[10px] text-slate-500">Avvisi urgenti e aggiornamenti</span>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${user.settings.notifications ? 'bg-primary' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${user.settings.notifications ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-6 pb-20 space-y-6">
          <button 
            onClick={onLogout}
            className="w-full py-4 rounded-xl border border-red-900/50 text-red-500 font-bold hover:bg-red-900/10 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-lg">logout</span>
            DISCONNETTI
          </button>
          <div className="text-center space-y-1">
            <p className="text-[8px] text-slate-600 font-mono">SMIRT v2.5.0 (Build 901)</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfileScreen;
