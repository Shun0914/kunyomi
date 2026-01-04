import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChangeHistory, User } from '../types/knowledge';
import { Clock, Plus, Edit, Trash } from 'lucide-react';

interface ChangeHistoryViewProps {
  histories: ChangeHistory[];
  users: User[];
}

export function ChangeHistoryView({ histories, users }: ChangeHistoryViewProps) {
  const getUserName = (userId: number) => {
    return users.find((u) => u.id === userId)?.name || '不明';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'deleted':
        return <Trash className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeBadgeVariant = (type: string) => {
    switch (type) {
      case 'created':
        return 'default';
      case 'updated':
        return 'secondary';
      case 'deleted':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getChangeLabel = (type: string) => {
    switch (type) {
      case 'created':
        return '作成';
      case 'updated':
        return '更新';
      case 'deleted':
        return '削除';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          変更履歴
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {histories.length === 0 ? (
            <p className="text-center text-gray-500 py-6">変更履歴がありません</p>
          ) : (
            histories.map((history) => (
              <div key={history.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                <div className="flex-shrink-0 mt-1">{getChangeIcon(history.change_type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getChangeBadgeVariant(history.change_type) as any}>
                      {getChangeLabel(history.change_type)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {getUserName(history.user_id)}
                    </span>
                  </div>
                  {history.field_changed && (
                    <p className="text-sm text-gray-700 mb-1">
                      フィールド: <span className="font-medium">{history.field_changed}</span>
                    </p>
                  )}
                  {history.old_value && history.new_value && (
                    <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                      <p>
                        <span className="text-red-600">- {history.old_value}</span>
                      </p>
                      <p>
                        <span className="text-green-600">+ {history.new_value}</span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{formatDate(history.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
