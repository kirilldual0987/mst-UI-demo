import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource-variable/inter';
import App from './App';
import { AppProvider } from './state/AppContext';
import { UiProvider } from './state/UiContext';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import './styles/layout.css';
import './styles/chat.css';
import './styles/pages.css';
import './styles/settings.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <UiProvider>
          <App />
        </UiProvider>
      </AppProvider>
    </HashRouter>
  </StrictMode>,
);
