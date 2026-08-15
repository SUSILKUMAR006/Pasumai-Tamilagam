import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle,
  TreePine,
  Users,
  Settings,
  Map,
  BarChart3,
  FileSpreadsheet,
  Leaf,
  Settings2,
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Verification Queue', path: '/admin/verification', icon: CheckCircle },
    { name: 'All Trees', path: '/admin/trees', icon: TreePine },
    { name: 'Users List', path: '/admin/users', icon: Users },
    { name: 'Tree Species', path: '/admin/species', icon: Settings2 },
    { name: 'Admin Map', path: '/admin/map', icon: Map },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen hidden md:flex flex-col border-r border-slate-800 shrink-0">
      <div className="p-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-2 text-emerald-400 font-bold">
          <Leaf className="h-6 w-6 stroke-[2.5]" />
          <span className="text-white tracking-wider text-base uppercase">Admin Console</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive(item.path)
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive(item.path) ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        <span>Pasumai Kappom Admin v1.0</span>
      </div>
    </aside>
  );
};

export default AdminSidebar;
