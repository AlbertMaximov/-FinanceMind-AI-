import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, Goal, Obligation, Budget } from '../types';

interface FinanceState {
  transactions: Transaction[];
  goals: Goal[];
  obligations: Obligation[];
  budgets: Budget[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateBudget: (category: string, planned: number) => void;
  addBudget: (budget: Budget) => void;
  deleteBudget: (category: string) => void;
}

const FinanceContext = createContext<FinanceState | undefined>(undefined);

const defaultTransactions: Transaction[] = [
  { id: '1', date: new Date().toISOString(), amount: 150000, type: 'income', category: 'Зарплата', description: 'Зарплата за месяц' },
  { id: '2', date: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 12000, type: 'expense', category: 'Еда', description: 'Продукты' },
  { id: '3', date: new Date(Date.now() - 86400000 * 5).toISOString(), amount: 5000, type: 'expense', category: 'Транспорт', description: 'Бензин' },
];

const defaultGoals: Goal[] = [
  { id: '1', name: 'Отпуск', target_amount: 150000, current_amount: 50000, deadline: new Date(Date.now() + 86400000 * 180).toISOString(), monthly_contribution: 15000, priority: 'high' }
];

const defaultBudgets: Budget[] = [
  { category: 'Еда', planned: 30000, actual: 12000 },
  { category: 'Транспорт', planned: 10000, actual: 5000 },
  { category: 'Развлечения', planned: 15000, actual: 0 },
  { category: 'Жильё', planned: 40000, actual: 0 },
  { category: 'Другое', planned: 10000, actual: 0 },
];

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>(defaultBudgets);

  // Recalculate budget actuals when transactions change
  useEffect(() => {
    const newBudgets = budgets.map(b => ({ ...b, actual: 0 }));
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const budget = newBudgets.find(b => b.category === tx.category);
        if (budget) {
          budget.actual += tx.amount;
        } else {
          // Add to 'Другое' if category not found in budgets
          const other = newBudgets.find(b => b.category === 'Другое');
          if (other) other.actual += tx.amount;
        }
      }
    });
    setBudgets(newBudgets);
  }, [transactions]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal = { ...goal, id: Math.random().toString(36).substr(2, 9) };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateBudget = (category: string, planned: number) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, planned } : b));
  };

  const addBudget = (budget: Budget) => {
    if (!budgets.find(b => b.category === budget.category)) {
      setBudgets(prev => [...prev, budget]);
    }
  };

  const deleteBudget = (category: string) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
  };

  return (
    <FinanceContext.Provider value={{ transactions, goals, obligations, budgets, addTransaction, deleteTransaction, addGoal, updateGoal, deleteGoal, updateBudget, addBudget, deleteBudget }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
