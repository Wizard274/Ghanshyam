import React, { createContext, useState, useEffect } from "react";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      return token && storedUser ? storedUser : null;
    } catch {
      return null;
    }
  });

  // Cached dashboard data
  const [dashboardData, setDashboardData] = useState(null);

  // Sync user state to localStorage when it changes manually if needed
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <GlobalContext.Provider value={{ user, setUser, dashboardData, setDashboardData }}>
      {children}
    </GlobalContext.Provider>
  );
};
