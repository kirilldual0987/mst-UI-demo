import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Grid2X2,
  LoaderCircle,
  Server,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { Account, ProtocolId } from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ProtocolBadge } from '../ui/Badge';
import { cn } from '../../lib/cn';

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'protocol' | 'credentials';

const PROTOCOL_CARDS: Array<{
  id: ProtocolId;
  title: string;
  description: string;
  icon: typeof Grid2X2;
  features: string[];
}> = [
  {
    id: 'matrix',
    title: 'Matrix',
    description: 'Федеративная сеть с комнатами, пространствами и Megolm.',
    icon: Grid2X2,
    features: ['Комнаты и Spaces', 'Сквозное шифрование', 'Проверка устройств'],
  },
  {
    id: 'xmpp',
    title: 'XMPP',
    description: 'Открытый стандарт обмена сообщениями с OMEMO и MUC.',
    icon: Zap,
    features: ['Личные сообщения', 'MUC-конференции', 'OMEMO и ресурсы'],
  },
];

export function AddAccountModal({ open, onClose }: AddAccountModalProps) {
  const { accounts, addAccount } = useApp();
  const { notify } = useUi();
  const [step, setStep] = useState<Step>('protocol');
  const [protocol, setProtocol] = useState<ProtocolId>('matrix');
  const [displayName, setDisplayName] = useState('');
  const [server, setServer] = useState('messthon.chat');
  const [handle, setHandle] = useState('');
  const [resource, setResource] = useState('Messthon Desktop');
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep('protocol');
    setProtocol('matrix');
    setDisplayName('');
    setServer('messthon.chat');
    setHandle('');
    setResource('Messthon Desktop');
    setError('');
    setConnecting(false);
  }, [open]);

  const protocolCard = useMemo(
    () => PROTOCOL_CARDS.find((item) => item.id === protocol)!,
    [protocol],
  );

  const selectProtocol = (next: ProtocolId) => {
    setProtocol(next);
    if (next === 'matrix') {
      setServer('messthon.chat');
      setHandle('');
    } else {
      setServer('jabber.ccc.de');
      setHandle('');
    }
    setError('');
  };

  const goToCredentials = () => {
    setStep('credentials');
    setError('');
  };

  const connect = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (displayName.trim().length < 2) {
      setError('Укажите отображаемое имя аккаунта.');
      return;
    }
    if (handle.trim().length < 3) {
      setError(protocol === 'matrix' ? 'Введите Matrix ID.' : 'Введите JID.');
      return;
    }
    if (server.trim().length < 3) {
      setError('Укажите адрес сервера.');
      return;
    }
    setConnecting(true);
    window.setTimeout(() => {
      const lastTone = accounts.length % 6;
      const account: Account = {
        id: `account-${Date.now()}`,
        protocol,
        displayName: displayName.trim(),
        shortName: displayName.trim().split(/\s+/)[0],
        handle: handle.trim(),
        server: server.trim(),
        tone: (lastTone === 0 ? 2 : lastTone) as Account['tone'],
        status: 'connected',
        lastSync: 'только что',
        statusDetail:
          protocol === 'matrix'
            ? 'Новый аккаунт Matrix подключён в демонстрационном режиме'
            : 'Новый аккаунт XMPP подключён в демонстрационном режиме',
        deviceLabel:
          protocol === 'matrix'
            ? 'Messthon Web · проверено'
            : `${resource || 'Messthon Web'} · OMEMO`,
        encryptionLabel: protocol === 'matrix' ? 'Megolm / Olm' : 'OMEMO 0.8',
        readReceipts: protocol === 'matrix',
      };
      addAccount(account);
      setConnecting(false);
      onClose();
      notify({
        title: 'Аккаунт подключён',
        description: `${displayName.trim()} · ${protocol === 'matrix' ? 'Matrix' : 'XMPP'}`,
        tone: 'success',
      });
    }, 1300);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === 'protocol' ? 'Добавить аккаунт' : `Подключение ${protocol === 'matrix' ? 'Matrix' : 'XMPP'}`}
      description={
        step === 'protocol'
          ? 'Messthon поддерживает несколько аккаунтов одного или разных протоколов.'
          : 'Укажите данные аккаунта. Сетевой запрос в прототипе имитируется.'
      }
      size="md"
      footer={
        step === 'protocol' ? (
          <>
            <Button variant="text" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={goToCredentials} trailingIcon={<ArrowRight size={16} />}>
              Продолжить
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="text"
              icon={<ArrowLeft size={16} />}
              onClick={() => setStep('protocol')}
            >
              Назад
            </Button>
            <Button
              type="submit"
              form="add-account-form"
              loading={connecting}
              icon={connecting ? <LoaderCircle size={16} /> : <ShieldCheck size={16} />}
            >
              {connecting ? 'Подключение…' : 'Подключить'}
            </Button>
          </>
        )
      }
    >
      {step === 'protocol' ? (
        <div className="protocol-choice">
          {PROTOCOL_CARDS.map((item) => {
            const Icon = item.icon;
            const selected = protocol === item.id;
            return (
              <button
                type="button"
                key={item.id}
                className={cn('protocol-choice__card', selected && 'is-selected')}
                aria-pressed={selected}
                onClick={() => selectProtocol(item.id)}
              >
                <span className={cn('protocol-choice__icon', `protocol-choice__icon--${item.id}`)}>
                  <Icon size={22} />
                </span>
                <span className="protocol-choice__copy">
                  <span className="protocol-choice__title">
                    <strong>{item.title}</strong>
                    {selected && <Check size={16} />}
                  </span>
                  <span>{item.description}</span>
                  <span className="protocol-choice__features">
                    {item.features.map((feature) => (
                      <span key={feature}>{feature}</span>
                    ))}
                  </span>
                </span>
              </button>
            );
          })}
          <div className="form-note">
            <ShieldCheck size={16} />
            <span>
              Пароль не запрашивается: в прототипе авторизация и сетевые подключения
              отключены. Архитектура готова к подключению адаптеров протоколов.
            </span>
          </div>
        </div>
      ) : (
        <form className="form-stack" id="add-account-form" onSubmit={connect}>
          <div className="account-choice-preview">
            <span className={cn('protocol-choice__icon', `protocol-choice__icon--${protocol}`)}>
              {protocol === 'matrix' ? <Grid2X2 size={22} /> : <Zap size={22} />}
            </span>
            <div>
              <strong>{protocolCard.title}</strong>
              <span>{protocolCard.description}</span>
            </div>
            <ProtocolBadge protocol={protocol} />
          </div>

          <label className="field">
            <span className="field__label">Название аккаунта</span>
            <input
              className="text-field"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={protocol === 'matrix' ? 'Рабочий аккаунт' : 'Личный XMPP'}
              autoFocus
              required
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span className="field__label">
                {protocol === 'matrix' ? 'Matrix ID' : 'JID'}
              </span>
              <input
                className="text-field text-field--mono"
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                placeholder={
                  protocol === 'matrix'
                    ? '@name:messthon.chat'
                    : 'name@jabber.ccc.de'
                }
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Сервер</span>
              <span className="text-field text-field--with-icon">
                <Server size={15} />
                <input
                  value={server}
                  onChange={(event) => setServer(event.target.value)}
                  placeholder="example.org"
                  required
                />
              </span>
            </label>
          </div>

          {protocol === 'xmpp' && (
            <label className="field">
              <span className="field__label">Ресурс</span>
              <input
                className="text-field"
                value={resource}
                onChange={(event) => setResource(event.target.value)}
                placeholder="Messthon Desktop"
              />
              <span className="field__hint">
                Ресурс помогает различать подключённые устройства в XMPP.
              </span>
            </label>
          )}

          {error && <div className="form-error" role="alert">{error}</div>}

          <div className="form-note">
            <ShieldCheck size={16} />
            <span>
              {protocol === 'matrix'
                ? 'Подключение создаст локальную демонстрационную сессию Matrix. Ключи и устройства не затрагиваются.'
                : 'Подключение создаст локальную демонстрационную сессию XMPP. OMEMO-ключи не генерируются.'}
            </span>
          </div>
        </form>
      )}
    </Modal>
  );
}
