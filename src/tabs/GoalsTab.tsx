import { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { Target, Plus, TrendingUp, Calendar, Trash2, Pencil, X } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const GoalsTab = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalData, setEditGoalData] = useState<any>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    monthly_contribution: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleEditStart = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditGoalData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline.split('T')[0],
      monthly_contribution: goal.monthly_contribution.toString(),
      priority: goal.priority
    });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoalId || !editGoalData.name || !editGoalData.target_amount) return;
    
    updateGoal(editingGoalId, {
      name: editGoalData.name,
      target_amount: Number(editGoalData.target_amount),
      current_amount: Number(editGoalData.current_amount),
      deadline: new Date(editGoalData.deadline).toISOString(),
      monthly_contribution: Number(editGoalData.monthly_contribution) || 0,
      priority: editGoalData.priority
    });
    
    setEditingGoalId(null);
    setEditGoalData(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target_amount) return;
    
    addGoal({
      name: newGoal.name,
      target_amount: Number(newGoal.target_amount),
      current_amount: Number(newGoal.current_amount),
      deadline: new Date(newGoal.deadline).toISOString(),
      monthly_contribution: Number(newGoal.monthly_contribution) || 0,
      priority: newGoal.priority
    });
    
    setIsAdding(false);
    setNewGoal({
      name: '', target_amount: '', current_amount: '0', 
      deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], 
      monthly_contribution: '', priority: 'medium'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Финансовые цели</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Создать цель</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
              <input type="text" required value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Например: Отпуск" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Сумма цели (₽)</label>
              <input type="number" required value={newGoal.target_amount} onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="100000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Уже накоплено (₽)</label>
              <input type="number" value={newGoal.current_amount} onChange={e => setNewGoal({...newGoal, current_amount: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Срок</label>
              <input type="date" required value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ежемесячный вклад (₽)</label>
              <input type="number" value={newGoal.monthly_contribution} onChange={e => setNewGoal({...newGoal, monthly_contribution: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Опционально" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-colors w-full">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
          const remaining = goal.target_amount - goal.current_amount;
          const monthsLeft = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
          const requiredMonthly = Math.ceil(remaining / monthsLeft);

          if (editingGoalId === goal.id) {
            return (
              <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Редактировать цель</h3>
                  <button onClick={() => setEditingGoalId(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
                    <input type="text" required value={editGoalData.name} onChange={e => setEditGoalData({...editGoalData, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Сумма цели (₽)</label>
                    <input type="number" required value={editGoalData.target_amount} onChange={e => setEditGoalData({...editGoalData, target_amount: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Уже накоплено (₽)</label>
                    <input type="number" value={editGoalData.current_amount} onChange={e => setEditGoalData({...editGoalData, current_amount: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Срок</label>
                    <input type="date" required value={editGoalData.deadline} onChange={e => setEditGoalData({...editGoalData, deadline: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ежемесячный вклад (₽)</label>
                    <input type="number" value={editGoalData.monthly_contribution} onChange={e => setEditGoalData({...editGoalData, monthly_contribution: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors w-full">
                    Сохранить изменения
                  </button>
                </form>
              </div>
            );
          }

          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col group">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="flex items-start space-x-3 flex-1 min-w-[200px]">
                  <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-slate-800 truncate">{goal.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-slate-500 mt-1">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="truncate">до {format(new Date(goal.deadline), 'd MMMM yyyy', { locale: ru })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-4 shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{goal.current_amount.toLocaleString('ru-RU')} ₽</div>
                    <div className="text-sm text-slate-400">из {goal.target_amount.toLocaleString('ru-RU')} ₽</div>
                  </div>
                  <div className="flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditStart(goal)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600">Прогресс</span>
                  <span className="text-emerald-600">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-indigo-900">AI План: </span>
                    Чтобы накопить вовремя, нужно откладывать <span className="font-bold">{requiredMonthly.toLocaleString('ru-RU')} ₽</span> в месяц.
                    {goal.monthly_contribution > 0 && goal.monthly_contribution < requiredMonthly && (
                      <span className="text-red-600 block mt-1">Текущий вклад ({goal.monthly_contribution.toLocaleString('ru-RU')} ₽) недостаточен.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
