import { Compass, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <PageHeader title="Страница не найдена" />
      <div className="page-scroll">
        <div className="page-container page-container--narrow">
          <EmptyState
            icon={<Compass size={28} />}
            title="Такой страницы нет"
            description="Возможно, адрес изменился или ссылка больше не действует."
            action={
              <div className="empty-state__actions">
                <Button
                  icon={<MessageSquare size={16} />}
                  onClick={() => navigate('/messages')}
                >
                  К сообщениям
                </Button>
                <Button variant="text" onClick={() => navigate('/settings')}>
                  Настройки
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
