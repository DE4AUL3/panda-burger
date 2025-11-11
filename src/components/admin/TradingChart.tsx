"use client";

import React from 'react';

// Интерфейс для данных свечи
interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TradingChartProps {
  data: CandlestickData[];
  theme?: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ data, theme = 'light' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4">
        <h4 className="text-lg font-bold mb-2">📈 График продаж (Свечной анализ)</h4>
        <div className="text-center py-8 text-gray-500">Нет данных для отображения</div>
      </div>
    );
  }

  const maxPrice = Math.max(...data.map(item => item.high));
  const minPrice = Math.min(...data.map(item => item.low));
  const priceRange = maxPrice - minPrice || 1;

  const getPriceY = (price: number) => {
    return ((maxPrice - price) / priceRange) * 100;
  };

  return (
    <div className="p-4">
      <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
        📈 График продаж (Свечной анализ)
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">TradingView Style</span>
      </h4>
      
      <div className="relative bg-gradient-to-b from-gray-50 to-white border rounded-lg p-4 overflow-x-auto">
        {/* Сетка */}
        <div className="absolute inset-4 pointer-events-none">
          {[0, 25, 50, 75, 100].map(percent => (
            <div
              key={percent}
              className="absolute w-full border-t border-gray-200 opacity-30"
              style={{ top: `${percent}%` }}
            />
          ))}
        </div>

        {/* Ценовая шкала */}
        <div className="absolute right-0 top-4 bottom-4 w-16 text-xs text-gray-600">
          {[0, 25, 50, 75, 100].map(percent => {
            const price = maxPrice - (priceRange * percent / 100);
            return (
              <div
                key={percent}
                className="absolute right-2 transform -translate-y-1/2"
                style={{ top: `${percent}%` }}
              >
                {price.toFixed(0)} ТМТ
              </div>
            );
          })}
        </div>

        {/* Свечи */}
        <div className="flex items-end justify-center space-x-1 h-48 ml-4 mr-16">
          {data.map((candle, index) => {
            const isGreen = candle.close >= candle.open;
            const bodyTop = Math.min(candle.open, candle.close);
            const bodyBottom = Math.max(candle.open, candle.close);
            const bodyHeight = Math.abs(candle.close - candle.open);
            
            const wickTopY = getPriceY(candle.high);
            const bodyTopY = getPriceY(bodyTop);
            const bodyBottomY = getPriceY(bodyBottom);
            const wickBottomY = getPriceY(candle.low);
            
            const bodyHeightPercent = (bodyHeight / priceRange) * 100;

            return (
              <div key={index} className="relative flex flex-col items-center group">
                {/* Тултип */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  <div className="font-semibold">{candle.date}</div>
                  <div className="text-green-400">O: {candle.open}</div>
                  <div className="text-red-400">H: {candle.high}</div>
                  <div className="text-blue-400">L: {candle.low}</div>
                  <div className="text-yellow-400">C: {candle.close}</div>
                  {candle.volume && <div className="text-purple-400">V: {candle.volume}</div>}
                </div>

                {/* Свеча */}
                <div className="relative h-48 w-8 flex items-end">
                  {/* Верхняя тень */}
                  <div
                    className={`absolute left-1/2 w-0.5 transform -translate-x-1/2 ${
                      isGreen ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      bottom: `${100 - wickBottomY}%`,
                      height: `${wickBottomY - bodyBottomY}%`
                    }}
                  />
                  
                  {/* Тело свечи */}
                  <div
                    className={`relative w-6 mx-auto border-2 transition-all duration-300 hover:scale-110 ${
                      isGreen
                        ? 'bg-green-500 border-green-600 shadow-green-200'
                        : 'bg-red-500 border-red-600 shadow-red-200'
                    } shadow-lg rounded-sm`}
                    style={{
                      height: `${Math.max(bodyHeightPercent, 2)}%`,
                      bottom: `${100 - bodyBottomY}%`
                    }}
                  />
                  
                  {/* Нижняя тень */}
                  <div
                    className={`absolute left-1/2 w-0.5 transform -translate-x-1/2 ${
                      isGreen ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      bottom: `${100 - bodyTopY}%`,
                      height: `${bodyTopY - wickTopY}%`
                    }}
                  />
                </div>

                {/* Дата */}
                <div className="text-xs mt-2 text-gray-500 transform -rotate-45 whitespace-nowrap">
                  {candle.date.slice(5)}
                </div>

                {/* Объем (если есть) */}
                {candle.volume && (
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div 
                      className={`w-2 ${isGreen ? 'bg-green-300' : 'bg-red-300'} rounded-t`}
                      style={{ height: `${(candle.volume / Math.max(...data.map(d => d.volume || 1))) * 20}px` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Легенда */}
        <div className="flex justify-center mt-4 space-x-6 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Рост</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Падение</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-0.5 h-3 bg-gray-500"></div>
            <span>Тени (максимум/минимум)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;