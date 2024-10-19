// src/components/Toast.tsx
import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div className={`fixed top-5 right-5 p-4 rounded shadow-md transition-opacity ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
      {message}
      <button onClick={onClose} className="ml-4 underline">X</button>
    </div>
  );
};

export default Toast;
