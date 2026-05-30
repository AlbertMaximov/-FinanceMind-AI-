import { useState } from 'react';
import { FinanceProvider } from './store/FinanceContext';
import { Layout } from './components/Layout';
import { DashboardTab } from './tabs/DashboardTab';
import { TransactionsTab } from './tabs/TransactionsTab';
import { BudgetTab } from './tabs/BudgetTab';
import { GoalsTab } from './tabs/GoalsTab';
import { RisksTab } from './tabs/RisksTab';
import { ChatTab } from './tabs/ChatTab';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardTab onNavigate={setActiveTab} />}
      {activeTab === 'transactions' && <TransactionsTab />}
      {activeTab === 'budget' && <BudgetTab />}
      {activeTab === 'goals' && <GoalsTab />}
      {activeTab === 'risks' && <RisksTab />}
      {activeTab === 'chat' && <ChatTab />}
    </Layout>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
