'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { getText } from '@/i18n/translations'
import { getAppThemeClasses } from '@/styles/appTheme'

interface DishDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  dish: {
    id: string
    name: string
    nameTk?: string
    description?: string
    descriptionTk?: string
    price: number
    image?: string
    calories?: number
    weight?: number
    preparationTime?: number
  }
}

export default function DishDetailsModal({ isOpen, onClose, dish }: DishDetailsModalProps) {
  const { addItem } = useCart()
  const { currentRestaurant } = useTheme()
  const { currentLanguage } = useLanguage()
  const [quantity, setQuantity] = useState(1)
  const [showAddedNotification, setShowAddedNotification] = useState(false)

  const theme = getAppThemeClasses(currentRestaurant === '1' || currentRestaurant === 'panda-burger' ? 'panda-dark' : 'gold-elegance')

  const handleAddToCart = () => {
    addItem({
      id: dish.id,
      name: dish.name,
      nameTk: dish.nameTk,
      price: dish.price,
      quantity,
      image: dish.image
    })
    
    setShowAddedNotification(true)
    setTimeout(() => {
      setShowAddedNotification(false)
      onClose()
      setQuantity(1)
    }, 1500)
  }

  const dishName = currentLanguage === 'tk' ? (dish.nameTk || dish.name) : dish.name
  const dishDescription = currentLanguage === 'tk' ? (dish.descriptionTk || dish.description) : dish.description

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={`rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto ${theme.cardBg} shadow-2xl`}>
        {/* Header with close button */}
        <div className="relative">
          {dish.image && (
            <div className="relative h-64 w-full rounded-t-3xl overflow-hidden">
              <Image
                src={dish.image}
                alt={dishName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${theme.bgSecondary} ${theme.text} hover:bg-opacity-80`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Dish name and basic info */}
          <div className="mb-4">
            <h2 className={`text-2xl font-bold mb-2 ${theme.text}`}>
              {dishName}
            </h2>
            <div className={`text-3xl font-extrabold ${theme.accent} mb-3`}>
              {dish.price} ТМТ
            </div>
          </div>

          {/* Additional info */}
          {(dish.calories || dish.weight || dish.preparationTime) && (
            <div className={`flex flex-wrap gap-4 mb-4 text-sm ${theme.textSecondary}`}>
              {dish.calories && (
                <div className="flex items-center gap-1">
                  <span>🔥</span>
                  <span>{dish.calories} {getText('calories', currentLanguage)}</span>
                </div>
              )}
              {dish.weight && (
                <div className="flex items-center gap-1">
                  <span>⚖️</span>
                  <span>{dish.weight} {getText('grams', currentLanguage)}</span>
                </div>
              )}
              {dish.preparationTime && (
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{dish.preparationTime} {getText('minutes', currentLanguage)}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {dishDescription && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-2 ${theme.text}`}>
                {getText('description', currentLanguage)}
              </h3>
              <p className={`leading-relaxed ${theme.textSecondary}`}>
                {dishDescription}
              </p>
            </div>
          )}

          {/* Quantity selector */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-3 ${theme.text}`}>
              {getText('quantity', currentLanguage)}
            </h3>
            <div className={`flex items-center justify-center space-x-4 rounded-2xl p-4 ${theme.bgSecondary}`}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${theme.accent} text-white hover:opacity-80`}
                disabled={quantity <= 1}
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className={`text-2xl font-bold min-w-12 text-center ${theme.text}`}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${theme.accent} text-white hover:opacity-80`}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className={`w-full text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${theme.accent} hover:opacity-90`}
          >
            <ShoppingCart className="w-6 h-6" />
            {getText('addToCart', currentLanguage)} • {dish.price * quantity} ТМТ
          </button>
        </div>

        {/* Success notification */}
        {showAddedNotification && (
          <div className="absolute inset-0 bg-green-500/90 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {getText('addedToCart', currentLanguage)}!
              </h3>
              <p className="text-sm opacity-90">
                {quantity} × {dishName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}