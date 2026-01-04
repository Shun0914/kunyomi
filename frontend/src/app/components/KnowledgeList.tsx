import { Document, Genre, User } from '../types/knowledge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, ThumbsUp, TrendingUp } from 'lucide-react';

interface KnowledgeListProps {
  documents: Document[];
  genres: Genre[];
  users: User[];
  onSelectDocument: (doc: Document) => void;
}

export function KnowledgeList({ documents, genres, users, onSelectDocument }: KnowledgeListProps) {
  const getGenreName = (genreId: number) => {
    return genres.find((g) => g.id === genreId)?.name || '未分類';
  };

  const getUserName = (userId: number) => {
    return users.find((u) => u.id === userId)?.name || '不明';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          該当するナレッジが見つかりませんでした
        </div>
      ) : (
        documents.map((doc) => (
          <Card
            key={doc.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectDocument(doc)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="mb-2">{doc.title}</CardTitle>
                  <CardDescription>
                    {getUserName(doc.created_by)} · {formatDate(doc.created_at)}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{getGenreName(doc.genre_id)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                {doc.keywords && doc.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {doc.keywords.map((keyword) => (
                      <Badge key={keyword.id} variant="outline">
                        {keyword.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{doc.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{doc.helpful_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{doc.helpfulness_score.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
