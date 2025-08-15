import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Dice3, Gamepad2, Home, Mail, User, LogOut, Moon, Sun, Globe, DollarSign, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsOpen(false);
    setExpandedMenu(null);
  }, [location]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setExpandedMenu(null);
        setUserMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleExpanded = (menu: string) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const menuItems = [
    { name: t('home.menu'), href: '/', icon: Home },
            {
      name: t('games.title'),
      href: '#',
      icon: Gamepad2,
      subItems: [
        { name: t('lobby'), href: '/spiele/lobby' },
        { name: t('games.snake.title'), href: '/spiele/snake' },
        { name: t('games.tetris.title'), href: '/spiele/tetris' },
        { name: t('games.tictactoe.title'), href: '/spiele/tictactoe' },
      ]
    },
    { name: t('gamble.landing.title'), href: '#', icon: DollarSign, subItems: [
  { name: t('lobby'), href: '/gamble/lobby' },
  { name: t('riskplay.title'), href: '/gamble/riskplay' },
  { name: t('hrc.title'), href: '/gamble/high-risk-clicker' },
  { name: t('blackjack.title'), href: '/gamble/blackjack' },
 ]},
    {
      name: t('random.menu'),
      href: '#',
      icon: Dice3,
      subItems: [
        { name: t('random.coinflip.title'), href: '/zufall/muenzwurf' },
        { name: t('random.number.title'), href: '/zufall/zahl' },
        { name: t('random.wheel.title'), href: '/zufall/gluecksrad' },
      ]
    },
    { name: t('weather.title'), href: '/wetter', icon: Sun },
    { name: t('contact.title'), href: '/kontakt', icon: Mail },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', href: '/admin', icon: Shield }] : []),
  ];

  const userDisplayName = isAuthenticated ? (user?.isGuest ? t('auth.guest') : user?.name ?? 'User') : t('auth.guest');

  return (
    <>
      <nav className="nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold text-primary hover-lift"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span>Nurvio Hub</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.subItems ? (
                    <div className="relative">
                      <button
                        className={cn(
                          "flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors",
                          "hover:bg-muted text-foreground"
                        )}
                        type="button"
                      >
                        <item.icon size={18} />
                        <span>{item.name}</span>
                        <ChevronDown size={16} className="transition-transform group-hover:rotate-180" />
                      </button>
                      <div className="absolute top-full left-0 mt-2 w-56 glass rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 animate-slide-down z-20">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors",
                        location.pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right: user status only */}
            <div className="hidden md:flex items-center gap-4">
              {/* If guest, show Sign Up / Log In */}
              {!user?.id && user?.isGuest && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}>{t('auth.signup')}</Button>
                  <Button className="bg-gradient-primary" onClick={() => { setAuthMode('login'); setAuthOpen(true); }}>{t('auth.login')}</Button>
                </div>
              )}

              {/* Authenticated user dropdown */}
              {isAuthenticated && !user?.isGuest && (
                <div className="relative" ref={userMenuRef}>
                  <Button variant="ghost" className="flex items-center gap-2" onClick={() => setUserMenuOpen((v) => !v)}>
                    <User size={18} />
                    <span className="font-medium flex items-center gap-2">
                      {userDisplayName}
                      {user?.role === 'admin' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-600 text-white">Admin</span>
                      )}
                    </span>
                    <ChevronDown size={16} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
                  </Button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 glass rounded-lg p-2 z-30 animate-fade-in">
                      <div className="px-3 py-2 text-xs text-muted-foreground">Einstellungen</div>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted"
                        onClick={() => toggleTheme()}
                      >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        <span>{isDark ? t('common.lightMode') : t('common.darkMode')}</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted"
                        onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                      >
                        <Globe size={16} />
                        <span>{language.toUpperCase()}</span>
                      </button>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted">
                          <Shield size={16} />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <div className="h-px my-2 bg-border" />
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-red-500"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" size="icon" className="md:hidden">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mobile-menu animate-fade-in">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {menuItems.map((item) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
                        type="button"
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon size={20} />
                          <span>{item.name}</span>
                        </div>
                        <ChevronDown 
                          size={16} 
                          className={cn(
                            "transition-transform",
                            expandedMenu === item.name && "rotate-180"
                          )}
                        />
                      </button>
                      {expandedMenu === item.name && (
                        <div className="ml-6 mt-2 space-y-1 animate-slide-down">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-colors",
                        location.pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
              {/* Mobile: user settings */}
              <div className="pt-4 space-y-2">
                <div className="px-3 text-xs text-muted-foreground">Einstellungen</div>
                <button className="w-full flex items-center gap-2 px-3 py-3 rounded hover:bg-muted" onClick={() => toggleTheme()}>
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{isDark ? t('common.lightMode') : t('common.darkMode')}</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-3 rounded hover:bg-muted" onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}>
                  <Globe size={18} />
                  <span>{language.toUpperCase()}</span>
                </button>
                {isAuthenticated && (
                  <button className="w-full flex items-center gap-2 px-3 py-3 rounded hover:bg-muted text-red-500" onClick={logout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth modal */}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} mode={authMode} />

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;