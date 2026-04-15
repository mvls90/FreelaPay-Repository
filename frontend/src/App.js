import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/index';
import { SocketProvider } from './context/SocketContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Landing
import LandingPage from './pages/LandingPage';

// Public
import ProposalViewPage from './pages/ProposalViewPage';

// Freelancer
import FreelancerDashboard from './pages/freelancer/Dashboard';
import FreelancerProposals from './pages/freelancer/Proposals';
import CreateProposal from './pages/freelancer/CreateProposal';
import FreelancerProjects from './pages/freelancer/Projects';
import FreelancerProjectDetail from './pages/freelancer/ProjectDetail';
import FreelancerProfile from './pages/freelancer/Profile';
import FreelancerFinances from './pages/freelancer/Finances';

// Client
import ClientDashboard from './pages/client/Dashboard';
import ClientProjects from './pages/client/Projects';
import ClientProjectDetail from './pages/client/ProjectDetail';
import ClientPayment from './pages/client/Payment';
import ClientProfile from './pages/client/Profile';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminDisputes from './pages/admin/Disputes';
import AdminDisputeDetail from './pages/admin/DisputeDetail';
import AdminTransactions from './pages/admin/Transactions';
import AdminWithdrawals from './pages/admin/Withdrawals';

// Shared
import ChatPage from './pages/shared/Chat';
import NotificationsPage from './pages/shared/Notifications';
import DisputePage from './pages/shared/Dispute';

import Layout from './components/common/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const ProtectedRoute = ({ children, roles }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.type)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, accessToken } = useAuthStore();
  if (accessToken && user) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.type === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
  if (user.type === 'client') return <Navigate to="/cliente/dashboard" replace />;
  if (['admin', 'mediator', 'support'].includes(user.type)) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const stored = localStorage.getItem('freeapi-auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.accessToken) {
          import('./services/api').then(({ default: api }) => {
            api.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
          });
        }
      } catch {}
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public Auth */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/cadastro" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/esqueci-senha" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            <Route path="/verificar-email" element={<VerifyEmailPage />} />

            {/* Proposta pública */}
            <Route path="/proposta/:link" element={<ProposalViewPage />} />

            {/* Dashboard redirect */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

            {/* Freelancer */}
            <Route path="/freelancer" element={<ProtectedRoute roles={['freelancer']}><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<FreelancerDashboard />} />
              <Route path="propostas" element={<FreelancerProposals />} />
              <Route path="propostas/nova" element={<CreateProposal />} />
              <Route path="projetos" element={<FreelancerProjects />} />
              <Route path="projetos/:id" element={<FreelancerProjectDetail />} />
              <Route path="projetos/:id/chat" element={<ChatPage />} />
              <Route path="financeiro" element={<FreelancerFinances />} />
              <Route path="perfil" element={<FreelancerProfile />} />
              <Route path="notificacoes" element={<NotificationsPage />} />
              <Route path="disputas/:id" element={<DisputePage />} />
            </Route>

            {/* Cliente */}
            <Route path="/cliente" element={<ProtectedRoute roles={['client']}><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="projetos" element={<ClientProjects />} />
              <Route path="projetos/:id" element={<ClientProjectDetail />} />
              <Route path="projetos/:id/pagamento" element={<ClientPayment />} />
              <Route path="projetos/:id/chat" element={<ChatPage />} />
              <Route path="perfil" element={<ClientProfile />} />
              <Route path="notificacoes" element={<NotificationsPage />} />
              <Route path="disputas/:id" element={<DisputePage />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin', 'mediator', 'support']}><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="usuarios" element={<AdminUsers />} />
              <Route path="disputas" element={<AdminDisputes />} />
              <Route path="disputas/:id" element={<AdminDisputeDetail />} />
              <Route path="transacoes" element={<AdminTransactions />} />
              <Route path="saques" element={<AdminWithdrawals />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
