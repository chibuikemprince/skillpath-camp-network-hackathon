import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CampProvider } from '@campnetwork/origin/react';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CampProvider clientId={import.meta.env.VITE_ORIGIN_CLIENT_ID || ''}>
        <App />
      </CampProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
