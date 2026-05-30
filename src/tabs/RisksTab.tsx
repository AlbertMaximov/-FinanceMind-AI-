import { useFinance } from '../store/FinanceContext';
import { AlertTriangle, ShieldAlert, TrendingDown, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const RisksTab = () => {
  const { transactions, budgets, goals } = useFinance();

  // Mock forecast data
  const data = [
    { name: 'Окт', balance: 45000 },
    { name: 'Ноя', balance: 52000 },
    { name: 'Дек', balance: 38000 },
    { name: 'Янв', balance: 60000 },
    { name: 'Фев', balance: 48000 },
    { name: 'Мар', balance: 30000 },
    { name: 'Апр', balance: 15000 }, // Risk point
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Риски и Прогноз</h2>
        <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors">
          Сценарий "Что если"
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Прогноз баланса (6 месяцев)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Баланс']}
                />
                <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-2xl border border-red-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">Критические риски</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/80 p-4 rounded-xl border border-red-100 flex items-start space-x-3">
                <TrendingDown className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-900 text-sm">Кассовый разрыв в Апреле</div>
                  <div className="text-red-700 text-sm mt-1">Прогнозируемый баланс снизится до 15 000 ₽, что ниже ваших обязательных платежей.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900">Предупреждения</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/80 p-4 rounded-xl border border-amber-100 flex items-start space-x-3">
                <Activity className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-900 text-sm">Низкая финансовая подушка</div>
                  <div className="text-amber-700 text-sm mt-1">Текущий резерв покрывает только 0.8 месяца расходов. Рекомендуется увеличить до 3-6 месяцев.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
