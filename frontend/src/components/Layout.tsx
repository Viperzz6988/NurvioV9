import React, { useEffect, useState } from 'react';
import Navigation from './Navigation';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import SessionStartModal from '@/components/auth/SessionStartModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [dbDown, setDbDown] = useState(false);

  useEffect(() => {
    setShowSessionModal(!isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    const onDbDown = () => setDbDown(true);
    window.addEventListener('db_unavailable', onDbDown as EventListener);
    return () => window.removeEventListener('db_unavailable', onDbDown as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {dbDown && (
        <div className="w-full bg-amber-500/20 text-amber-900 dark:text-amber-200 py-2 text-center text-sm">
          Score saving currently unavailable — you can still play as guest, scores will not be saved.
        </div>
      )}

      <main className="pt-16 min-h-screen">
        {children}
      </main>

      <Toaster />

      <SessionStartModal open={showSessionModal} onOpenChange={setShowSessionModal} />
    </div>
  );
};

export default Layout;