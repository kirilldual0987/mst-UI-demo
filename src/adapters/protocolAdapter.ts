/**
 * Protocol adapter boundary.
 *
 * The UI prototype deliberately has no network implementation. Real Matrix and
 * XMPP clients should implement this contract in this folder and be injected
 * into the application state layer. Visual components must only depend on the
 * normalized data types from `src/types.ts`, never on protocol SDK objects.
 */

import type {
  Account,
  Chat,
  ChatMessage,
  Contact,
  MessageAttachment,
  ProtocolId,
} from '../types';

export interface ProtocolCapabilities {
  encryptionLabel: string;
  supportsReadReceipts: boolean;
  supportsRooms: boolean;
  supportsSpaces: boolean;
  supportsPresence: boolean;
  groupChatLabel: 'Группа' | 'MUC' | 'Комната';
  identifierLabel: 'Matrix ID' | 'JID';
}

export const PROTOCOL_CAPABILITIES: Record<ProtocolId, ProtocolCapabilities> = {
  matrix: {
    encryptionLabel: 'Megolm / Olm',
    supportsReadReceipts: true,
    supportsRooms: true,
    supportsSpaces: true,
    supportsPresence: true,
    groupChatLabel: 'Комната',
    identifierLabel: 'Matrix ID',
  },
  xmpp: {
    encryptionLabel: 'OMEMO',
    supportsReadReceipts: false,
    supportsRooms: false,
    supportsSpaces: false,
    supportsPresence: true,
    groupChatLabel: 'MUC',
    identifierLabel: 'JID',
  },
};

export interface AdapterConnectionResult {
  ok: boolean;
  accountId: string;
  syncedAt: Date;
  error?: string;
}

export interface AdapterSyncResult {
  conversations: Chat[];
  contacts: Contact[];
  messages: ChatMessage[];
  syncedAt: Date;
}

export interface AdapterSendMessageInput {
  chatId: string;
  text?: string;
  attachment?: MessageAttachment;
  replyToMessageId?: string;
}

export interface AdapterSendMessageResult {
  remoteId: string;
  deliveredAt: Date;
  readAt?: Date;
}

/**
 * A real adapter is intentionally responsible for translation between a
 * protocol SDK and Messthon's normalized entities:
 *
 * Matrix SDK -> MatrixAdapter -> Chat / Contact / ChatMessage
 * XMPP stanzas -> XmppAdapter -> Chat / Contact / ChatMessage
 */
export interface ProtocolAdapter {
  readonly protocol: ProtocolId;
  readonly capabilities: ProtocolCapabilities;

  connect(account: Account): Promise<AdapterConnectionResult>;
  disconnect(accountId: string): Promise<void>;
  sync(accountId: string): Promise<AdapterSyncResult>;
  sendMessage(input: AdapterSendMessageInput): Promise<AdapterSendMessageResult>;
  markRead(chatId: string): Promise<void>;
  setTyping(chatId: string, typing: boolean): Promise<void>;
}

/**
 * Add future protocol adapters here without changing visual components.
 * The registry is intentionally empty in the frontend prototype.
 */
export const protocolAdapterRegistry: Partial<
  Record<ProtocolId, ProtocolAdapter>
> = {};
