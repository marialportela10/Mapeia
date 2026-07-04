import React, { createContext, useContext, useState } from 'react';

type LayoutContextType = {
  isNavOpen: boolean;
  setIsNavOpen: (value: boolean) => void;
  isDashboardSidebarOpen: boolean;
  setIsDashboardSidebarOpen: (value: boolean) => void;
};

export const LayoutContext = createContext<LayoutContextType>({
  isNavOpen: false,
  setIsNavOpen: () => {},
  isDashboardSidebarOpen: false,
  setIsDashboardSidebarOpen: () => {},
});

export const useLayoutContext = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isDashboardSidebarOpen, setIsDashboardSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );

  return (
    <LayoutContext.Provider
      value={{
        isNavOpen,
        setIsNavOpen,
        isDashboardSidebarOpen,
        setIsDashboardSidebarOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
