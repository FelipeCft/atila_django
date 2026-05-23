import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import AppRoutes from './routes/AppRoutes';
import ChatWidget from './components/common/ChatWidget';
import UIProvider from './components/common/UIProvider';


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ChatWidget />
        <UIProvider />
      </Router>
    </AuthProvider>
  );
}

export default App;
