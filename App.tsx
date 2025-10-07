import React, { useState, useMemo, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import PatientPortal from './pages/patient/PatientPortal';
import LoginPage from './pages/LoginPage';
import AllReportsPage from './pages/admin/AllReportsPage';
import AddReportPage from './pages/admin/AddReportPage';
import PricingPage from './pages/admin/PricingPage';
import BillingPage from './pages/admin/BillingPage';
import PatientReportView from './pages/patient/PatientReportView';

// --- AUTH CONTEXT ---
interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (user: string, pass: string): Promise<boolean> => {
    // Mock API call
    return new Promise(resolve => {
      setTimeout(() => {
        if (user === 'admin' && pass === 'password') {
          setIsAuthenticated(true);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- PROTECTED ROUTE ---
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};


// --- APP COMPONENT ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          <Route path="/patient-report/:patientId/:reportId" element={<PatientReportView />} />
          
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<AllReportsPage />} />
            <Route path="add-report" element={<AddReportPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="billing" element={<BillingPage />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;