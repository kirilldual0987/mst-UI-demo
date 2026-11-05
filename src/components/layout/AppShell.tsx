import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { MobileDrawer } from './MobileDrawer';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { NewChatModal } from '../modals/NewChatModal';
import { ToastViewport } from '../ui/Toast';
import { useUi } from '../../state/UiContext';
import { useApp } from '../../state/AppContext';

function isMobileDetail(pathname: string): boolean {
  return (
    /^\/(messages|direct|groups|rooms|favorites|unread)\/[^/]+/.test(pathname) ||
    /^\/contacts\/[^/]+/.test(pathname)
  );
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openSearch } = useUi();
  const { resolvedTheme, updateSettings } = useApp();
  const hideMobileNav = isMobileDetail(location.pathname);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === 'k' && !event.shiftKey) {
        event.preventDefault();
        openSearch();
        return;
      }
      if (['1', '2', '3', '4'].includes(key) && !event.shiftKey) {
        event.preventDefault();
        const destinations = ['/messages', '/contacts', '/accounts', '/settings'];
        const index = Number(key) - 1;
        navigate(destinations[index]);
        return;
      }
      if (key === 'j' && !event.shiftKey) {
        const composer = document.querySelector<HTMLTextAreaElement>('.composer__input');
        if (composer) {
          event.preventDefault();
          composer.focus();
        }
        return;
      }
      if (key === 'l' && event.shiftKey) {
        event.preventDefault();
        updateSettings({ theme: resolvedTheme === 'dark' ? 'light' : 'dark' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, openSearch, resolvedTheme, updateSettings]);

  return (
    <div
      className={`app-shell${hideMobileNav ? ' has-mobile-detail' : ''}`}
      data-route={location.pathname}
    >
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <Sidebar />
      <div className="app-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </div>
      {!hideMobileNav && <MobileNav />}
      <MobileDrawer />
      <GlobalSearchModal />
      <NewChatModal />
      <ToastViewport />
    </div>
  );
}
