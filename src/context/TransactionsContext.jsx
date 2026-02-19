import { createContext, useState, useContext } from "react";

const TransactionsContext = createContext();

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  return (
    <TransactionsContext.Provider value={{ transactions, setTransactions }}>
      {children}
    </TransactionsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook is used with TransactionsProvider
export const useTransactions = () => useContext(TransactionsContext);
