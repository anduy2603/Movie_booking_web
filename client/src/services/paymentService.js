import api from '../lib/api';

// Create payment
export const createPaymentRequest = (paymentData) => {
  return api.post('/payments', paymentData);
};

// Get my payments
export const getMyPaymentsRequest = () => {
  return api.get('/payments/me');
};

// Get payment by ID
export const getPaymentByIdRequest = (paymentId) => {
  return api.get(`/payments/${paymentId}`);
};

// Update payment status
export const updatePaymentStatusRequest = (paymentId, newStatus) => {
  return api.put(`/payments/${paymentId}/status`, null, {
    params: { new_status: newStatus }
  });
};

export default {
  createPaymentRequest,
  getMyPaymentsRequest,
  getPaymentByIdRequest,
  updatePaymentStatusRequest,
};

