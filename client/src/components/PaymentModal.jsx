import React, { useState } from 'react';
import { X, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, totalAmount, onConfirm }) => {
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: Wallet, description: 'Pay at theater' },
    { id: 'momo', name: 'MoMo', icon: Smartphone, description: 'Mobile payment' },
    { id: 'zalopay', name: 'ZaloPay', icon: Smartphone, description: 'Mobile payment' },
    { id: 'visa', name: 'Visa/Mastercard', icon: CreditCard, description: 'Credit/Debit card' },
  ];

  const handlePayment = async () => {
    try {
      setProcessing(true);
      await onConfirm(selectedMethod, totalAmount);
      // onConfirm thành công sẽ tự động navigate, đóng modal
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      // Error đã được handle trong onConfirm với toast
      // Modal sẽ không đóng nếu có lỗi để user có thể thử lại
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Total Amount */}
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <p className="text-gray-400 text-sm mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-white">
              {totalAmount.toLocaleString()} VND
            </p>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <p className="text-gray-300 mb-4 font-medium">Select Payment Method</p>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]'
                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-[var(--color-primary)]' : 'bg-gray-600'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {method.name}
                        </p>
                        <p className="text-sm text-gray-400">{method.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1 px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dull)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

