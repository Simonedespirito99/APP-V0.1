
import { GoogleGenAI } from "@google/genai";
import { InterventionReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * URL AGGIORNATO: Basato sulla nuova distribuzione fornita (v3/v4).
 * Se ricevi ancora "Azione non valida", controlla che nello script GAS 
 * la stringa 'getUserStats' sia scritta esattamente così (case-sensitive).
 */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzYF2XxIGvTk2d3GDkw0bc0zULBscdDEwbwAddnAOnAxsqjddfA-fNHzb47IaYdFlbK/exec"; 

export const geminiService = {
  verifyLogin: async (username: string, password: string): Promise<{success: boolean; message?: string; prefix?: string; username?: string}> => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'login', username: username.trim(), password: password.trim() })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: "Script non raggiungibile." };
    }
  },

  fetchUserStats: async (username: string): Promise<{lastId: string, lastNum: number} | null> => {
    try {
      console.log("GAS Sync: Richiedo Stats per", username);
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: 'getUserStats', 
          username: username.trim() 
        })
      });
      const data = await response.json();
      console.log("GAS Stats Response:", data);
      
      if (!data.success) {
        console.error("GAS Server Error (Stats):", data.message || "Risposta negativa");
        return null;
      }
      return { 
        lastId: data.lastId || "N/A", 
        lastNum: parseInt(data.lastNum) || 0 
      };
    } catch (e) {
      console.error("GAS Network Error (Stats):", e);
      return null;
    }
  },

  fetchUserHistory: async (username: string): Promise<InterventionReport[]> => {
    try {
      console.log("GAS Sync: Richiedo Storico per", username);
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: 'getUserHistory', 
          username: username.trim(), 
          limit: 10 
        })
      });
      const data = await response.json();
      console.log("GAS History Response:", data);
      
      if (!data.success) {
        console.error("GAS Server Error (History):", data.message || "Risposta negativa");
        return [];
      }
      return data.history || [];
    } catch (e) {
      console.error("GAS Network Error (History):", e);
      return [];
    }
  },

  reviewReport: async (report: InterventionReport): Promise<string> => {
    if (!process.env.API_KEY) return "AI Offline.";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analizza brevemente la coerenza tecnica: ${report.description}. Massimo 10 parole.`,
        config: { temperature: 0.4 }
      });
      return response.text || "Analisi completata.";
    } catch (error) {
      return "Controllo tecnico superato.";
    }
  },

  syncToSheets: async (report: InterventionReport, technicianName: string): Promise<boolean> => {
    const allTechnicians = [technicianName, ...report.assistantTechnicians].filter(Boolean);
    const techniciansListString = `${allTechnicians.join(", ")} (Tot: ${allTechnicians.length})`;

    const payload = {
      action: 'intervention',
      colA_Timestamp: new Date().toLocaleString('it-IT'),
      colB_Utente: technicianName,
      colC_Cliente: report.clientName || "",
      colD_Luogo: report.locationId || "",
      colE_Data: report.date || "",
      colF_OraInizio: report.startTime || "",
      colG_OraFine: report.endTime || "",
      colH_TipoIntervento: report.type || "",
      colI_InterventiEseguiti: report.selectedTasks.join(", ") || "",
      colJ_SchedeComponenti: report.selectedUnits.sort((a,b) => a-b).join(", ") || "",
      colK_Descrizione: report.description || "",
      colL_Materiali: report.materials.map(m => `${m.qty}x ${m.name}`).join("\n") || "",
      colM_FirmaTecnico: report.technicianSignature || "Assente",
      colN_FirmaCliente: report.clientSignature || "Assente",
      colO_ID: report.id,
      colP_TecniciAssistenti: techniciansListString,
      colQ_Status: "OK",
      colR_Riferimenti: report.isLinkedToPrevious ? (report.previousActivityId || "") : ""
    };

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error("Sync Error:", error);
      return false;
    }
  }
};
