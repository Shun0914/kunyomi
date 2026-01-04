import { Document, Genre, User, QA } from '../types/knowledge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ArrowLeft, Eye, ThumbsUp, ThumbsDown, ExternalLink, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from './ui/textarea';

interface KnowledgeDetailProps {
  document: Document;
  genres: Genre[];
  users: User[];
  qas: QA[];
  onBack: () => void;
  onAddQuestion: (documentId: number, questionText: string) => void;
}

export function KnowledgeDetail({ document, genres, users, qas, onBack, onAddQuestion }: KnowledgeDetailProps) {
  const [questionText, setQuestionText] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const getGenreName = (genreId: number) => {
    return genres.find((g) => g.id === genreId)?.name || '未分類';
  };

  const getUserName = (userId: number) => {
    return users.find((u) => u.id === userId)?.name || '不明';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const documentQAs = qas.filter((qa) => qa.document_id === document.id);

  const handleSubmitQuestion = () => {
    if (questionText.trim()) {
      onAddQuestion(document.id, questionText);
      setQuestionText('');
      setShowQuestionForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        一覧に戻る
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="mb-3">{document.title}</CardTitle>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{getUserName(document.created_by)}</span>
                <span>•</span>
                <span>{formatDate(document.created_at)}</span>
                <span>•</span>
                <Badge variant="secondary">{getGenreName(document.genre_id)}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {document.keywords && document.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {document.keywords.map((keyword) => (
                <Badge key={keyword.id} variant="outline">
                  {keyword.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="prose max-w-none mb-6">
            {document.content.split('\n').map((line, index) => (
              <p key={index} className="whitespace-pre-wrap">{line}</p>
            ))}
          </div>

          {document.external_link && (
            <div className="mb-6">
              <a
                href={document.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                外部リンク
              </a>
            </div>
          )}

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-500" />
              <span className="text-sm">{document.view_count} 回閲覧</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-gray-500" />
              <span className="text-sm">{document.helpful_count} 件の評価</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">役立ち度: {document.helpfulness_score.toFixed(1)}</span>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ThumbsUp className="w-4 h-4 mr-2" />
              役に立った
            </Button>
            <Button variant="outline" size="sm">
              <ThumbsDown className="w-4 h-4 mr-2" />
              改善が必要
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Q&Aセクション */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Q&A ({documentQAs.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuestionForm(!showQuestionForm)}
            >
              質問する
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showQuestionForm && (
            <div className="mb-6 p-4 border rounded-lg">
              <label className="block mb-2">質問内容</label>
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="このナレッジについて質問がありますか？"
                rows={4}
                className="mb-3"
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitQuestion} size="sm">
                  質問を投稿
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setQuestionText('');
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {documentQAs.length === 0 ? (
              <p className="text-center text-gray-500 py-6">まだ質問はありません</p>
            ) : (
              documentQAs.map((qa) => (
                <div key={qa.id} className="p-4 border rounded-lg">
                  <div className="mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      {qa.is_faq && (
                        <Badge variant="secondary" className="text-xs">
                          FAQ
                        </Badge>
                      )}
                      <Badge
                        variant={qa.status === 'answered' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {qa.status === 'answered' ? '回答済み' : '未回答'}
                      </Badge>
                    </div>
                    <p className="mb-1">
                      <strong>Q: </strong>{qa.question_text}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getUserName(qa.question_user_id)} · {formatDate(qa.created_at)}
                    </p>
                  </div>
                  {qa.answer_text && (
                    <div className="mt-3 pl-4 border-l-2 border-blue-500">
                      <p className="mb-1">
                        <strong>A: </strong>{qa.answer_text}
                      </p>
                      {qa.answer_user_id && qa.answered_at && (
                        <p className="text-xs text-gray-500">
                          {getUserName(qa.answer_user_id)} · {formatDate(qa.answered_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
