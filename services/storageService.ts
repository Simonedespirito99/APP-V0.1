
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
    
    // Se l'anno memorizzato è inferiore all'anno corrente, resetta il contatore
    if (storedYear && parseInt(storedYear) < currentYear) {
      return 0;
    }
    
    const current = localStorage.getItem(COUNTER_KEY);
    return current ? parseInt(current) : 0;
  },

  getProjectedId: (offset: number = 1): string => {
    const profile = storageService.getProfile();
    const lastNum = storageService.getLastSentNumber();
    const nextNum = lastNum + offset;
    return `${profile.prefix}-${nextNum.toString().padStart(4, '0')}`;
  },

  realignDraftIds: () => {
    const reports = storageService.getReports();
    const profile = storageService.getProfile();
    const lastNum = storageService.getLastSentNumber();
    
    const drafts = reports
      .filter(r => r.status === 'draft')
      .sort((a, b) => a.timestamp - b.timestamp);
    
    const synced = reports.filter(r => r.status === 'synced');
    
    const updatedDrafts = drafts.map((draft, index) => {
      const newId = `${profile.prefix}-${(lastNum + index + 1).toString().padStart(4, '0')}`;
      return { ...draft, id: newId };
    });

    localStorage.setItem(REPORTS_KEY, JSON.stringify([...synced, ...updatedDrafts]));
  },

  finalizeReport: (tempId: string): string => {
    const reports = storageService.getReports();
    const profile = storageService.getProfile();
    const currentYear = new Date().getFullYear();
    const lastNum = storageService.getLastSentNumber();
    const newNum = lastNum + 1;
    const finalId = `${profile.prefix}-${newNum.toString().padStart(4, '0')}`;
    
    const updatedReports = reports.map(r => {
      if (r.id === tempId) {
        return { 
          ...r, 
          id: finalId, 
          status: 'synced' as const, 
          timestamp: Date.now() 
        };
      }
      return r;
    });

    localStorage.setItem(YEAR_KEY, currentYear.toString());
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
    return data ? JSON.parse(data) : {
      name: 'Alex Mercer',
      role: 'Senior Technician',
      avatar: 'https://picsum.photos/seed/alex/200',
      prefix: 'C',
      settings: {
        darkMode: true,
        syncWifiOnly: true,
        notifications: true
      }
    };
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    storageService.realignDraftIds();
  }
};
