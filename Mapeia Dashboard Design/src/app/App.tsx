import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';

// App entry point - Force reload
export default function App() {
  React.useEffect(() => {
    // Prevent pinch zoom on iOS Safari, except inside Leaflet map
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        const isMap = (e.target as HTMLElement).closest('.leaflet-container');
        if (!isMap) {
          e.preventDefault();
        }
      }
    };
    
    // Prevent double-tap to zoom on iOS
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        const isMap = (e.target as HTMLElement).closest('.leaflet-container');
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes((e.target as HTMLElement).tagName);
        if (!isMap && !isInput) {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
