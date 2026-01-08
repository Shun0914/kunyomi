import { useState } from 'react';
import { Document, Genre, Keyword } from '../types/knowledge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

interface KnowledgeFormProps {
  genres: Genre[];
  availableKeywords: Keyword[];
  onSubmit: (data: {
    title: string;
    content: string;
    genre_id: number;
    external_link: string;
    keywords: number[];
  }) => void;
  onCancel: () => void;
  initialData?: Document;
}

export function KnowledgeForm({
  genres,
  availableKeywords,
  onSubmit,
  onCancel,
  initialData,
}: KnowledgeFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [genreId, setGenreId] = useState<string>(initialData?.genre_id.toString() || '');
  const [externalLink, setExternalLink] = useState(initialData?.external_link || '');
  const [selectedKeywords, setSelectedKeywords] = useState<number[]>(
    initialData?.keywords?.map((k) => k.id) || []
  );
  const [newKeyword, setNewKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !genreId) {
      alert('タイトル、内容、ジャンルは必須です');
      return;
    }

    onSubmit({
      title,
      content,
      genre_id: parseInt(genreId),
      external_link: externalLink,
      keywords: selectedKeywords,
    });
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      // In a real app, this would create a new keyword
      // For now, just clear the input
      setNewKeyword('');
    }
  };

  const toggleKeyword = (keywordId: number) => {
    setSelectedKeywords((prev) =>
      prev.includes(keywordId)
        ? prev.filter((id) => id !== keywordId)
        : [...prev, keywordId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'ナレッジを編集' : '新規ナレッジを作成'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ナレッジのタイトルを入力"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">ジャンル *</Label>
            <Select value={genreId} onValueChange={setGenreId} required>
              <SelectTrigger id="genre">
                <SelectValue placeholder="ジャンルを選択" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id.toString()}>
                    {genre.path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">内容 *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ナレッジの内容を入力（Markdown形式対応）"
              rows={12}
              required
            />
            <p className="text-xs text-gray-500">
              Markdown形式で記述できます。見出し、リスト、コードブロックなどが使用できます。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalLink">外部リンク</Label>
            <Input
              id="externalLink"
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>キーワード</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
              {selectedKeywords.length === 0 ? (
                <span className="text-sm text-gray-400">キーワードを選択してください</span>
              ) : (
                selectedKeywords.map((keywordId) => {
                  const keyword = availableKeywords.find((k) => k.id === keywordId);
                  return keyword ? (
                    <Badge key={keyword.id} variant="secondary">
                      {keyword.name}
                      <button
                        type="button"
                        onClick={() => toggleKeyword(keyword.id)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ) : null;
                })
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <p className="w-full text-sm text-gray-600 mb-1">利用可能なキーワード:</p>
              {availableKeywords
                .filter((k) => !selectedKeywords.includes(k.id))
                .map((keyword) => (
                  <Badge
                    key={keyword.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleKeyword(keyword.id)}
                  >
                    + {keyword.name}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit">{initialData ? '更新' : '登録'}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
