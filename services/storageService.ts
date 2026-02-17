
import { InterventionReport, UserProfile } from '../types';

const REPORTS_KEY = 'smirt_reports';
const PROFILE_KEY = 'smirt_profile';
const COUNTER_KEY = 'smirt_id_counter';
const YEAR_KEY = 'smirt_id_year';

export const storageService = {
  getReports: (): InterventionReport[] => {
    const data = localStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getLastSentNumber: (): number => {
    const currentYear = new Date().getFullYear();
    const storedYear = localStorage.getItem(YEAR_KEY);
    
    if (storedYear && parseInt(storedYear) < currentYear) {
      localStorage.setItem(YEAR_KEY, currentYear.toString());
      localStorage.setItem(COUNTER_KEY, '0');
      return 0;
    }
    
    const current = localStorage.getItem(COUNTER_KEY);
    return current ? parseInt(current) : 0;
  },

  syncCounter: (remoteLastNum: number) => {
    const localLastNum = storageService.getLastSentNumber();
    if (remoteLastNum > localLastNum || (localLastNum === 0 && remoteLastNum > 0)) {
      console.log("Sync: Aggiorno contatore locale a", remoteLastNum);
      localStorage.setItem(COUNTER_KEY, remoteLastNum.toString());
      localStorage.setItem(YEAR_KEY, new Date().getFullYear().toString());
    }
  },

  importSyncedReports: (externalReports: any[]) => {
    const localReports = storageService.getReports();
    const existingIds = new Set(localReports.map(r => r.id));
    
    const newReports = externalReports
      .filter(r => r && r.id && !existingIds.has(r.id))
      .map(r => ({
        materials: [],
        selectedUnits: [],
        selectedTasks: [],
        assistantTechnicians: [],
        description: "",
        ...r,
        status: 'synced' as const,
        timestamp: r.timestamp || Date.now()
      })) as InterventionReport[];

    if (newReports.length > 0) {
      console.log("Sync: Importati", newReports.length, "nuovi rapporti dal cloud");
      const merged = [...localReports, ...newReports].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      localStorage.setItem(REPORTS_KEY, JSON.stringify(merged));
    }
  },

  getProjectedId: (offset: number = 1): string => {
    const profile = storageService.getProfile();
    const lastNum = storageService.getLastSentNumber();
    const nextNum = lastNum + offset;
    return `${profile.prefix || 'T'}-${nextNum.toString().padStart(4, '0')}`;
  },

  realignDraftIds: () => {
    const reports = storageService.getReports();
    const profile = storageService.getProfile();
    const lastNum = storageService.getLastSentNumber();
    
    const synced = reports.filter(r => r.status === 'synced');
    const drafts = reports
      .filter(r => r.status === 'draft')
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    const updatedDrafts = drafts.map((draft, index) => {
      const newId = `${profile.prefix || 'T'}-${(lastNum + index + 1).toString().padStart(4, '0')}`;
      return { ...draft, id: newId };
    });

    localStorage.setItem(REPORTS_KEY, JSON.stringify([...synced, ...updatedDrafts]));
  },

  finalizeReport: (report: InterventionReport): string => {
    const reports = storageService.getReports();
    const profile = storageService.getProfile();
    const lastNum = storageService.getLastSentNumber();
    const newNum = lastNum + 1;
    
    const finalId = `${profile.prefix || 'T'}-${newNum.toString().padStart(4, '0')}`;
    
    const finalReport: InterventionReport = {
      ...report,
      id: finalId,
      status: 'synced',
      timestamp: Date.now()
    };

    const otherReports = reports.filter(r => r.id !== report.id);
    const updatedReports = [...otherReports, finalReport];

    localStorage.setItem(YEAR_KEY, new Date().getFullYear().toString());
    localStorage.setItem(COUNTER_KEY, newNum.toString());
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
    
    storageService.realignDraftIds();
    return finalId;
  },

  saveReport: (report: InterventionReport) => {
    const reports = storageService.getReports();
    const index = reports.findIndex(r => r.id === report.id);
    if (index >= 0) {
      reports[index] = report;
    } else {
      reports.push(report);
    }
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    storageService.realignDraftIds();
  },

  getProfile: (): UserProfile => {
    const data = localStorage.getItem(PROFILE_KEY);
    if (data) return JSON.parse(data);
    
    return {
      name: '',
      role: 'Tecnico',
      avatar: 'https://picsum.photos/seed/tech/200',
      prefix: 'T',
      settings: {
        darkMode: true,
        syncWifiOnly: false,
        notifications: true
      }
    };
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    storageService.realignDraftIds();
  },
  
  logout: () => {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(REPORTS_KEY);
    localStorage.removeItem(COUNTER_KEY);
    localStorage.removeItem(YEAR_KEY);
  }
};
