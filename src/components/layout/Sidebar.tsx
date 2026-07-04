import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, MessageSquare, Wallet, Settings, MessageCircle, LogOut, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, requiredPlan: ['trial', 'basic', 'premium'] },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, requiredPlan: ['trial', 'basic', 'premium'] },
  { name: 'Lamora AI', href: '/ai', icon: MessageSquare, requiredPlan: ['trial', 'premium'] },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle, requiredPlan: ['trial', 'premium'] },
  { name: 'Finance', href: '/finance', icon: Wallet, requiredPlan: ['trial', 'basic', 'premium'] },
];

import { Lock } from 'lucide-react';

const Sidebar = () => {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    import('@/lib/api').then((mod) => {
      mod.default.get('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => { });
    });
  }, []);

  const hasAccess = (requiredPlan: string[]) => {
    if (!user) return true; // Show loading state basically, or default to allow until loaded
    const { plan, trialStartDate } = user;

    if (plan === 'premium') return true;

    if (plan === 'trial') {
      const trialDuration = 7 * 24 * 60 * 60 * 1000;
      const trialStart = new Date(trialStartDate).getTime();
      const now = Date.now();
      if (now - trialStart > trialDuration) {
        // Trial expired, only dashboard is accessible (or we can lock everything)
        return false;
      }
      return true; // Active trial has access to everything
    }

    return requiredPlan.includes(plan);
  };

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-border bg-card">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="text-lg font-bold text-foreground flex items-center gap-3">
          <img src="/stack-svg.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm leading-tight text-primary font-bold">Lamora AI</span>
            <span className="text-[10px] text-foreground/50 leading-none mb-1">by Stackfellows</span>
            <span className="text-xs font-normal text-foreground/60">{user?.name || 'Loading...'}</span>
          </div>
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="px-3 space-y-1">
          {navigation.map((item) => {
            const canAccess = hasAccess(item.requiredPlan);

            return (
              <li key={item.name}>
                <NavLink
                  to={canAccess ? item.href : '/pricing'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ${isActive && canAccess
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-foreground/70 hover:bg-primary/5 hover:text-foreground'
                    } ${!canAccess ? 'opacity-75' : ''}`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                  {!canAccess && <Lock className="w-4 h-4 text-foreground/40" />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <div className="flex gap-4 px-3 mb-2 justify-center text-xs text-foreground/50">
          <NavLink to="/pricing" className="hover:text-primary transition-colors font-medium text-primary">Upgrade</NavLink>
          <span>•</span>
          <NavLink to="/terms" className="hover:text-primary transition-colors">Terms</NavLink>
          <span>•</span>
          <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
