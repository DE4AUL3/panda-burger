'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  X,
  DollarSign
} from 'lucide-react'
import { Dish, Category } from '@/types/common'
import { dataService } from '@/lib/dataService'
import { useLanguage } from '@/hooks/useLanguage'

// Локальные переводы для DishManager
const dishManagerTexts = {
  ru: {
    title: 'Управление блюдами',
    total: 'Всего блюд',
    active: 'Активных',
    add: 'Добавить блюдо',
    search: 'Поиск блюд...',
    allCategories: 'Все категории',
    showInactive: 'Показать неактивные',
    notFound: 'Блюда не найдены',
    tryChangeFilters: 'Попробуйте изменить фильтры поиска',
    startAdd: 'Начните с добавления первого блюда',
  edit: 'Изменить',
  show: 'Показать',
  hide: 'Скрыть',
    unavailable: 'Недоступно',
    inactive: 'Неактивно',
    price: 'Цена (ТМТ) *',
    category: 'Категория *',
    nameRu: 'Название (Русский) *',
    nameTk: 'Название (Туркменский) *',
    descRu: 'Описание (Русский)',
    descTk: 'Описание (Туркменский)',
    image: 'Изображение блюда',
    save: 'Сохранить изменения',
    create: 'Создать блюдо',
    cancel: 'Отмена',
    activeStatus: 'Активно',
    availableStatus: 'Доступно',
    editDish: 'Редактировать блюдо',
    addDish: 'Добавить новое блюдо',
    delete: 'Удалить',
    loading: 'Загрузка блюд...'
  },
  tk: {
    title: 'Tagamlary dolandyrmak',
    total: 'Jemi tagam',
    active: 'Işjeň',
    add: 'Tagam goşmak',
    search: 'Tagam gözleg...',
    allCategories: 'Ähli kategoriýalar',
    showInactive: 'Işjeň däl görkez',
    notFound: 'Tagam tapylmady',
    tryChangeFilters: 'Gözleg süzgüçlerini üýtgedip görüň',
    startAdd: 'Ilki tagam goşuň',
  edit: 'Üýtget',
  show: 'Görkez',
  hide: 'Gizle',
    unavailable: 'Elýeterli däl',
    inactive: 'Işjeň däl',
    price: 'Bahasy (TMT) *',
    category: 'Kategoriýa *',
    nameRu: 'Ady (Rusça) *',
    nameTk: 'Ady (Türkmençe) *',
    descRu: 'Düşündiriş (Rusça)',
    descTk: 'Düşündiriş (Türkmençe)',
    image: 'Tagamyň suraty',
    save: 'Üýtgetmeleri ýatda sakla',
    create: 'Tagam döret',
    cancel: 'Goýbolsun',
    activeStatus: 'Işjeň',
    availableStatus: 'Elýeterli',
    editDish: 'Tagamy üýtget',
    addDish: 'Täze tagam goş',
    delete: 'Poz',
    loading: 'Tagamlar ýüklenýär...'
  }
};
import ImageUpload from '@/components/ui/ImageUpload'
import SmartImage from '@/components/ui/SmartImage'

interface DishManagerProps {
  theme?: 'light' | 'dark';
}

export default function DishManager({ theme = 'light' }: DishManagerProps) {
  const { currentLanguage: lang } = useLanguage();
  const themeStyles = {
    light: {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      textMuted: 'text-gray-600',
      cardBg: 'bg-gray-50',
      inputBg: 'bg-white',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      secondaryBg: 'bg-gray-100 hover:bg-gray-200'
    },
    dark: {
      bg: '',
      border: 'border-gray-700',
      text: 'text-gray-100',
      textMuted: 'text-gray-400',
      cardBg: 'bg-gray-800',
      inputBg: 'bg-gray-800',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      secondaryBg: 'bg-gray-700 hover:bg-gray-600'
    }
  };
  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const styles = themeStyles[themeKey];
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Для скрытия бокового меню при открытии модалки
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
      // Принудительно скрыть sidebar (admin-sidebar/AdminSidebar)
      const sidebar = document.querySelector('.admin-sidebar') || document.querySelector('.AdminSidebar');
      if (sidebar) {
        (sidebar as HTMLElement).style.display = 'none';
      }
    } else {
      document.body.classList.remove('modal-open');
      // Вернуть sidebar
      const sidebar = document.querySelector('.admin-sidebar') || document.querySelector('.AdminSidebar');
      if (sidebar) {
        (sidebar as HTMLElement).style.display = '';
      }
    }
    return () => {
      document.body.classList.remove('modal-open');
      const sidebar = document.querySelector('.admin-sidebar') || document.querySelector('.AdminSidebar');
      if (sidebar) {
        (sidebar as HTMLElement).style.display = '';
      }
    };
  }, [isModalOpen]);
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)

  // Форма для добавления/редактирования блюда
  const [formData, setFormData] = useState<Partial<Dish & { dishPageImage?: string; sortOrder?: number }>>({
    name: { ru: '', tk: '' },
    description: { ru: '', tk: '' },
    price: 0,
    categoryId: '',
    image: '',
    dishPageImage: '',
    sortOrder: 1,
    isActive: true,
    isAvailable: true
  })



  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Загружаем категории из базы данных через API
      const categoriesResponse = await fetch('/api/db-categories')
      const categoriesData = await categoriesResponse.json()
      
      // Загружаем блюда из базы данных через API
      const dishesResponse = await fetch('/api/meal')
      const dishesData = await dishesResponse.json()
      
      // Преобразуем данные из API в формат компонента
      const formattedDishes = dishesData.map((dish: any) => ({
        id: dish.id,
        name: {
          ru: dish.nameRu,
          tk: dish.nameTk
        },
        description: {
          ru: dish.descriptionRu || '',
          tk: dish.descriptionTk || ''
        },
        price: dish.price,
        image: dish.image,
        categoryId: dish.categoryId,
        isActive: true,
        isAvailable: true
      }))
      
      console.log('Загружены категории:', categoriesData)
      console.log('Загружены блюда:', formattedDishes)
      
      setDishes(formattedDishes)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = 
      dish.name.ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.name.tk.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || dish.categoryId === selectedCategory
    const matchesActive = showInactive || dish.isActive

    return matchesSearch && matchesCategory && matchesActive
  })

  const openModal = (dish?: Dish & { dishPageImage?: string; sortOrder?: number }) => {
    if (dish) {
      setEditingDish(dish)
      setFormData({
        ...dish,
        dishPageImage: (dish as any).dishPageImage || '',
        sortOrder: (dish as any).sortOrder || 1
      })
    } else {
      setEditingDish(null)
      setFormData({
        name: { ru: '', tk: '' },
        description: { ru: '', tk: '' },
        price: 0,
        categoryId: categories[0]?.id || '',
        image: '',
        dishPageImage: '',
        sortOrder: 1,
        isActive: true,
        isAvailable: true
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDish(null)
    setFormData({
      name: { ru: '', tk: '' },
      description: { ru: '', tk: '' },
      price: 0,
      categoryId: '',
      image: '',
      isActive: true,
      isAvailable: true
    })
  }

  const handleSave = async () => {
    try {
      if (!formData.name?.ru || !formData.name?.tk || !formData.categoryId) {
        toast.error('Пожалуйста, заполните все обязательные поля', {
          duration: 4000,
          position: 'top-right',
        })
        return
      }
      // Проверка уникальности sortOrder
      const currentSortOrder = formData.sortOrder || 1;
      const duplicate = dishes.some(d => d.sortOrder === currentSortOrder && (!editingDish || d.id !== editingDish.id));
      if (duplicate) {
        toast.error('Порядок сортировки должен быть уникальным!', {
          duration: 4000,
          position: 'top-right',
        });
        return;
      }
      // Подготавливаем данные для API
      const dishData = {
        nameRu: formData.name.ru,
        nameTk: formData.name.tk,
        descriptionRu: formData.description?.ru || '',
        descriptionTk: formData.description?.tk || '',
        price: formData.price || 0,
        categoryId: formData.categoryId,
        image: formData.image || '',
        dishPageImage: formData.dishPageImage || '',
        sortOrder: currentSortOrder,
        isActive: formData.isActive,
        isAvailable: formData.isAvailable
      }

      if (editingDish) {
        // Редактирование через API
        const response = await fetch(`/api/meal/${editingDish.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dishData)
        })
        if (!response.ok) {
          let msg = 'Ошибка при обновлении блюда'
          try {
            const text = await response.text()
            try {
              const j = JSON.parse(text)
              msg = j.error || msg
              console.error('Meal update error (json):', j)
            } catch {
              console.error('Meal update error (text):', text)
              msg = text || msg
            }
          } catch {}
          throw new Error(msg)
        }
        const updatedDish = await response.json()
        setDishes(prev => prev.map(d => d.id === editingDish.id ? {
          ...d,
          name: { ru: updatedDish.nameRu, tk: updatedDish.nameTk },
          description: { ru: updatedDish.descriptionRu || '', tk: updatedDish.descriptionTk || '' },
          price: updatedDish.price,
          image: updatedDish.image,
          categoryId: updatedDish.categoryId,
          dishPageImage: updatedDish.dishPageImage || '',
          sortOrder: updatedDish.sortOrder || 1,
          isActive: updatedDish.isActive,
          isAvailable: updatedDish.isAvailable
        } : d))
      } else {
        // Создание через API
        const response = await fetch('/api/meal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dishData)
        })
        if (!response.ok) {
          let msg = 'Ошибка при создании блюда'
          try {
            const text = await response.text()
            try {
              const j = JSON.parse(text)
              msg = j.error || msg
              console.error('Meal create error (json):', j)
            } catch {
              console.error('Meal create error (text):', text)
              msg = text || msg
            }
          } catch {}
          throw new Error(msg)
        }
        const newDish = await response.json()
        setDishes(prev => [...prev, {
          id: newDish.id,
          name: { ru: newDish.nameRu, tk: newDish.nameTk },
          description: { ru: newDish.descriptionRu || '', tk: newDish.descriptionTk || '' },
          price: newDish.price,
          image: newDish.image,
          categoryId: newDish.categoryId,
          dishPageImage: newDish.dishPageImage || '',
          sortOrder: newDish.sortOrder || 1,
          isActive: newDish.isActive,
          isAvailable: newDish.isAvailable,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
      }
      closeModal()
      toast.success(editingDish ? 'Блюдо обновлено!' : 'Блюдо добавлено!', {
        duration: 3000,
        position: 'top-right',
      })
      loadData()
    } catch (error) {
      console.error('Ошибка сохранения блюда:', error)
      toast.error(`Ошибка сохранения блюда: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, {
        duration: 4000,
        position: 'top-right',
      })
    }
  }

  const handleDelete = async (dishId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это блюдо?')) return

    try {
      // Удаление через API
      const response = await fetch(`/api/meal/${dishId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        let msg = 'Ошибка при удалении блюда'
        try {
          const text = await response.text()
          try {
            const j = JSON.parse(text)
            msg = j.error || msg
            console.error('Meal delete error (json):', j)
          } catch {
            console.error('Meal delete error (text):', text)
            msg = text || msg
          }
        } catch {}
        throw new Error(msg)
      }
      
      setDishes(prev => prev.filter(d => d.id !== dishId))
      toast.success('Блюдо удалено!', {
        duration: 3000,
        position: 'top-right',
      })
    } catch (error) {
      console.error('Ошибка удаления блюда:', error)
      toast.error(`Ошибка удаления блюда: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, {
        duration: 4000,
        position: 'top-right',
      })
    }
  }

  const toggleDishStatus = async (dish: Dish) => {
    try {
      const updatedDish = await dataService.updateDish(dish.id, {
        isActive: !dish.isActive
      })
      setDishes(prev => prev.map(d => d.id === dish.id ? updatedDish : d))
    } catch (error) {
      console.error('Ошибка изменения статуса блюда:', error)
    }
  }

  const handleImageUpload = (imageUrl: string | null) => {
    setFormData(prev => ({ ...prev, image: imageUrl || '' }))
  }
  const handleBannerUpload = (imageUrl: string | null) => {
    setFormData(prev => ({ ...prev, dishPageImage: imageUrl || '' }))
  }

  if (loading) {
    return (
      <div className="p-6 bg-white text-gray-900 rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Загрузка блюд...</span>
        </div>
      </div>
    )
  }

  // Получаем выбранную категорию
  const selectedCatObj = selectedCategory === 'all' ? null : categories.find(cat => cat.id === selectedCategory);

  return (
    <div className={`p-6 ${styles.bg} ${styles.text} rounded-lg`}>
      {/* Баннер категории */}
      {(selectedCatObj?.dishPageImage || selectedCatObj?.image) && (
        <div className="mb-6 rounded-xl overflow-hidden shadow-lg relative">
          <SmartImage
            src={selectedCatObj.dishPageImage || selectedCatObj.image}
            alt={lang === 'ru' ? selectedCatObj.name : selectedCatObj.nameTk}
            className="w-full h-48 object-cover"
          />
          <div className="absolute left-6 top-6 bg-black/60 text-white px-4 py-2 rounded-xl text-lg font-semibold shadow-lg">
            {lang === 'ru' ? selectedCatObj.name : selectedCatObj.nameTk}
          </div>
        </div>
      )}
      {/* Заголовок и кнопка добавления — стиль как у категорий */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{dishManagerTexts[lang].title}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {dishManagerTexts[lang].total}: {dishes.length} | {dishManagerTexts[lang].active}: {dishes.filter(d => d.isActive).length}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          {dishManagerTexts[lang].add}
        </button>
      </div>

      {/* Фильтры и поиск */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={dishManagerTexts[lang].search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        {/* Категория */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="all">{dishManagerTexts[lang].allCategories}</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {lang === 'ru' ? category.name : category.nameTk}
            </option>
          ))}
        </select>

        {/* Показать неактивные */}
        <label className="flex items-center gap-2 cursor-pointer text-gray-900">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 focus:ring-blue-500"
          />
          <span>{dishManagerTexts[lang].showInactive}</span>
        </label>
      </div>

      {/* Список блюд */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredDishes.map(dish => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`group bg-white border border-gray-200 rounded-2xl shadow-lg p-5 flex flex-col transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 ${!dish.isActive ? 'opacity-60' : ''}`}
            >
              {/* Изображение блюда */}
              <div className="relative mb-4">
                {dish.image ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden">
                    <SmartImage
                      src={dish.image}
                      alt={dish.name.ru}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-44 bg-gray-100 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {/* Статус бейджи */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {!dish.isAvailable && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full shadow">
                      {dishManagerTexts[lang].unavailable}
                    </span>
                  )}
                  {!dish.isActive && (
                    <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded-full shadow">
                      {dishManagerTexts[lang].inactive}
                    </span>
                  )}
                </div>
              </div>
              {/* Информация о блюде */}
              <div className="mb-3">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{dish.name[lang]}</h3>
                <p className="text-xs text-gray-400 mb-1 truncate">{dish.name[lang === 'ru' ? 'tk' : 'ru']}</p>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{dish.description?.[lang] || (lang === 'ru' ? 'Описание отсутствует' : 'Düşündiriş ýok')}</p>
              </div>
              {/* Цена и детали */}
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-1 text-xl font-bold text-green-600">
                  <DollarSign className="w-5 h-5" />
                  {dish.price} {lang === 'ru' ? 'ТМТ' : 'TMT'}
                </span>
                <button
                  onClick={() => openModal(dish)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 transition-colors shadow"
                  title={dishManagerTexts[lang].edit}
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              {/* Кнопки управления */}
              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => toggleDishStatus(dish)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm flex items-center justify-center font-medium transition-colors shadow ${
                    dish.isActive
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {dish.isActive ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {dish.isActive ? dishManagerTexts[lang].hide : dishManagerTexts[lang].show}
                </button>
                <button
                  onClick={() => handleDelete(dish.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm flex items-center justify-center font-medium shadow"
                  title={dishManagerTexts[lang].delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{dishManagerTexts[lang].notFound}</h3>
          <p className={styles.textMuted}>
            {searchTerm || selectedCategory !== 'all' 
              ? dishManagerTexts[lang].tryChangeFilters
              : dishManagerTexts[lang].startAdd
            }
          </p>
        </div>
      )}

      {/* Модальное окно добавления/редактирования */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white text-gray-900 rounded-t-2xl md:rounded-lg p-4 md:p-6 w-full max-w-full md:max-w-2xl h-full md:max-h-[90vh] overflow-y-auto shadow-xl fixed bottom-0 left-0 right-0 md:static"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{editingDish ? dishManagerTexts[lang].editDish : dishManagerTexts[lang].addDish}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form className="space-y-3 md:space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{dishManagerTexts[lang].nameRu}</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      required
                      type="text"
                      value={formData.name?.ru || ''}
                      onChange={e => setFormData(prev => ({ ...prev, name: { ...prev.name, ru: e.target.value } as { ru: string; tk: string } }))}
                      placeholder={lang === 'ru' ? 'Введите название блюда' : 'Tagamyň adyny giriziň'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{dishManagerTexts[lang].nameTk}</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      required
                      type="text"
                      value={formData.name?.tk || ''}
                      onChange={e => setFormData(prev => ({ ...prev, name: { ...prev.name, tk: e.target.value } as { ru: string; tk: string } }))}
                      placeholder={lang === 'ru' ? 'Введите название блюда' : 'Tagamyň adyny giriziň'}
                    />
                  </div>
                </div>
                
                {/* Поля описания на двух языках */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{dishManagerTexts[lang].descRu}</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 resize-y min-h-[100px]"
                      value={formData.description?.ru || ''}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        description: { 
                          ...prev.description, 
                          ru: e.target.value 
                        } as { ru: string; tk: string } 
                      }))}
                      placeholder={lang === 'ru' ? 'Введите описание блюда (необязательно)' : 'Tagamyň düşündirilişini giriziň (hökmany däl)'}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{dishManagerTexts[lang].descTk}</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 resize-y min-h-[100px]"
                      value={formData.description?.tk || ''}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        description: { 
                          ...prev.description, 
                          tk: e.target.value 
                        } as { ru: string; tk: string } 
                      }))}
                      placeholder={lang === 'ru' ? 'Введите описание блюда (необязательно)' : 'Tagamyň düşündirilişini giriziň (hökmany däl)'}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{dishManagerTexts[lang].category}</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      required
                      value={formData.categoryId}
                      onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    >
                      <option value="">{lang === 'ru' ? 'Выберите категорию' : 'Kategoriýa saýlaň'}</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{lang === 'ru' ? category.name : category.nameTk}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                      {dishManagerTexts[lang].price}
                      <span className="text-xs text-gray-400">(шаг 0.5)</span>
                    </label>
                    <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                      <button
                        type="button"
                        className="px-3 text-lg text-gray-500 hover:text-blue-600 focus:outline-none disabled:opacity-40"
                        aria-label="Уменьшить цену"
                        disabled={formData.price === 0 || formData.price === undefined || formData.price === null}
                        onClick={() => setFormData(prev => ({ ...prev, price: Math.max(0, (typeof prev.price === 'number' ? prev.price : 0) - 0.5) }))}
                      >
                        –
                      </button>
                      <input
                        className="w-full px-3 py-2 text-center text-lg font-semibold bg-transparent outline-none border-0 focus:ring-0 text-gray-900"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.price === 0 ? '' : formData.price ?? ''}
                        onChange={e => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, price: val === '' ? 0 : Math.max(0, parseFloat(val)) }))
                        }}
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                      <button
                        type="button"
                        className="px-3 text-lg text-gray-500 hover:text-blue-600 focus:outline-none"
                        aria-label="Увеличить цену"
                        onClick={() => setFormData(prev => ({ ...prev, price: (typeof prev.price === 'number' ? prev.price : 0) + 0.5 }))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Порядок сортировки</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      type="number"
                      min="1"
                      value={formData.sortOrder || 1}
                      onChange={e => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    >
                      <option value="active">Активно</option>
                      <option value="inactive">Неактивно</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{dishManagerTexts[lang].image}</label>
                    <ImageUpload currentImage={formData.image} onImageChange={handleImageUpload} />
                    <p className="text-xs text-gray-500 mt-1">Рекомендуемый размер: 600x400px (соотношение 3:2, мобильный формат)</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:gap-4 pt-3 md:pt-4">
                  <button type="submit" className="w-full md:flex-1 inline-flex items-center justify-center px-4 py-3 md:py-2 bg-blue-600 text-white rounded-lg transition-colors hover:bg-blue-700 text-base md:text-sm">
                    <Save className="w-4 h-4 mr-2" />
                    {editingDish ? dishManagerTexts[lang].save : dishManagerTexts[lang].create}
                  </button>
                  <button type="button" onClick={closeModal} className="w-full md:w-auto px-4 py-3 md:py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-base md:text-sm">
                    {dishManagerTexts[lang].cancel}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}