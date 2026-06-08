import React from 'react';
import ReactDOM from 'react-dom/client';
import merge from 'lodash/merge';

import { BrowserRouter } from 'react-router-dom';
import enConfig from 'tdesign-react/es/locale/en_US';

import { ConfigProvider } from 'tdesign-react';
import { Toaster } from 'react-hot-toast';

import RoutesList from './const/routes.tsx';
import { ErrorBoundary } from './components/error-boundary.tsx';

import 'tdesign-react/es/style/index.css'; // global design variables
import './index.css';

const globalConfig = merge(enConfig, {
  image: {
    errorText: 'Gagal Dimuat!',
    loadingText: 'Memuat...',
  },
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConfigProvider globalConfig={globalConfig}>
        <Toaster />
        <BrowserRouter>
          <RoutesList />
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
