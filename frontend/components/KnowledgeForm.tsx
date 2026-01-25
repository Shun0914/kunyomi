// 'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Document, Keyword, Genre } from '@/types/knowledge';
import { createDocument, getGenresFlat } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { X } from 'lucide-react';

interface KnowledgeFormProps {
  availableKeywords: Keyword[];
  onCancel?: () => void;
  initialData?: Document;
}

export function KnowledgeForm({
  availableKeywords,
  onCancel,
  initialData,
}: KnowledgeFormProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [genreId, setGenreId] = useState<string>(initialData?.genre_id?.toString() || '');
  const [externalLink, setExternalLink] = useState(initialData?.external_link || '');
  const [selectedKeywordNames, setSelectedKeywordNames] = useState<string[]>(
    initialData?.keywords?.map((k) => k.name) || []
  );
  const [customKeyword, setCustomKeyword] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdDocumentId, setCreatedDocumentId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    genre?: string;
    keywords?: string;
    submit?: string;
  }>({});

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setGenresLoading(true);
        const data = await getGenresFlat({ includeInactive: false });
        const level3Genres = data.filter(g => g.level === 3);
        setGenres(level3Genres);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      } finally {
        setGenresLoading(false);
      }
    };
    fetchGenres();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!title.trim()) {
      newErrors.title = 'タイトルは必須項目です。入力してください';
    } else if (title.length > 255) {
      newErrors.title = 'タイトルは255文字以内で入力してください';
    }
    if (!content.trim()) {
      newErrors.content = '本文は必須項目です。入力してください';
    }
    if (!genreId) {
      newErrors.genre = 'ジャンルは必須項目です。選択してください';
    }
    if (selectedKeywordNames.length > 3) {
      newErrors.keywords = 'キーワードは最大3個までです';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await createDocument({
        title: title.trim(),
        content: content.trim(),
        genre_id: parseInt(genreId),
        external_link: externalLink.trim() || undefined,
        keywords: selectedKeywordNames,
      });
      setCreatedDocumentId(response.id);
      setShowSuccessDialog(true);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'ドキュメントの作成に失敗しました';
      setErrors({ submit: errorMessage });
      console.error('Failed to create document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    if (createdDocumentId) {
      router.push(`/documents/${createdDocumentId}`);
    }
  };

  const toggleKeyword = (keywordName: string) => {
    setSelectedKeywordNames((prev) => {
      if (prev.includes(keywordName)) {
        return prev.filter((name) => name !== keywordName);
      } else {
        if (prev.length >= 3) {
          setErrors({ ...errors, keywords: 'キーワードは最大3個までです' });
          return prev;
        }
        setErrors({ ...errors, keywords: undefined });
        return [...prev, keywordName];
      }
    });
  };

  const handleAddCustomKeyword = () => {
    const trimmed = customKeyword.trim();
    if (!trimmed) return;
    if (selectedKeywordNames.length >= 3) {
      setErrors({ ...errors, keywords: 'キーワードは最大3個までです' });
      return;
    }
    if (selectedKeywordNames.includes(trimmed)) {
      setErrors({ ...errors, keywords: 'このキーワードは既に追加されています' });
      return;
    }
    setSelectedKeywordNames((prev) => [...prev, trimmed]);
    setCustomKeyword('');
    setErrors({ ...errors, keywords: undefined });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/document-list');
    }
  };

  return (
    <>
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>{initialData ? 'ナレッジを編集' : '新規ナレッジを作成'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({ ...errors, title: undefined }); }}
                placeholder="ナレッジのタイトルを入力"
                disabled={isSubmitting}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">ジャンル <span className="text-red-500">*</span></Label>
              {genresLoading ? (
                <Select disabled><SelectTrigger><SelectValue placeholder="読み込み中..." /></SelectTrigger></Select>
              ) : (
                <Select value={genreId} onValueChange={(v) => { setGenreId(v); if (errors.genre) setErrors({ ...errors, genre: undefined }); }} disabled={isSubmitting}>
                  <SelectTrigger id="genre" className={errors.genre ? 'border-red-500' : ''}>
                    <SelectValue placeholder="ジャンルを選択してください *" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((g) => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {errors.genre && <p className="text-sm text-red-500">{errors.genre}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">内容 <span className="text-red-500">*</span></Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => { setContent(e.target.value); if (errors.content) setErrors({ ...errors, content: undefined }); }}
                placeholder="ナレッジの内容を入力（Markdown形式対応）"
                rows={12}
                disabled={isSubmitting}
                className={errors.content ? 'border-red-500' : ''}
              />
              <p className="text-xs text-slate-500">Markdown形式で記述できます。見出し、リスト、コードブロックなどが使用できます。</p>
              {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalLink">外部リンク</Label>
              <Input id="externalLink" type="url" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://example.com" disabled={isSubmitting} />
            </div>

            <div className="space-y-2">
              <Label>キーワード<span className="text-sm text-slate-500 ml-2">（最大3個まで、{selectedKeywordNames.length}/3）</span></Label>
              <div className="flex gap-2">
                <Input placeholder="カスタムキーワードを追加..." value={customKeyword} onChange={(e) => setCustomKeyword(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomKeyword(); } }} disabled={isSubmitting} />
                <Button type="button" onClick={handleAddCustomKeyword} disabled={isSubmitting || !customKeyword.trim()} className="whitespace-nowrap">追加</Button>
              </div>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px] bg-white">
                {selectedKeywordNames.length === 0 ? (
                  <span className="text-sm text-slate-400">キーワードを選択してください</span>
                ) : (
                  selectedKeywordNames.map((kn) => (
                    <Badge key={kn} variant="secondary">{kn}<button type="button" onClick={() => toggleKeyword(kn)} className="ml-1 hover:text-red-500" disabled={isSubmitting}><X className="w-3 h-3" /></button></Badge>
                  ))
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <p className="w-full text-sm text-slate-600 mb-1">よく利用されるキーワード:</p>
                {availableKeywords.filter((k) => !selectedKeywordNames.includes(k.name)).map((kw) => (
                  <Badge key={kw.id} variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => !isSubmitting && toggleKeyword(kw.name)}>+ {kw.name}</Badge>
                ))}
              </div>
              {errors.keywords && <p className="text-sm text-red-500">{errors.keywords}</p>}
            </div>

            {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '登録中...' : (initialData ? '更新' : '登録')}</Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>キャンセル</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>登録が完了しました</AlertDialogTitle>
            <AlertDialogDescription>ナレッジの登録が正常に完了しました。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessDialogClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}