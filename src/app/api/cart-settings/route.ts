import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    // Возвращаем дефолтные настройки корзины
    const cartSettings = {
      id: restaurantId || 'main_restaurant',
      deliveryFee: 0, // Убрали доставку по требованию
      minOrderAmount: 20,
      currency: 'TMT',
      isDeliveryAvailable: true,
      paymentMethods: ['cash'],
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(cartSettings);
  } catch (error) {
    console.error('Error fetching cart settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    // В реальном приложении здесь была бы логика сохранения в БД
    const updatedSettings = {
      id: restaurantId || 'main_restaurant',
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating cart settings:', error);
    return NextResponse.json(
      { error: 'Failed to update cart settings' },
      { status: 500 }
    );
  }
}