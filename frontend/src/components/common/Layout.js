import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useNotificationStore } from '../../store/index';
import { useSocket } from '../../context/SocketContext';
import {
  LayoutDashboard, FileText, FolderOpen, MessageSquare,
  Bell, Wallet, User, LogOut, Menu, X, Shield,
  Users, AlertTriangle, CreditCard, Download, ChevronDown, Trophy
} from 'lucide-react';
import clsx from 'clsx';

const freelancerNav = [
  { to: '/freelancer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/freelancer/propostas', icon: FileText, label: 'Propostas' },
  { to: '/freelancer/projetos', icon: FolderOpen, label: 'Projetos', badge: true },
  { to: '/freelancer/financeiro', icon: Wallet, label: 'Financeiro' },
  { to: '/freelancer/top-freelancers', icon: Trophy, label: 'Top Freelancers' },
  { to: '/freelancer/perfil', icon: User, label: 'Perfil' },
];

const clientNav = [
  { to: '/cliente/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cliente/projetos', icon: FolderOpen, label: 'Meus Projetos' },
  { to: '/cliente/top-freelancers', icon: Trophy, label: 'Top Freelancers' },
  { to: '/cliente/perfil', icon: User, label: 'Perfil' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { to: '/admin/disputas', icon: AlertTriangle, label: 'Disputas' },
  { to: '/admin/transacoes', icon: CreditCard, label: 'Transações' },
  { to: '/admin/saques', icon: Download, label: 'Saques' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = user?.type === 'freelancer' ? freelancerNav
    : user?.type === 'client' ? clientNav
    : adminNav;

  const notifPath = user?.type === 'freelancer' ? '/freelancer/notificacoes'
    : user?.type === 'client' ? '/cliente/notificacoes'
    : '/admin/notificacoes';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    freelancer: 'Freelancer',
    client: 'Cliente',
    admin: 'Administrador',
    mediator: 'Mediador',
    support: 'Suporte',
  }[user?.type] || '';

  const roleColor = {
    freelancer: 'bg-blue-100 text-blue-700',
    client: 'bg-green-100 text-green-700',
    admin: 'bg-purple-100 text-purple-700',
    mediator: 'bg-orange-100 text-orange-700',
    support: 'bg-gray-100 text-gray-700',
  }[user?.type] || 'bg-gray-100 text-gray-700';

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
  <div className="flex items-center justify-between">
    <img src="/logo.png" alt="FreelaPay" className="h-10 w-auto" />
    <div className="flex items-center gap-1.5">
      <div className={clsx('w-1.5 h-1.5 rounded-full', isConnected ? 'bg-green-500' : 'bg-gray-300')} />
      <span className="text-xs text-gray-400">{isConnected ? 'Online' : 'Offline'}</span>
    </div>
  </div>
</div>
        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
  key={to}
  to={to}
  onClick={() => setSidebarOpen(false)}
  className={({ isActive }) => clsx(
    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  )}
>
  <Icon size={18} />
  {label}
</NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
              <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', roleColor)}>{roleLabel}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </div>

          {userMenuOpen && (
            <div className="mt-2 bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 h-14 flex items-center justify-between flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-sm font-medium text-gray-500">
              Bem-vindo, <span className="text-gray-900 font-semibold">{user?.full_name?.split(' ')[0]}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notificações */}
            <button
              onClick={() => navigate(notifPath)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
