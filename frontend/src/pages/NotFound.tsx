import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-12 text-center max-w-md mx-4">
        <div className="text-6xl mb-6">🎮</div>
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Diese Seite wurde nicht gefunden</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-hover transition-all"
        >
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
};

export default NotFound;
