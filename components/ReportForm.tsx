
import React, { useState } from 'react';
import { InterventionReport, Material } from '../types';

interface Props {
  report: InterventionReport;
  onSave: (report: InterventionReport) => void;
  onContinue: (report: InterventionReport) => void;
  onCancel: () => void;
}

const TASKS = [
  "Controllo Fgas",
  "R.E.E. gruppi",
  "R.E.E. caldaia",
  "Disinfezione scambiatori di calore",
  "Pulizia filtri aria"
];

const ReportForm: React.FC<Props> = ({ report, onSave, onContinue, onCancel }) => {
  const [formData, setFormData] = useState<InterventionReport>(report);
  const [isUnitsExpanded, setIsUnitsExpanded] = useState(false);
  const [isTypeExpanded, setIsTypeExpanded] = useState(true);
  const [isTasksExpanded, setIsTasksExpanded] = useState(true);

  const updateField = (field: keyof InterventionReport, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMaterial = () => {
    const newMat: Material = { id: Math.random().toString(), name: '', qty: 1, cost: 0 };
    updateField('materials', [...formData.materials, newMat]);
  };

  const removeMaterial = (id: string) => {
    updateField('materials', formData.materials.filter(m => m.id !== id));
  };

  const updateMaterial = (id: string, field: keyof Material, value: any) => {
    const updated = formData.materials.map(m => {
      if (m.id === id) {
        let val = value;
        if (field === 'qty') {
          val = Math.max(0, parseInt(value) || 0);
        }
        return { ...m, [field]: val };
      }
      return m;
    });
    updateField('materials', updated);
  };

  const toggleUnit = (num: number) => {
    const units = formData.selectedUnits.includes(num)
      ? formData.selectedUnits.filter(u => u !== num)
      : [...formData.selectedUnits, num];
    updateField('selectedUnits', units);
  };

  const toggleTask = (task: string) => {
    const tasks = formData.selectedTasks.includes(task)
      ? formData.selectedTasks.filter(t => t !== task)
      : [...formData.selectedTasks, task];
    updateField('selectedTasks', tasks);
  };

  return (
    <div className="h-full flex flex-col bg-surface-darker text-white">
      <header className="flex items-center justify-between px-4 py-4 backdrop-blur-md bg-surface-darker/90 border-b border-gray-800 sticky top-0 z-30">
        <button onClick={onCancel} className="text-primary text-base font-semibold px-2">Annulla</button>
        <h1 className="text-lg font-bold tracking-tight">Nuovo Rapporto</h1>
        <div className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-3 py-1.5 rounded-full">
          ID: {formData.id}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 space-y-8 hide-scrollbar">
        {/* Collegamento Attività Precedente */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Collegamento Attività</h2>
          <div className="bg-surface-dark border border-slate-700 rounded-xl p-4 space-y-3">
             <label className="flex items-center gap-3 cursor-pointer">
               <input 
                 type="checkbox"
                 checked={formData.isLinkedToPrevious}
                 onChange={(e) => updateField('isLinkedToPrevious', e.target.checked)}
                 className="w-5 h-5 rounded border-slate-700 text-primary bg-surface-darker focus:ring-primary"
               />
               <span className="text-sm font-medium text-slate-200">Collega attività precedente</span>
             </label>
             
             {formData.isLinkedToPrevious && (
               <div className="relative animate-in slide-in-from-top-2 duration-300">
                 <span className="material-icons-round absolute left-3 top-3 text-slate-500 text-sm">link</span>
                 <input 
                   value={formData.previousActivityId}
                   onChange={(e) => updateField('previousActivityId', e.target.value)}
                   placeholder="Inserisci codice ID (es. 0000-0001)"
                   className="w-full bg-surface-darker border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-primary outline-none transition-all"
                 />
               </div>
             )}
          </div>
        </div>

        {/* Dettagli Sito */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Dettagli Intervento</h2>
          
          <div className="space-y-3">
            <div className="relative">
              <span className="material-icons-round absolute left-3 top-3.5 text-slate-500 text-lg pointer-events-none">person</span>
              <input 
                value={formData.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                className="w-full bg-surface-dark border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                placeholder="Nome Cliente"
              />
            </div>
            
            <div className="relative">
              <span className="material-icons-round absolute left-3 top-3.5 text-slate-500 text-lg pointer-events-none">place</span>
              <input 
                value={formData.locationId}
                onChange={(e) => updateField('locationId', e.target.value)}
                className="w-full bg-surface-dark border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                placeholder="Sito / Luogo ID"
              />
            </div>

            <div className="relative">
              <span className="material-icons-round absolute left-3 top-3.5 text-slate-500 text-lg pointer-events-none">calendar_today</span>
              <input 
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full bg-surface-dark border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Orario Intervento */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Orario</h2>
          <div className="flex gap-4">
            <div className="flex-1 bg-surface-dark rounded-xl border border-slate-700 p-3">
              <label className="text-[10px] text-primary font-bold uppercase mb-1 block">Inizio</label>
              <input 
                type="time" 
                value={formData.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
                className="bg-transparent border-none p-0 text-white font-bold text-lg focus:ring-0 w-full outline-none"
              />
            </div>
            <div className="flex-1 bg-surface-dark rounded-xl border border-slate-700 p-3">
              <label className="text-[10px] text-primary font-bold uppercase mb-1 block">Fine</label>
              <input 
                type="time" 
                value={formData.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
                className="bg-transparent border-none p-0 text-white font-bold text-lg focus:ring-0 w-full outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tipo di Intervento */}
        <div className="space-y-4">
          <button 
            onClick={() => setIsTypeExpanded(!isTypeExpanded)}
            className="w-full flex items-center justify-between group pl-1"
          >
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">Tipo di Intervento</h2>
            <span className={`material-icons-round text-slate-500 transition-transform duration-300 ${isTypeExpanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {isTypeExpanded && (
            <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2">
              {[
                { id: 'Maintenance', label: 'Manutenzione ordinaria' },
                { id: 'Emergency', label: 'Pronto intervento' },
                { id: 'Presidium', label: 'Presidio' }
              ].map(t => (
                <label 
                  key={t.id}
                  className={`relative flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                    formData.type === t.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-slate-800 bg-surface-dark hover:border-slate-600'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="intervention_type"
                    checked={formData.type === t.id}
                    onChange={() => updateField('type', t.id)}
                    className="w-5 h-5 text-primary bg-transparent border-slate-600 focus:ring-primary focus:ring-2"
                  />
                  <span className="ml-3 text-sm font-medium">{t.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Interventi */}
        <div className="space-y-4">
          <button 
            onClick={() => setIsTasksExpanded(!isTasksExpanded)}
            className="w-full flex items-center justify-between group pl-1"
          >
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">Interventi</h2>
            <span className={`material-icons-round text-slate-500 transition-transform duration-300 ${isTasksExpanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {isTasksExpanded && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              {TASKS.map(task => (
                <label 
                  key={task}
                  className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <input 
                    type="checkbox"
                    checked={formData.selectedTasks.includes(task)}
                    onChange={() => toggleTask(task)}
                    className="w-5 h-5 rounded border-slate-700 text-primary bg-surface-dark focus:ring-primary"
                  />
                  <span className="ml-3 text-sm text-slate-300 group-hover:text-white">{task}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Selezione Unità */}
        <div className="space-y-4">
          <button 
            onClick={() => setIsUnitsExpanded(!isUnitsExpanded)}
            className="w-full flex items-center justify-between group pl-1"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">SCHEDE/COMPONENTI</h2>
              {formData.selectedUnits.length > 0 && (
                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {formData.selectedUnits.length}
                </span>
              )}
            </div>
            <span className={`material-icons-round text-slate-500 transition-transform duration-300 ${isUnitsExpanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {isUnitsExpanded && (
            <div className="bg-surface-dark border border-slate-700 rounded-2xl p-4 grid grid-cols-6 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {Array.from({length: 58}, (_, i) => i + 1).map(n => (
                <button 
                  key={n}
                  onClick={() => toggleUnit(n)}
                  className={`aspect-square flex items-center justify-center rounded-lg text-[10px] font-bold transition-all border ${
                    formData.selectedUnits.includes(n) 
                      ? 'bg-primary border-primary text-white shadow-neon' 
                      : 'bg-surface-darker border-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Descrizione */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Descrizione Lavori</h2>
          <textarea 
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full bg-surface-dark border border-slate-700 rounded-xl py-3.5 px-4 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[120px] resize-none"
            placeholder="Dettagli dell'intervento eseguito..."
          />
        </div>

        {/* Materiali */}
        <div className="space-y-4 overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Materiali e Ricambi</h2>
            <button 
              onClick={addMaterial} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
            >
              <span className="text-xl font-medium">+</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.materials.map(m => (
              <div key={m.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                <input 
                  value={m.name}
                  onChange={(e) => updateMaterial(m.id, 'name', e.target.value)}
                  placeholder="Articolo"
                  className="flex-[3] min-w-0 bg-surface-dark border border-slate-700 rounded-xl text-sm px-4 py-3 outline-none focus:border-primary"
                />
                <div className="flex-1 min-w-[70px] relative">
                   <input 
                    type="number"
                    min="0"
                    value={m.qty}
                    onChange={(e) => updateMaterial(m.id, 'qty', e.target.value)}
                    placeholder="Q.tà"
                    className="w-full bg-surface-dark border border-slate-700 rounded-xl text-sm px-3 py-3 text-center outline-none focus:border-primary appearance-none"
                  />
                </div>
                <button 
                  onClick={() => removeMaterial(m.id)}
                  className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                >
                  <span className="material-icons-round text-lg">delete_outline</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="p-5 pb-10 bg-surface-darker/95 backdrop-blur-md border-t border-slate-800 sticky bottom-0 z-30 space-y-3">
        <button 
          onClick={() => onContinue(formData)}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-neon active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
        >
          <span className="material-icons-round">draw</span>
          FIRMA E CONTINUA
        </button>
        <button 
          onClick={() => onSave(formData)}
          className="w-full text-sm font-semibold text-slate-500 hover:text-white transition-colors py-2"
        >
          Salva come bozza
        </button>
      </footer>
    </div>
  );
};

// Add default export
export default ReportForm;
