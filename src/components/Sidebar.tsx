'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', Icon: Users },
  { href: '/payments', label: 'Registro de Pagos', Icon: CreditCard },
  { href: '/sectors', label: 'Estadisticas Sectores', Icon: PieChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2.5 rounded-xl shadow-lg hover:bg-slate-700 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        min-h-screen flex flex-col
        transform transition-all duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        shadow-2xl
      `}>
        {/* Logo area */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="sidebar-header-text min-w-0">
                <h1 className="text-sm font-bold text-white leading-tight truncate">
                  Facturacion
                </h1>
                <h1 className="text-sm font-bold text-white leading-tight truncate">
                  Cobranzas
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider mt-0.5">2018 – 2026</p>
              </div>
            )}
          </div>

          {/* Close button (mobile) */}
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            aria-label="Cerrar menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-slate-700/50 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            aria-label={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-slate-700/50" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                  ${collapsed ? 'justify-center px-0' : ''}
                  ${active
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white font-semibold shadow-sm border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                  ${active ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-700/50'}
                `}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                {!collapsed && (
                  <span className="sidebar-label truncate">{item.label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3">
          <div className="mx-1 border-t border-slate-700/50 mb-3" />
          <div className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl
            bg-slate-800/50 border border-slate-700/30
            ${collapsed ? 'justify-center px-2' : ''}
          `}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
              CV
            </div>
            {!collapsed && (
              <div className="sidebar-label min-w-0">
                <p className="text-xs font-semibold text-white truncate">Carlos Vieira</p>
                <p className="text-[10px] text-slate-500 truncate">Administrador</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
