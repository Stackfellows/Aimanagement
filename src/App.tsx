import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import AiAssistant from '@/pages/AiAssistant';
import Finance from '@/pages/Finance';
import WhatsappManager from '@/pages/WhatsappManager';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Pricing from '@/pages/Pricing';
import UpgradeContact from '@/pages/UpgradeContact';

import EmailManager from '@/pages/EmailManager';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';

const queryClient = new QueryClient();

function App() {
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="ai" element={<AiAssistant />} />
            <Route path="whatsapp" element={<WhatsappManager />} />
            <Route path="finance" element={<Finance />} />
            <Route path="email" element={<EmailManager />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="upgrade-contact" element={<UpgradeContact />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
