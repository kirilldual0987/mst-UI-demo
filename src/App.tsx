import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ChatWorkspace } from './components/chat/ChatWorkspace';
import { ContactsPage } from './components/contacts/ContactsPage';
import { AccountsPage } from './components/accounts/AccountsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/messages" replace />} />
        <Route path="messages" element={<ChatWorkspace view="all" />} />
        <Route path="messages/:chatId" element={<ChatWorkspace view="all" />} />
        <Route path="direct" element={<ChatWorkspace view="direct" />} />
        <Route path="direct/:chatId" element={<ChatWorkspace view="direct" />} />
        <Route path="groups" element={<ChatWorkspace view="groups" />} />
        <Route path="groups/:chatId" element={<ChatWorkspace view="groups" />} />
        <Route path="rooms" element={<ChatWorkspace view="rooms" />} />
        <Route path="rooms/:chatId" element={<ChatWorkspace view="rooms" />} />
        <Route path="favorites" element={<ChatWorkspace view="favorites" />} />
        <Route path="favorites/:chatId" element={<ChatWorkspace view="favorites" />} />
        <Route path="unread" element={<ChatWorkspace view="unread" />} />
        <Route path="unread/:chatId" element={<ChatWorkspace view="unread" />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="contacts/:contactId" element={<ContactsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/:section" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
