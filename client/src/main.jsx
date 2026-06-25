import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 17, 32, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              backdropFilter: 'blur(20px)',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0a0b14' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0b14' } },
          }}
        />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
