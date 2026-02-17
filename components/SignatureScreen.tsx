
import React, { useRef, useState, useEffect } from 'react';
import { InterventionReport, UserProfile } from '../types';

interface Props {
  report: InterventionReport;
  user: UserProfile;
  onBack: () => void;
  onComplete: (report: InterventionReport) => void;
  onSaveDraft: (report: InterventionReport) => void;
}

const SignatureScreen: React.FC<Props> = ({ report, user, onBack, onComplete, onSaveDraft }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [assistantTechnicians, setAssistantTechnicians] = useState<string[]>(report.assistantTechnicians || []);
  const [newAssistant, setNewAssistant] = useState('');

  // iOS Safari: Preveniamo lo scrolling durante il disegno
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefault = (e: TouchEvent) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchstart', preventDefault as any, { passive: false });
    canvas.addEventListener('touchmove', preventDefault as any, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', preventDefault as any);
      canvas.removeEventListener('touchmove', preventDefault as any);
    };
  }, []);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true);
    setIsEmpty(false);
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

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    }
  };

  const finalize = () => {
    const canvas = canvasRef.current;
    const signature = canvas ? canvas.toDataURL() : undefined;
    onComplete({ ...report, clientSignature: signature, assistantTechnicians });
  };

  const handleSaveAsDraft = () => {
    const canvas = canvasRef.current;
    const signature = !isEmpty && canvas ? canvas.toDataURL() : report.clientSignature;
    onSaveDraft({ ...report, clientSignature: signature, assistantTechnicians });
  };

  const addAssistant = () => {
    if (newAssistant.trim()) {
      setAssistantTechnicians([...assistantTechnicians, newAssistant.trim()]);
      setNewAssistant('');
    }
  };

  const removeAssistant = (index: number) => {
    setAssistantTechnicians(assistantTechnicians.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col bg-background-dark">
      <header className="px-4 h-16 flex items-center justify-between border-b border-slate-800">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400">
          <span className="material-icons-round text-2xl">chevron_left</span>
        </button>
        <h1 className="text-lg font-semibold">Firma e Verifica</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Autorizzazione Cliente</h2>
            <button onClick={clear} className="text-xs text-primary font-bold">Cancella</button>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Si prega di far firmare il responsabile del sito per confermare l'esecuzione dei lavori.
          </p>

          <div className="mb-4 flex flex-col items-center justify-center py-4 bg-surface-dark/50 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ID RAPPORTO PROVVISORIO</div>
            <div className="text-6xl font-black text-primary tracking-tight shadow-neon">{report.id}</div>
          </div>

          <div className="relative group mt-6 h-56 w-full rounded-xl border-2 border-dashed border-slate-700 bg-surface-darker overflow-hidden">
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <span className="text-slate-400 text-lg italic">Firma Qui</span>
              </div>
            )}
            <canvas 
              ref={canvasRef}
              width={350}
              height={220}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              style={{ touchAction: 'none' }} // Cruciale per iOS
              className="w-full h-full"
            />
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <span className="material-icons-round text-xs">touch_app</span>
            Firma digitale per ID: {report.id}
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Verifica Tecnici</h2>
          
          <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center overflow-hidden">
                <img src={user.avatar} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-bold">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tecnico Responsabile</div>
              </div>
            </div>
            <span className="material-icons-round text-green-500">verified</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tecnici Collaboratori</span>
            </div>
            
            <div className="flex gap-2">
              <input 
                value={newAssistant}
                onChange={(e) => setNewAssistant(e.target.value)}
                placeholder="Nome altro tecnico..."
                className="flex-1 bg-surface-dark border border-slate-800 rounded-lg px-3 py-2 text-xs focus:border-primary outline-none text-white"
              />
              <button 
                onClick={addAssistant}
                className="bg-slate-800 text-primary px-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <span className="material-icons-round">add</span>
              </button>
            </div>

            <div className="space-y-2">
              {assistantTechnicians.map((tech, idx) => (
                <div key={idx} className="flex items-center justify-between bg-surface-dark/50 border border-slate-800 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-right-2">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-round text-slate-500 text-sm">person_add</span>
                    <span className="text-xs font-medium">{tech}</span>
                  </div>
                  <button onClick={() => removeAssistant(idx)} className="text-slate-600 hover:text-red-500 transition-colors">
                    <span className="material-icons-round text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="p-4 pb-8 border-t border-slate-800 bg-background-dark/90 backdrop-blur-md space-y-3">
        <button 
          disabled={isEmpty}
          onClick={finalize}
          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all ${
            isEmpty ? 'bg-slate-800 text-slate-600' : 'bg-primary text-white shadow-neon active:scale-95'
          }`}
        >
          Revisione finale
          <span className="material-icons-round">arrow_forward</span>
        </button>
        <button 
          onClick={handleSaveAsDraft}
          className="w-full text-sm font-semibold text-slate-500 hover:text-white transition-colors py-2"
        >
          Salva come bozza
        </button>
      </footer>
    </div>
  );
};

export default SignatureScreen;
