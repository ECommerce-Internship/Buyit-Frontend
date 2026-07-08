// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';

// One React Query client for the whole app (server-state caching).
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    {/* Global auth modal: any landing-page CTA opens it via useAuthModal().openAuth(...) */}
                    <AuthModalProvider>
                        <App />
                        {/* One Toaster for the whole app; toast.success/error render here. */}
                        <Toaster position="top-center" />
                    </AuthModalProvider>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);