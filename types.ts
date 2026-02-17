
export interface Material {
  id: string;
  name: string;
  qty: number;
  cost: number;
}

export interface InterventionReport {
  id: string;
  clientId: string;
  clientName: string;
  locationId: string;
  startTime: string;
  endTime: string;
  date: string;
  type: 'Maintenance' | 'Emergency' | 'Presidium';
  description: string;
  materials: Material[];
  selectedUnits: number[];
  selectedTasks: string[];
  isLinkedToPrevious?: boolean;
  previousActivityId?: string;
  technicianSignature?: string;
  clientSignature?: string;
  assistantTechnicians: string[]; // Nuovi tecnici coinvolti
  status: 'draft' | 'synced';
  timestamp: number;
  aiReview?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  prefix: string; // Esempio: 'C'
  permanentSignature?: string;
  settings: {
    darkMode: boolean;
    syncWifiOnly: boolean;
    notifications: boolean;
  };
}

export enum AppRoute {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  DRAFTS = 'drafts',
  NEW_REPORT = 'new_report',
  SIGNATURE = 'signature',
  REVIEW = 'review',
  PROFILE = 'profile',
  NOTIFICATIONS = 'notifications'
}
