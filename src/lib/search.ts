import type {
  Chat,
  ChatMessage,
  Contact,
  SearchHit,
  SearchResults,
} from '../types';

export interface SearchData {
  chats: Chat[];
  contacts: Contact[];
  messages: ChatMessage[];
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('ru-RU');
}

export function searchEverything(
  query: string,
  data: SearchData,
  scopeChatId?: string,
): SearchResults {
  const needle = normalize(query);
  const empty: SearchResults = { chats: [], contacts: [], messages: [] };
  if (needle.length < 2) return empty;

  const chats = data.chats
    .filter((chat) => chat.name.toLocaleLowerCase('ru-RU').includes(needle))
    .slice(0, 5);

  const contacts = data.contacts
    .filter((contact) => {
      const haystack = [
        contact.name,
        contact.handle,
        contact.organization,
        contact.role,
      ].join(' ');
      return haystack.toLocaleLowerCase('ru-RU').includes(needle);
    })
    .slice(0, 5);

  const messages = data.messages
    .filter((message) => {
      if (message.system) return false;
      if (scopeChatId && message.chatId !== scopeChatId) return false;
      const haystack = [message.text, message.attachment?.name]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('ru-RU');
      return haystack.includes(needle);
    })
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .slice(0, 8);

  return { chats, contacts, messages };
}

export function flattenSearchResults(results: SearchResults): SearchHit[] {
  return [
    ...results.chats.map<SearchHit>((chat) => ({
      id: `chat-${chat.id}`,
      type: 'chat',
      title: chat.name,
      subtitle: chat.lastMessage,
      chatId: chat.id,
    })),
    ...results.contacts.map<SearchHit>((contact) => ({
      id: `contact-${contact.id}`,
      type: 'contact',
      title: contact.name,
      subtitle: contact.handle,
      contactId: contact.id,
    })),
    ...results.messages.map<SearchHit>((message) => ({
      id: `message-${message.id}`,
      type: 'message',
      title: message.senderName,
      subtitle: message.text ?? message.attachment?.name ?? 'Вложение',
      chatId: message.chatId,
    })),
  ];
}
