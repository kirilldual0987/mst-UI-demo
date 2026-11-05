import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShieldCheck } from 'lucide-react';
import type { Contact } from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ProtocolBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddContactModal({ open, onClose }: AddContactModalProps) {
  const { accounts, addContact } = useApp();
  const { notify } = useUi();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName('');
    setHandle('');
    setAccountId(accounts[0]?.id ?? '');
    setOrganization('');
    setError('');
    setSaving(false);
  }, [open, accounts]);

  const selectedAccount = accounts.find((account) => account.id === accountId);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Укажите имя контакта.');
      return;
    }
    if (handle.trim().length < 3) {
      setError(
        selectedAccount?.protocol === 'matrix'
          ? 'Введите Matrix ID, например @name:server.'
          : 'Введите JID, например name@server.',
      );
      return;
    }
    if (!selectedAccount) {
      setError('Выберите аккаунт для подключения контакта.');
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      const contact: Contact = addContact({
        name: name.trim(),
        handle: handle.trim(),
        accountId: selectedAccount.id,
        protocol: selectedAccount.protocol,
        organization: organization.trim() || undefined,
      });
      setSaving(false);
      onClose();
      notify({
        title: 'Контакт добавлен',
        description: `${contact.name} доступен через ${selectedAccount.displayName}.`,
        tone: 'success',
      });
      navigate(`/contacts/${contact.id}`);
    }, 650);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Добавить контакт"
      description="Контакт будет привязан к выбранному аккаунту и протоколу."
      size="md"
      footer={
        <>
          <Button variant="text" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            form="add-contact-form"
            icon={<Plus size={16} />}
            loading={saving}
          >
            Добавить контакт
          </Button>
        </>
      }
    >
      <form className="form-stack" id="add-contact-form" onSubmit={submit}>
        <div className="account-choice-preview">
          <Avatar
            name={selectedAccount?.displayName ?? 'Messthon'}
            tone={selectedAccount?.tone ?? 0}
            size={38}
            protocol={selectedAccount?.protocol ?? 'matrix'}
          />
          <div>
            <strong>{selectedAccount?.displayName ?? 'Нет аккаунта'}</strong>
            <span>{selectedAccount?.handle ?? 'Сначала подключите аккаунт'}</span>
          </div>
          {selectedAccount && <ProtocolBadge protocol={selectedAccount.protocol} />}
        </div>

        <label className="field">
          <span className="field__label">Имя</span>
          <input
            className="text-field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например, Anna Petrova"
            autoFocus
            required
          />
        </label>

        <label className="field">
          <span className="field__label">
            {selectedAccount?.protocol === 'matrix' ? 'Matrix ID' : 'JID'}
          </span>
          <input
            className="text-field text-field--mono"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            placeholder={
              selectedAccount?.protocol === 'matrix'
                ? '@anna:messthon.chat'
                : 'anna@jabber.ccc.de'
            }
            required
          />
          <span className="field__hint">
            Идентификатор должен относиться к серверу {selectedAccount?.server ?? 'аккаунта'}.
          </span>
        </label>

        <div className="form-grid">
          <label className="field">
            <span className="field__label">Аккаунт</span>
            <select
              className="text-field"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
            >
              {accounts.map((account) => (
                <option value={account.id} key={account.id}>
                  {account.displayName} · {account.protocol === 'matrix' ? 'Matrix' : 'XMPP'}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Организация</span>
            <input
              className="text-field"
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
              placeholder="Необязательно"
            />
          </label>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="form-note">
          <ShieldCheck size={16} />
          <span>
            В прототипе контакт сохраняется локально. Реальный запрос к федерации
            появится после интеграции адаптера.
          </span>
        </div>
      </form>
    </Modal>
  );
}
