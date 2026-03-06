import axios from 'axios';
import { BASE_URL } from './config';
import { authApi } from '../axios/Auth';

// 현재 내 잔액 가져오기
export const getMyPoint = async (email) => {
  const { data } = await authApi.get('/api/wallet_getpoint', {
    params: {
      email,
    },
  });

  return data;
};

// [결제 승인 전]
export const createPayment = async ({ email, amount, orderId }) => {
  try {
    const { data } = await authApi.post('/api/payments', {
      email,
      amount,
      orderId,
    });

    return data;
  } catch (error) {
    console.error('createpayment error', error);
  }
};

// [결제 취소]
export const cancelPayment = async (paymentId) => {
  try {
    await authApi.patch(`/api/payments/${paymentId}`);
  } catch (error) {
    console.error('cancelpayment error', error);
  }
};
