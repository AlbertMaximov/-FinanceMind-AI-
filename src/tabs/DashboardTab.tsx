import { useFinance } from '../store/FinanceContext';
import { ArrowUpRight, ArrowDownRight, Target, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const DashboardTab = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const { transactions, goals } = useFinance();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthTransactions = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = monthTransactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
  const expense = monthTransactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);
  const balance = income - expense;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Обзор</h2>
        <div className="flex space-x-3">
          <button 
            onClick={() => onNavigate('transactions')}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить операцию</span>
          </button>
          <button 
            onClick={() => onNavigate('chat')}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors"
          >
            <span>Спросить AI</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium mb-1">Баланс за месяц</div>
          <div className="text-3xl font-bold text-slate-800">{balance.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <div className="text-slate-500 text-sm font-medium">Доходы</div>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{income.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <div className="text-slate-500 text-sm font-medium">Расходы</div>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{expense.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      {/* AI Insights & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-900">AI Аналитика</h3>
          </div>
          <div className="space-y-3">
            {(() => {
              // Dynamic insight 1: Highest expense category this month
              const expensesByCategory = monthTransactions
                .filter(tx => tx.type === 'expense')
                .reduce((acc, tx) => {
                  acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                  return acc;
                }, {} as Record<string, number>);
              
              const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];
              const topCategoryText = topCategory 
                ? `Основная статья расходов в этом месяце — "${topCategory[0]}" (${topCategory[1].toLocaleString('ru-RU')} ₽).`
                : 'В этом месяце пока нет расходов.';

              // Dynamic insight 2: Goal prediction
              const activeGoal = goals.find(g => g.current_amount < g.target_amount);
              let goalText = 'У вас нет активных целей. Создайте цель, чтобы начать копить!';
              
              if (activeGoal) {
                if (activeGoal.monthly_contribution > 0) {
                  const monthsLeft = Math.ceil((activeGoal.target_amount - activeGoal.current_amount) / activeGoal.monthly_contribution);
                  goalText = `Если сохранить текущий темп накоплений (${activeGoal.monthly_contribution.toLocaleString('ru-RU')} ₽/мес), цель "${activeGoal.name}" будет достигнута через ${monthsLeft} мес.`;
                } else {
                  goalText = `Для цели "${activeGoal.name}" не задан ежемесячный вклад. Настройте его, чтобы рассчитать срок достижения.`;
                }
              }

              return (
                <>
                  <div className="bg-white/60 p-4 rounded-xl text-indigo-800 text-sm">
                    <span className="font-semibold">Анализ трат:</span> {topCategoryText}
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl text-indigo-800 text-sm">
                    <span className="font-semibold">Прогноз целей:</span> {goalText}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Цели</h3>
            </div>
            <button onClick={() => onNavigate('goals')} className="text-sm text-emerald-600 hover:underline">Все цели</button>
          </div>
          <div className="space-y-4">
            {goals.map(goal => {
              const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{goal.name}</span>
                    <span className="text-slate-500">{goal.current_amount.toLocaleString('ru-RU')} / {goal.target_amount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Последние операции</h3>
          <button onClick={() => onNavigate('transactions')} className="text-sm text-emerald-600 hover:underline">Смотреть все</button>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-medium text-slate-800">{tx.category}</div>
                  <div className="text-sm text-slate-500">{tx.description} • {format(new Date(tx.date), 'd MMM yyyy', { locale: ru })}</div>
                </div>
              </div>
              <div className={`font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
