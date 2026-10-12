import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SystemTasksProvider } from './context/SystemTasksContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemTasksProvider>
      <App />
    </SystemTasksProvider>
  </StrictMode>,
);
