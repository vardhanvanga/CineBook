'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastCallbacks: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = 'success') {
  const toast = { id: Date.now().toString(), message, type };
  toastCallbacks.forEach(cb => cb(toast));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const callback = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 4000);
    };
    toastCallbacks.push(callback);
    return () => { toastCallbacks = toastCallbacks.filter(cb => cb !== callback); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm max-w-sm animate-fade-in ${
          toast.type === 'success' ? 'bg-green-800 border border-green-700' :
          toast.type === 'error' ? 'bg-red-900 border border-red-700' : 'bg-yellow-900 border border-yellow-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> :
           toast.type === 'error' ? <XCircle className="w-4 h-4 text-red-400 shrink-0" /> :
           <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-auto text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
