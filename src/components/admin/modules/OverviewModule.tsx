/* Recreated OverviewModule.tsx */
"use client";

import React, { useState, useEffect } from 'react';
import { getText, type Language } from '@/i18n/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShoppingBag, DollarSign, Package, Star } from 'lucide-react';
import getThemeClasses from "../../../../config/colors";
import TradingChart from "../TradingChart";

type Stat = {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  color: string;
};
type ActivityItem = {
  action: string;
  timestamp: string | number | Date;
};
type OverviewModuleProps = {
  onSubTabChange?: (tabId: string) => void;
  theme: string;
  language: Language;
};

const tabTranslations: Record<'basic' | 'activity', Record<Language, string>> = {
  basic: { ru: 'Базовый', tk: 'Esasy' },
  activity: { ru: 'Активность', tk: 'Hereketlilik' },
};
const statTranslations: Record<'orders' | 'revenue' | 'dishes' | 'categories', Record<Language, string>> = {
  orders: { ru: 'Заказы', tk: 'Sargytlar' },
  revenue: { ru: 'выручка', tk: 'girdeji' },
  dishes: { ru: 'блюд', tk: 'taamlar' },
  categories: { ru: 'категории', tk: 'kategoriýalar' },
};
const activityTitle: Record<Language, string> = { ru: 'Последняя активность', tk: 'Soňky hereketsizlik' };

const OverviewModule: React.FC<OverviewModuleProps> = ({ onSubTabChange, theme, language }) => {
  const themeClasses = getThemeClasses(theme);
  const [currentSubTab, setCurrentSubTab] = useState<'basic' | 'activity'>('basic');
  const [basicStats, setBasicStats] = useState<Stat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [salesData, setSalesData] = useState<{ date: string; open: number; high: number; low: number; close: number; volume?: number }[]>([]);

  useEffect(() => {
    // Получаем реальные данные с бэка для каждого счетчика
    let rateLimited = false;
    let rateLimitTimeout: NodeJS.Timeout | null = null;
    async function fetchStats() {
      if (rateLimited) return;
      try {
        // 1. Счетчик заказов и прибыль
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.status === 429) {
          rateLimited = true;
          alert('Слишком много запросов. Попробуйте позже.');
          rateLimitTimeout = setTimeout(() => { rateLimited = false; }, 60000);
          return;
        }
        const orders = await ordersRes.json();
        const totalOrders = Array.isArray(orders) ? orders.length : 0;
        const totalRevenue = Array.isArray(orders) ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) : 0;

        // 2. Количество категорий
        const categoriesRes = await fetch('/api/category');
        if (categoriesRes.status === 429) {
          rateLimited = true;
          alert('Слишком много запросов. Попробуйте позже.');
          rateLimitTimeout = setTimeout(() => { rateLimited = false; }, 60000);
          return;
        }
        const categories = await categoriesRes.json();
        const totalCategories = Array.isArray(categories) ? categories.length : 0;

        // 3. Количество товаров
        const mealsRes = await fetch('/api/meal');
        if (mealsRes.status === 429) {
          rateLimited = true;
          alert('Слишком много запросов. Попробуйте позже.');
          rateLimitTimeout = setTimeout(() => { rateLimited = false; }, 60000);
          return;
        }
        const meals = await mealsRes.json();
        const totalMeals = Array.isArray(meals) ? meals.length : 0;

        // 4. График продаж (свечной анализ)
        const salesRes = await fetch('/api/analytics?type=sales&days=7');
        if (salesRes.status === 429) {
          rateLimited = true;
          alert('Слишком много запросов. Попробуйте позже.');
          rateLimitTimeout = setTimeout(() => { rateLimited = false; }, 60000);
          return;
        }
        const salesData = await salesRes.json();
        // Преобразуем данные в формат свечей
        setSalesData(Array.isArray(salesData) ? salesData.map((d: any, index: number) => ({
          date: d.date,
          open: Math.max(10, Math.round(d.sales * (0.8 + Math.random() * 0.4))), // Имитация цены открытия
          high: Math.round(d.sales * (1.1 + Math.random() * 0.2)), // Максимум
          low: Math.max(5, Math.round(d.sales * (0.7 + Math.random() * 0.2))), // Минимум
          close: Math.round(d.sales), // Цена закрытия = фактические продажи
          volume: Math.round(d.sales * (0.5 + Math.random() * 1.5)) // Объем торгов
        })) : []);

        // Формируем массив для карточек
        const stats: Stat[] = [
          { title: statTranslations.orders[language], value: totalOrders.toString(), change: '', changeType: 'positive', icon: <ShoppingBag className="w-5 h-5" />, color: 'from-blue-400 to-blue-600' },
          { title: statTranslations.revenue[language], value: `${totalRevenue} ТМ`, change: '', changeType: 'positive', icon: <DollarSign className="w-5 h-5" />, color: 'from-green-400 to-green-600' },
          { title: statTranslations.dishes[language], value: totalMeals.toString(), change: '', changeType: 'positive', icon: <Package className="w-5 h-5" />, color: 'from-purple-400 to-purple-600' },
          { title: statTranslations.categories[language], value: totalCategories.toString(), change: '', changeType: 'positive', icon: <Star className="w-5 h-5" />, color: 'from-green-400 to-green-600' }
        ];
        setBasicStats(stats);
      } catch (err) {
        console.error('Ошибка загрузки статистики', err);
      }
    }
    fetchStats();
  }, [language]);

  // Real-time updates: poll sales analytics and recent activity every 10s
  useEffect(() => {
    let mounted = true;

    const fetchSales = async () => {
      try {
  const res = await fetch('/api/analytics?type=sales&days=7');
        if (!res.ok) return;
        const data = await res.json();
        // data: [{ date, sales, orders, customers }]
        if (!mounted) return;
        const chartData = Array.isArray(data) ? data.map((d: any) => ({ date: d.date, value: Math.round(d.sales) })) : [];
        setSalesData(chartData);
      } catch (err) {
        console.error('Ошибка загрузки sales analytics', err);
      }
    };

    const fetchRecent = async () => {
      try {
        // используем /api/orders, который возвращает форматированные данные с createdAt
        const res = await fetch('/api/orders');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        // Ожидаем массив заказов, создаём activity items (последние 10)
        const activities = (Array.isArray(data) ? data : [])
          .slice(0, 10)
          .map((o: any) => ({
            action: `${o.customerPhone || o.customerName || 'Клиент'} — ${o.items?.length ?? 0} позиций — ${o.totalAmount ?? 0} TMT`,
            timestamp: o.createdAt || new Date().toISOString()
          }));
        setRecentActivity(activities);
      } catch (err) {
        console.error('Ошибка загрузки recent orders', err);
      }
    };
    // Initial fetch
    fetchSales();
    fetchRecent();
    const interval = setInterval(() => {
      fetchSales();
      fetchRecent();
    }, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
          {[
            { id: 'basic', label: 'Базовый', icon: <Activity className="w-5 h-5" /> },
            { id: 'activity', label: 'Активность', icon: <Activity className="w-5 h-5 text-green-500" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setCurrentSubTab(tab.id as 'basic' | 'activity'); onSubTabChange?.(tab.id); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${currentSubTab === tab.id ? 'bg-linear-to-r from-blue-500 to-green-400 text-white shadow-xl' : 'bg-white text-gray-800 hover:bg-gray-50 shadow-md'}`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentSubTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
          {currentSubTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {basicStats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 rounded-xl relative overflow-hidden transition-all duration-300 hover:scale-105 bg-white shadow-lg`}
                  >
                    <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-10`} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-linear-to-br ${stat.color} text-white shadow-lg`}>{stat.icon}</div>
                        <div className={`text-sm font-medium px-3 py-1 rounded-full shadow-md ${stat.changeType === 'positive' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{stat.change}</div>
                      </div>
                      <h3 className={`text-2xl font-bold mb-1 text-gray-900`}>
                        {typeof stat.value === 'string' && stat.value.endsWith('ТТ')
                          ? stat.value.replace(/ТТ$/, 'ТМ')
                          : stat.value}
                      </h3>
                      <p className={`text-sm text-gray-500`}>{stat.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className={`p-6 rounded-xl bg-white shadow-lg`}>
                <TradingChart data={salesData} theme={theme} />
              </div>
            </div>
          )}
          {currentSubTab === 'activity' && (
            <div className={`p-6 rounded-xl bg-white shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900`}>
                <Activity className="w-5 h-5 text-green-500" /> {activityTitle[language]}
              </h3>
              <div className="space-y-3">
                {recentActivity.length ? recentActivity.map((a, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors`}>
                    <span className="text-gray-800">{a.action}</span>
                    <span className="text-sm text-gray-500">{formatTimeAgo(a.timestamp)}</span>
                  </div>
                )) : (
                  <p className="text-gray-500">Нет активности</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Helper function to format time ago
function formatTimeAgo(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + " лет назад";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " месяцев назад";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " дней назад";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " часов назад";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " минут назад";
  return "секунду назад";
}

export default OverviewModule;
