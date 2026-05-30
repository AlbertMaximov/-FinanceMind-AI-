export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  payment_method?: string;
  recurring?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  monthly_contribution: number;
  priority: 'low' | 'medium' | 'high';
}

export interface Obligation {
  id: string;
  name: string;
  total_amount: number;
  monthly_payment: number;
  interest_rate: number;
  due_date: string;
}

export interface Budget {
  category: string;
  planned: number;
  actual: number;
}
