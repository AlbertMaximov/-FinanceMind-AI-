import { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { AlertTriangle, TrendingUp, CheckCircle2, Plus, Trash2, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

export const BudgetTab = () => {
  const { budgets, updateBudget, addBudget, deleteBudget, transactions, goals } = useFinance();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', planned: '' });
  const [editValue, setEditValue] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  const handleEdit = (category: string, currentPlanned: number) => {
    setEditingCategory(category);
    setEditValue(currentPlanned.toString());
  };

  const handleSave = (category: string) => {
    updateBudget(category, Number(editValue));
    setEditingCategory(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name && newCategory.planned) {
      addBudget({ category: newCategory.name, planned: Number(newCategory.planned), actual: 0 });
      setIsAddingCategory(false);
      setNewCategory({ name: '', planned: '' });
    }
  };

  const handleAutoDistribute = async () => {
    setIsAILoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        alert('API ключ не найден. Пожалуйста, настройте GEMINI_API_KEY.');
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      // Calculate monthly income and required savings
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 100000;
      const requiredSavings = goals.reduce((sum, g) => sum + (g.monthly_contribution || 0), 0);
      const availableForBudget = Math.max(0, totalIncome - requiredSavings);

      const categoriesList = budgets.map(b => b.category).join(', ');

      const prompt = `
        Вы - финансовый советник. Распределите доступный бюджет по заданным категориям.
        Общий доход: ${totalIncome} ₽
        Обязательные накопления на цели: ${requiredSavings} ₽
        Доступно для распределения на расходы: ${availableForBudget} ₽
        Категории для распределения: ${categoriesList}

        Учитывайте базовые финансовые правила (например, больше на жилье и еду, меньше на развлечения).
        Верните массив объектов с названием категории и рекомендованной суммой.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: "Название категории из предложенного списка" },
                amount: { type: Type.NUMBER, description: "Рекомендованная сумма в рублях" }
              },
              required: ["category", "amount"]
            }
          }
        }
      });

      const result = JSON.parse(response.text || '[]');
      
      if (Array.isArray(result)) {
        result.forEach((item: any) => {
          if (item.category && typeof item.amount === 'number') {
            if (budgets.some(b => b.category === item.category)) {
              updateBudget(item.category, item.amount);
            }
          }
        });
      }
    } catch (error) {
      console.error('AI Error:', error);
      alert('Произошла ошибка при расчете бюджета.');
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Бюджет</h2>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsAddingCategory(!isAddingCategory)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить категорию</span>
          </button>
          <button 
            onClick={handleAutoDistribute}
            disabled={isAILoading}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAILoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Авто-распределение AI</span>
          </button>
        </div>
      </div>

      {isAddingCategory && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Название категории</label>
              <input type="text" required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Например: Здоровье" />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Планируемый бюджет (₽)</label>
              <input type="number" required value={newCategory.planned} onChange={e => setNewCategory({...newCategory, planned: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="5000" />
            </div>
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-xl transition-colors w-full md:w-auto">
              Добавить
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {budgets.map(budget => {
            const percentage = budget.planned > 0 ? (budget.actual / budget.planned) * 100 : 0;
            const isOver = percentage > 100;
            const isWarning = percentage > 80 && !isOver;

            return (
              <div key={budget.category} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div className="flex-1 min-w-[150px]">
                    <h3 className="text-lg font-semibold text-slate-800 truncate">{budget.category}</h3>
                    <div className="text-sm text-slate-500 mt-1">
                      Остаток: <span className={`font-medium ${isOver ? 'text-red-500' : 'text-emerald-600'}`}>
                        {(budget.planned - budget.actual).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      {editingCategory === budget.category ? (
                        <div className="flex items-center space-x-2">
                          <input 
                            type="number" 
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-24 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button 
                            onClick={() => handleSave(budget.category)}
                            className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer group flex items-center space-x-2"
                          onClick={() => handleEdit(budget.category, budget.planned)}
                        >
                          <span className="text-lg font-bold text-slate-800">{budget.actual.toLocaleString('ru-RU')}</span>
                          <span className="text-slate-400">/ {budget.planned.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteBudget(budget.category)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                
                {isOver && (
                  <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Перерасход на {(budget.actual - budget.planned).toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-amber-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900">AI Прогноз</h3>
            </div>
            <div className="space-y-3">
              {(() => {
                const highestSpentBudget = [...budgets]
                  .filter(b => b.planned > 0)
                  .sort((a, b) => (b.actual / b.planned) - (a.actual / a.planned))[0];

                let warning = 'Пока нет данных для анализа.';
                let recommendation = 'Добавьте больше операций, чтобы AI смог дать точный прогноз.';

                if (highestSpentBudget) {
                  const percentage = (highestSpentBudget.actual / highestSpentBudget.planned) * 100;
                  if (percentage > 100) {
                    warning = `Критический перерасход по категории "${highestSpentBudget.category}" на ${(highestSpentBudget.actual - highestSpentBudget.planned).toLocaleString('ru-RU')} ₽.`;
                    recommendation = `Рекомендуется пересмотреть бюджет или временно сократить расходы в категории "${highestSpentBudget.category}".`;
                  } else if (percentage > 80) {
                    warning = `Вероятность перерасхода по категории "${highestSpentBudget.category}" — высокая (использовано ${percentage.toFixed(0)}%).`;
                    recommendation = `Постарайтесь ограничить траты в категории "${highestSpentBudget.category}", чтобы уложиться в бюджет.`;
                  } else if (percentage > 50) {
                    warning = `Расходы по категории "${highestSpentBudget.category}" идут в нормальном темпе.`;
                    recommendation = `Продолжайте придерживаться плана. У вас осталось ${(highestSpentBudget.planned - highestSpentBudget.actual).toLocaleString('ru-RU')} ₽.`;
                  } else {
                    warning = `Ваши расходы значительно ниже запланированных.`;
                    recommendation = `Отличная работа! Свободные средства можно направить на достижение финансовых целей.`;
                  }
                }

                return (
                  <>
                    <div className="bg-white/60 p-4 rounded-xl text-amber-900 text-sm">
                      <span className="font-semibold">Внимание:</span> {warning}
                    </div>
                    <div className="bg-white/60 p-4 rounded-xl text-amber-900 text-sm">
                      <span className="font-semibold">Рекомендация:</span> {recommendation}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
