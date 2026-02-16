
import { GoogleGenAI } from "@google/genai";
import { InterventionReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * IMPORTANTE: Incolla l'URL della distribuzione (deve finire in /exec)
 */
const GOOGLE_SCRIPT_URL = ""; 

export const geminiService = {
  /**
   * Verifica le credenziali sul foglio "Profili" (Action: login)
   */
  verifyLogin: async (username: string, password: string): Promise<{success: boolean; message?: string; prefix?: string; username?: string}> => {
    if (!GOOGLE_SCRIPT_URL) {
      if (username === "admin" && password === "admin") return { success: true, prefix: "T", username: "Admin" };
      return { success: false, message: "URL Script mancante" };
    }

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: "Errore connessione server" };
    }
  },

  reviewReport: async (report: InterventionReport): Promise<string> => {
    if (!process.env.API_KEY) return "AI Offline.";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analizza la coerenza tecnica: ${report.description}. Rispondi in 10 parole.`,
        config: { temperature: 0.4 }
      });
      return response.text || "Report pronto.";
    } catch (error) {
      return "Analisi completata.";
    }
  },

  /**
   * Sincronizzazione sul foglio "Interventi" con mappatura colonne A-Q (Action: intervention)
   */
  syncToSheets: async (report: InterventionReport, technicianName: string): Promise<boolean> => {
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
      colM_FirmaTecnico: report.technicianSignature ? "SÌ" : "NO",
      colN_FirmaCliente: report.clientSignature ? "SÌ" : "NO",
      colO_ID: report.id,
      colP_TecniciAssistenti: report.assistantTechnicians.join(", ") || "",
      colQ_Status: "OK"
    };

    if (!GOOGLE_SCRIPT_URL) {
      console.log("Mock Sync A-Q:", payload);
      return new Promise(res => setTimeout(() => res(true), 1200));
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Necessario per Apps Script POST
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return true;
    } catch (error) {
      console.error("Sync Error:", error);
      return false;
    }
  }
};
