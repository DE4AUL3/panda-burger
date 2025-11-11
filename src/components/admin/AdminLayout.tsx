'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from './AdminSidebar'
import OrdersModule from './modules/OrdersModule'
import AdminOrderNotifier from './AdminOrderNotifier'
import { COLORS } from '@/config/colors'
import {
  BarChart3,
  TrendingUp,
  Store,
  Phone,
  ShoppingBag,
  Eye,
  Users,
  FileText,
  MessageSquare
} from 'lucide-react'
import { AdminTheme } from './AdminHeader'
import AdminThemeEffects from './AdminThemeEffects'

import type { Language } from '@/i18n/translations';
import { useLanguage } from '@/hooks/useLanguage';
interface AdminLayoutProps {
  children: React.ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
}

// Навигационная панель встроена прямо в компонент
function getNavigationTabs(language: Language) {
  return [
    {
      id: 'overview',
      label: language === 'ru' ? 'Обзор' : 'Syn',
      icon: <Eye className="w-4 h-4" />,
      description: language === 'ru' ? 'Общая статистика и аналитика' : 'Umumy statistika we analitika',
      submenu: [
        { id: 'basic', label: language === 'ru' ? 'Базовый' : 'Esasy', icon: <BarChart3 className="w-3 h-3" /> },
        { id: 'analytics', label: language === 'ru' ? 'Аналитика' : 'Analitika', icon: <TrendingUp className="w-3 h-3" /> }
      ]
    },
    {
      id: 'restaurant',
      label: language === 'ru' ? 'Ресторан' : 'Restoran',
      icon: <Store className="w-4 h-4" />,
      description: language === 'ru' ? 'Управление меню и категориями' : 'Menýu we kategoriýalary dolandyrmak',
      submenu: [
        { id: 'general', label: language === 'ru' ? 'Общее' : 'Umumy', icon: <Store className="w-3 h-3" /> },
        { id: 'categories', label: language === 'ru' ? 'Категории' : 'Kategoriýalar', icon: <TrendingUp className="w-3 h-3" /> },
        { id: 'dishes', label: language === 'ru' ? 'Блюда' : 'Taomlar', icon: <ShoppingBag className="w-3 h-3" /> },
        { id: 'cart', label: language === 'ru' ? 'Корзина' : 'Sebet', icon: <ShoppingBag className="w-3 h-3" /> }
      ]
    },
    {
      id: 'orders',
      label: language === 'ru' ? 'Заказы' : 'Sargytlar',
      icon: <FileText className="w-4 h-4" />,
      description: language === 'ru' ? 'Управление заказами и уведомления' : 'Sargytlary we bildirişleri dolandyrmak',
      submenu: [
        { id: 'active', label: language === 'ru' ? 'Активные' : 'Işjeň', icon: <Users className="w-3 h-3" /> },
        { id: 'history', label: language === 'ru' ? 'История' : 'Taryh', icon: <FileText className="w-3 h-3" /> },
        { id: 'notifications', label: language === 'ru' ? 'Уведомления' : 'Bildirişler', icon: <MessageSquare className="w-3 h-3" /> }
      ]
    },
    {
      id: 'contacts',
      label: language === 'ru' ? 'Контакты' : 'Habarlaşmak',
      icon: <Phone className="w-4 h-4" />,
      description: language === 'ru' ? 'База контактов и SMS рассылка' : 'Kontakt bazasy we SMS ibermek',
      submenu: [
        { id: 'database', label: language === 'ru' ? 'База номеров' : 'Nomurlar bazasy', icon: <Users className="w-3 h-3" /> },
        { id: 'sms-export', label: language === 'ru' ? 'SMS экспорт' : 'SMS eksport', icon: <MessageSquare className="w-3 h-3" /> }
      ]
    }
  ];
}

const themeStyles = {
  light: {
    bg: 'bg-white/90 backdrop-blur-sm',
    border: 'border-gray-200',
    text: 'text-gray-700',
    textActive: 'text-blue-600',
    textHover: 'text-gray-900',
    bgActive: 'bg-blue-50',
    bgHover: 'hover:bg-gray-50',
    borderActive: 'border-blue-200',
    accent: 'from-blue-500 to-purple-600'
  }
}

export default function AdminLayout({ children, activeTab: externalActiveTab, onTabChange }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState(externalActiveTab || 'overview')

  // Синхронизируем с внешним activeTab
  useEffect(() => {
    if (externalActiveTab && externalActiveTab !== activeTab) {
      setActiveTab(externalActiveTab)
    }
  }, [externalActiveTab, activeTab])

  // Применяем светлую тему к body элементу
  useEffect(() => {
    const body = document.body
    body.classList.remove('admin-light', 'admin-dark')
    body.classList.add('admin-light')
    const root = document.documentElement
    root.style.setProperty('--admin-bg-primary', '#fcf9f9')
    root.style.setProperty('--admin-bg-secondary', '#f3f4f6')
    root.style.setProperty('--admin-text-primary', '#18181b')
    root.style.setProperty('--admin-text-secondary', '#27272a')
    root.style.setProperty('--admin-border', '#e5e7eb')
    root.style.setProperty('--admin-accent', '#2563eb')
  }, [])

  const getThemeClasses = () => {
    return 'bg-white text-gray-900'
  }

  const handleTabChange = (tab: string) => {
    console.log('AdminLayout: Переключение на вкладку:', tab)
    console.log('AdminLayout: Текущая активная вкладка:', activeTab)
    console.log('AdminLayout: onTabChange функция:', onTabChange)
    setActiveTab(tab)
    
    // Уведомляем родительский компонент об изменении
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  const handleTabClick = (tabId: string) => {
    console.log('AdminLayout: Клик по вкладке:', tabId)
    handleTabChange(tabId)
  }

  // Динамическое количество заказов
  const [ordersCount, setOrdersCount] = useState(0);

  // Загрузка активных заказов
  useEffect(() => {
    const fetchActiveOrdersCount = async () => {
      try {
        const response = await fetch('/api/orders?status=active');
        if (response.ok) {
          const data = await response.json();
          setOrdersCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error('Ошибка загрузки активных заказов:', error);
        setOrdersCount(0);
      }
    };

    fetchActiveOrdersCount();
    
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchActiveOrdersCount, 30000);
    
    return () => clearInterval(interval);
  }, []);
  // Язык админки (глобальный)
  const { currentLanguage: language, setCurrentLanguage } = useLanguage();
  // Динамические вкладки навигации в зависимости от языка
  const navigationTabs = React.useMemo(() => getNavigationTabs(language), [language]);
  // Пробрасываем setOrdersCount в AdminOrderNotifier и OrdersModule
  const childrenWithOrdersCount = React.Children.map(children, child => {
    if (
      React.isValidElement(child) &&
      (child.type === OrdersModule ||
        (typeof child.type === 'function' && child.type.name === 'OrdersModule'))
    ) {
      return React.cloneElement(child as React.ReactElement<any>, { setOrdersCount });
    }
    if (
      React.isValidElement(child) &&
      (child.type === (AdminOrderNotifier as unknown as React.FunctionComponent<any>) ||
        (typeof child.type === 'function' && child.type.name === 'AdminOrderNotifier'))
    ) {
      return React.cloneElement(child as React.ReactElement<any>, { setOrdersCount });
    }
    return child;
  });
  return (
    <div
      className="min-h-screen flex transition-all duration-300 relative bg-white text-gray-900"
    >
  {/* <AdminThemeEffects theme={currentTheme} /> */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        ordersCount={ordersCount}
        navigationTabs={navigationTabs}
      />
      <main className="flex-1 transition-all duration-300 relative z-10 bg-white text-gray-900">
        {React.Children.map(childrenWithOrdersCount, child => {
          if (!React.isValidElement(child)) return child;
          // Пробрасываем язык только в компоненты-модули/менеджеры по displayName/id
          const typeName = (child.type as any)?.displayName || (child.type as any)?.name || '';
          // Только для известных модулей/менеджеров
          // Пробрасываем props только если они уже есть у child.props
          if ([
            'DishManager',
            'CategoryManager',
            'RestaurantModule',
            'MenuItemManager',
            'OrdersModule',
            'OrderManager',
            'ClientManager',
            'ImageManager',
            'PremiumAdminDashboardV2'
          ].includes(typeName)) {
            const newProps: any = {};
            const childProps = child.props as any;
            if (childProps && 'language' in childProps) newProps.language = language;
            if (childProps && 'setLanguage' in childProps) newProps.setLanguage = setCurrentLanguage;
            if (Object.keys(newProps).length > 0) {
              return React.cloneElement(child, newProps);
            }
          }
          return child;
        })}
      </main>
    </div>
  )
}