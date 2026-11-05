import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Layers3 } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import type { Account, ConversationScope, ProtocolId } from '../../types';
import { cn } from '../../lib/cn';
import { protocolLabel, pluralizeRu } from '../../lib/format';
import { ProtocolFilterChip } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { StatusChip } from '../ui/Badge';

interface ProtocolSwitcherProps {
  resultCount: number;
}

function scopeAccount(
  scope: ConversationScope,
  accounts: Account[],
): Account | undefined {
  if (scope.type !== 'account') return undefined;
  return accounts.find((account) => account.id === scope.accountId);
}

export function ProtocolSwitcher({ resultCount }: ProtocolSwitcherProps) {
  const { accounts } = useApp();
  const { scope, setScope } = useUi();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeAccount = scopeAccount(scope, accounts);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectProtocol = (protocol?: ProtocolId) => {
    setScope(protocol ? { type: 'protocol', protocol } : { type: 'all' });
  };

  return (
    <div className="protocol-switcher" ref={rootRef}>
      <div className="protocol-switcher__chips" role="group" aria-label="Фильтр по протоколу">
        <button
          type="button"
          className={cn('chip', scope.type === 'all' && 'is-selected')}
          aria-pressed={scope.type === 'all'}
          onClick={() => selectProtocol()}
        >
          Все
        </button>
        <ProtocolFilterChip
          protocol="matrix"
          selected={scope.type === 'protocol' && scope.protocol === 'matrix'}
          onSelect={() => selectProtocol('matrix')}
        />
        <ProtocolFilterChip
          protocol="xmpp"
          selected={scope.type === 'protocol' && scope.protocol === 'xmpp'}
          onSelect={() => selectProtocol('xmpp')}
        />
      </div>

      <button
        type="button"
        className={cn('account-scope-trigger', open && 'is-open', activeAccount && 'is-active')}
        aria-label="Фильтр по аккаунту"
        aria-haspopup="dialog"
        aria-expanded={open}
        title={activeAccount ? `Аккаунт: ${activeAccount.displayName}` : 'Фильтр по аккаунту'}
        onClick={() => setOpen((value) => !value)}
      >
        {activeAccount ? (
          <Avatar
            name={activeAccount.displayName}
            tone={activeAccount.tone}
            size={21}
            protocol={activeAccount.protocol}
          />
        ) : (
          <Layers3 size={16} />
        )}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div
          className="account-scope-popover"
          role="dialog"
          aria-label="Фильтр переписок по аккаунту"
        >
          <div className="account-scope-popover__header">
            <strong>Фильтр по аккаунту</strong>
            <span>
              {resultCount}{' '}
              {pluralizeRu(resultCount, ['переписка', 'переписки', 'переписок'])}
            </span>
          </div>
          <button
            type="button"
            className={cn('account-scope-option', scope.type === 'all' && 'is-selected')}
            onClick={() => {
              setScope({ type: 'all' });
              setOpen(false);
            }}
          >
            <span className="account-scope-option__all">
              <Layers3 size={17} />
            </span>
            <span className="account-scope-option__copy">
              <strong>Все аккаунты</strong>
              <span>Общая лента всех протоколов</span>
            </span>
            {scope.type === 'all' && <Check size={16} />}
          </button>
          <div className="account-scope-popover__list">
            {(['matrix', 'xmpp'] as ProtocolId[]).map((protocol) => {
              const protocolAccounts = accounts.filter(
                (account) => account.protocol === protocol,
              );
              if (!protocolAccounts.length) return null;
              return (
                <div className="account-scope-group" key={protocol}>
                  <span className="account-scope-group__label">{protocolLabel(protocol)}</span>
                  {protocolAccounts.map((account) => (
                    <button
                      type="button"
                      key={account.id}
                      className={cn(
                        'account-scope-option',
                        scope.type === 'account' &&
                          scope.accountId === account.id &&
                          'is-selected',
                      )}
                      onClick={() => {
                        setScope({ type: 'account', accountId: account.id });
                        setOpen(false);
                      }}
                    >
                      <Avatar
                        name={account.displayName}
                        tone={account.tone}
                        size={32}
                        protocol={account.protocol}
                      />
                      <span className="account-scope-option__copy">
                        <strong>{account.displayName}</strong>
                        <span>{account.handle}</span>
                      </span>
                      {scope.type === 'account' && scope.accountId === account.id ? (
                        <Check size={16} />
                      ) : (
                        <StatusChip status={account.status} />
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
