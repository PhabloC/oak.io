import { createContext, useContext, useState } from "react";

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = [currentYear, currentYear + 1, currentYear + 2];

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, years }}>
      {children}
    </YearContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useYear = () => useContext(YearContext);
