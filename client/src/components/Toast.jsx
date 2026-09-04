import { Toaster } from 'react-hot-toast';

/* ============================================================
   TOAST PROVIDER — Mobile-First Responsive Notifications
   ============================================================ */

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      containerStyle={{
        bottom: 24,
        left: 16,
        right: 16,
      }}
      toastOptions={{
        duration: 3500,
        style: {
          background: '#09090b',
          color: '#ffffff',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '12px 18px',
          fontSize: '13px',
          fontWeight: '600',
          fontFamily: 'var(--font-sans)',
          maxWidth: 'min(420px, calc(100vw - 32px))',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
        },
        success: {
          iconTheme: {
            primary: '#2563eb',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}