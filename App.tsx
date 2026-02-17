
import React, { useState, useEffect, useCallback } from 'react';
import { AppRoute, InterventionReport, UserProfile } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DraftsList from './components/DraftsList';
import ReportForm from './components/ReportForm';
import SignatureScreen from './components/SignatureScreen';
import ReviewScreen from './components/ReviewScreen';
import ProfileScreen from './components/ProfileScreen';
import NotificationsScreen from './components/NotificationsScreen';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [currentUser, setCurrentUser] = useState<UserProfile>(storageService.getProfile());
  const [reports, setReports] = useState<InterventionReport[]>([]);
  const [activeReport, setActiveReport] = useState<InterventionReport | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [remoteLastId, setRemoteLastId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const syncUserData = async (username: string) => {
    if (!username) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const stats = await geminiService.fetchUserStats(username);
      if (stats) {
        storageService.syncCounter(stats.lastNum);
        setRemoteLastId(stats.lastId);
      } else {
        setSyncError("Script non aggiornato o azione negata.");
      }

      const history = await geminiService.fetchUserHistory(username);
      if (history && history.length > 0) {
        storageService.importSyncedReports(history);
      }
    } catch (e) {
      setSyncError("Errore critico di connessione.");
    } finally {
      setReports(storageService.getReports());
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const localReports = storageService.getReports();
    setReports(localReports);
    
    if (currentUser.name) {
      setIsAuthenticated(true);
      setRoute(AppRoute.DASHBOARD);
      syncUserData(currentUser.name);
    }
  }, []);

  const handleLoginSuccess = async (userData: { name: string; prefix: string }) => {
    const updatedProfile = { 
      ...currentUser, 
      name: userData.name, 
      prefix: userData.prefix 
    };
    setCurrentUser(updatedProfile);
    storageService.saveProfile(updatedProfile);
    setIsAuthenticated(true);
    setRoute(AppRoute.DASHBOARD);
    await syncUserData(userData.name);
  };

  const refreshReports = useCallback(() => {
    setReports(storageService.getReports());
  }, []);

  const handleManualRefresh = () => {
    if (currentUser.name) {
      syncUserData(currentUser.name);
    }
  };

  const startNewReport = () => {
    const draftCount = reports.filter(r => r.status === 'draft').length;
    const projectedId = storageService.getProjectedId(draftCount + 1);

    const newReport: InterventionReport = {
      id: projectedId,
      clientId: '',
      clientName: '',
      locationId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:30',
      type: 'Maintenance',
      description: '',
      materials: [],
      selectedUnits: [],
      selectedTasks: [],
      assistantTechnicians: [],
      isLinkedToPrevious: false,
      previousActivityId: '',
      technicianSignature: currentUser.permanentSignature,
      status: 'draft',
      timestamp: Date.now()
    };
    setActiveReport(newReport);
    setRoute(AppRoute.NEW_REPORT);
  };

  const handleSaveDraft = (report: InterventionReport) => {
    storageService.saveReport(report);
    refreshReports();
    setActiveReport(null);
    setRoute(AppRoute.DRAFTS);
  };

  const handleFinalSync = (report: InterventionReport) => {
    storageService.finalizeReport(report);
    refreshReports();
    setActiveReport(null);
    setRoute(AppRoute.DRAFTS);
  };

  const renderScreen = () => {
    switch (route) {
      case AppRoute.LOGIN:
        return <Login onLogin={handleLoginSuccess} />;
      case AppRoute.DASHBOARD:
        return <Dashboard 
          user={currentUser} 
          reports={reports}
          onNewReport={startNewReport} 
          isSyncing={isSyncing} 
          remoteLastId={remoteLastId}
          onRefresh={handleManualRefresh}
          syncError={syncError}
        />;
      case AppRoute.DRAFTS:
        return <DraftsList 
          reports={reports}
          onEdit={(report) => {
            setActiveReport(report);
            setRoute(AppRoute.NEW_REPORT);
          }} 
        />;
      case AppRoute.NOTIFICATIONS:
        return <NotificationsScreen notifications={notifications} onBack={() => setRoute(AppRoute.DASHBOARD)} />;
      case AppRoute.NEW_REPORT:
        return activeReport ? (
          <ReportForm 
            report={activeReport} 
            onSave={handleSaveDraft}
            onContinue={(updated) => {
              setActiveReport(updated);
              setRoute(AppRoute.SIGNATURE);
            }}
            onCancel={() => {
              setActiveReport(null);
              setRoute(AppRoute.DASHBOARD);
            }}
          />
        ) : null;
      case AppRoute.SIGNATURE:
        return activeReport ? (
          <SignatureScreen 
            report={activeReport} 
            user={currentUser}
            onBack={() => setRoute(AppRoute.NEW_REPORT)}
            onComplete={(updated) => {
              setActiveReport(updated);
              setRoute(AppRoute.REVIEW);
            }}
            onSaveDraft={handleSaveDraft}
          />
        ) : null;
      case AppRoute.REVIEW:
        return activeReport ? (
          <ReviewScreen 
            report={activeReport} 
            onSync={handleFinalSync}
            onEdit={() => setRoute(AppRoute.NEW_REPORT)}
            onBack={() => setRoute(AppRoute.SIGNATURE)}
            onSaveDraft={handleSaveDraft}
          />
        ) : null;
      case AppRoute.PROFILE:
        return <ProfileScreen 
          user={currentUser} 
          onUpdate={(u) => {
            setCurrentUser(u);
            storageService.saveProfile(u);
          }}
          onLogout={() => {
            storageService.logout();
            setIsAuthenticated(false);
            setReports([]);
            setRemoteLastId(null);
            setRoute(AppRoute.LOGIN);
          }}
        />;
      default:
        return <Dashboard user={currentUser} reports={reports} onNewReport={startNewReport} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-background-dark text-white max-w-md mx-auto relative overflow-hidden shadow-2xl">
      <div className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </div>
      
      {isAuthenticated && route !== AppRoute.LOGIN && route !== AppRoute.NEW_REPORT && route !== AppRoute.SIGNATURE && route !== AppRoute.REVIEW && (
        <BottomNav 
          currentRoute={route} 
          onNavigate={setRoute} 
          onNewReport={startNewReport}
          hasNotifications={notifications.length > 0}
        />
      )}
    </div>
  );
};

export default App;
