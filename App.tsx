
import React, { useState, useEffect } from 'react';
import { AppRoute, InterventionReport, UserProfile } from './types';
import { storageService } from './services/storageService';
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
  const [activeReport, setActiveReport] = useState<InterventionReport | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleLoginSuccess = (userData: { name: string; prefix: string }) => {
    const updatedProfile = { 
      ...currentUser, 
      name: userData.name, 
      prefix: userData.prefix 
    };
    setCurrentUser(updatedProfile);
    storageService.saveProfile(updatedProfile);
    setIsAuthenticated(true);
    setRoute(AppRoute.DASHBOARD);
  };

  const startNewReport = () => {
    const reports = storageService.getReports();
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
    setActiveReport(null);
    setRoute(AppRoute.DRAFTS);
  };

  const handleFinalSync = (report: InterventionReport) => {
    storageService.finalizeReport(report.id);
    setActiveReport(null);
    setRoute(AppRoute.DRAFTS);
  };

  const renderScreen = () => {
    switch (route) {
      case AppRoute.LOGIN:
        return <Login onLogin={handleLoginSuccess} />;
      case AppRoute.DASHBOARD:
        return <Dashboard user={currentUser} onNewReport={startNewReport} />;
      case AppRoute.DRAFTS:
        return <DraftsList 
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
            setIsAuthenticated(false);
            setRoute(AppRoute.LOGIN);
          }}
        />;
      default:
        return <Dashboard user={currentUser} onNewReport={startNewReport} />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background-dark text-white max-w-md mx-auto relative overflow-hidden shadow-2xl">
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
