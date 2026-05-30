import { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, Trash2, Search, Filter, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const TransactionsTab = () => {
  const { transactions, addTransaction, deleteTransaction, budgets, addBudget } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newTx, setNewTx] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = Array.from(new Set([
    ...budgets.map(b => b.category),
    ...transactions.map(t => t.category)
  ])).filter(Boolean);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.category) return;
    
    // Auto-add to budgets if it's a new expense category
    if (newTx.type === 'expense' && !budgets.find(b => b.category === newTx.category)) {
      addBudget({ category: newTx.category, planned: 0, actual: 0 });
    }

    addTransaction({
      amount: Number(newTx.amount),
      type: newTx.type,
      category: newTx.category,
      description: newTx.description,
      date: new Date(newTx.date).toISOString()
    });
    
    setIsAdding(false);
    setIsAddingNewCategory(false);
    setNewTx({ amount: '', type: 'expense', category: '', description: '', date: new Date().toISOString().split('T')[0] });
  };

  // Chart Data
  const expensesByCategory = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Доходы и Расходы</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          {isAdding ? 'Отмена' : 'Добавить операцию'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Тип</label>
              <select 
                value={newTx.type} 
                onChange={e => setNewTx({...newTx, type: e.target.value as 'income' | 'expense'})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="expense">Расход</option>
                <option value="income">Доход</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Сумма (₽)</label>
              <input 
                type="number" 
                required
                value={newTx.amount} 
                onChange={e => setNewTx({...newTx, amount: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Категория</label>
              {isAddingNewCategory ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={newTx.category} 
                    onChange={e => setNewTx({...newTx, category: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Новая категория"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsAddingNewCategory(false);
                      setNewTx({...newTx, category: categories[0] || ''});
                    }} 
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <select 
                  required
                  value={newTx.category} 
                  onChange={e => {
                    if (e.target.value === '___NEW___') {
                      setIsAddingNewCategory(true);
                      setNewTx({...newTx, category: ''});
                    } else {
                      setNewTx({...newTx, category: e.target.value});
                    }
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="" disabled>Выберите...</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="___NEW___" className="font-semibold text-emerald-600">+ Добавить новую...</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
              <input 
                type="text" 
                value={newTx.description} 
                onChange={e => setNewTx({...newTx, description: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Комментарий"
              />
            </div>
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-colors w-full">
              Сохранить
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Структура расходов</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Нет данных для графика</div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600">{entry.name}</span>
                </div>
                <span className="font-medium text-slate-800">{entry.value.toLocaleString('ru-RU')} ₽</span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Поиск операций..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[600px]">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{tx.category}</div>
                    <div className="text-sm text-slate-500">{tx.description} • {format(new Date(tx.date), 'd MMM yyyy', { locale: ru })}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('ru-RU')} ₽
                  </div>
                  <button 
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Нет операций. Добавьте первую операцию!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
