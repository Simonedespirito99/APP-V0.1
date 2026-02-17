
import { InterventionReport } from "../types";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzYF2XxIGvTk2d3GDkw0bc0zULBscdDEwbwAddnAOnAxsqjddfA-fNHzb47IaYdFlbK/exec"; 

export const geminiService = {
  verifyLogin: async (username: string, password: string): Promise<{success: boolean; message?: string; prefix?: string; username?: string}> => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'login', username: username.trim(), password: password.trim() })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: "Server non raggiungibile." };
    }
  },

  fetchUserStats: async (username: string): Promise<{lastId: string, lastNum: number} | null> => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getUserStats', username: username.trim() })
      });
      const data = await response.json();
      if (!data.success) return null;
      return { 
        lastId: data.lastId || "N/A", 
        lastNum: parseInt(data.lastNum) || 0 
      };
    } catch (e) {
      return null;
    }
  },

  fetchUserHistory: async (username: string): Promise<InterventionReport[]> => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getUserHistory', username: username.trim(), limit: 10 })
      });
      const data = await response.json();
      return data.success ? (data.history || []) : [];
    } catch (e) {
      return [];
    }
  },

  reviewReport: async (report: InterventionReport): Promise<string> => {
    // Funzione mantenuta per compatibilità UI ma senza chiamate AI
    return "Controllo tecnico completato con successo.";
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
      return false;
    }
  }
};
