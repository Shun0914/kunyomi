'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Loader2, User, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getQAsByDocument, createQuestion, submitAnswer } from '@/lib/api/qas';
import type { QAResponse } from '@/types/qa';

/**
 * ナレッジ詳細画面下部に表示されるQ&Aセクションコンポーネント
 */
export default function DocumentQASession({ documentId }: { documentId: string }) {
  // --- ステート管理 ---
  const [qas, setQas] = useState<QAResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 回答投稿用の管理ステート
  const [replyingTo, setReplyingTo] = useState<number | null>(null); // 現在回答入力中のQA ID
  const [answerText, setAnswerText] = useState('');

  /**
   * 日時フォーマット関数
   * モック案の「2024年1月16日 19:00」形式に変換
   */
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\//g, '年');
  };

  /**
   * APIからQA一覧を取得
   */
  const fetchQAs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQAsByDocument(documentId);
      setQas(data || []);
    } catch (error) {
      console.error("Failed to fetch QAs:", error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchQAs();
  }, [fetchQAs]);

  /**
   * 新規質問の投稿処理
   */
  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      setSubmitting(true);
      await createQuestion(documentId, newQuestion);
      setNewQuestion('');
      setIsFormOpen(false);
      await fetchQAs();
    } catch (error) {
      alert("質問の送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 既存質問への回答登録処理
   */
  const handleSubmitAnswer = async (qaId: number) => {
    if (!answerText.trim()) return;
    try {
      setSubmitting(true);
      await submitAnswer(qaId, answerText);
      setAnswerText('');
      setReplyingTo(null);
      await fetchQAs();
    } catch (error) {
      alert("回答の登録に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* --- セクションヘッダー --- */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <MessageCircle size={20} className="text-blue-500" />
          <span>Q&A ({qas.length})</span>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} variant="outline" size="sm" className="bg-white hover:bg-slate-50">
            質問する
          </Button>
        )}
      </div>

      <div className="p-6">
        {/* --- 質問投稿用入力フォーム --- */}
        {isFormOpen && (
          <div className="mb-8 space-y-4 p-5 bg-blue-50/30 rounded-xl border border-blue-100/50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
              <MessageSquareQuote size={16} />
              <span>新しい質問を投稿</span>
            </div>
            <textarea
              className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px] bg-white shadow-sm"
              placeholder="質問を入力してください..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              disabled={submitting}
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>キャンセル</Button>
              <Button size="sm" onClick={handleSubmitQuestion} disabled={submitting || !newQuestion.trim()} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
                質問を送信
              </Button>
            </div>
          </div>
        )}

        {/* --- QAリスト表示エリア --- */}
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : qas.length === 0 ? (
          <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
            <p className="text-sm">まだ質問はありません。最初の質問を投稿してみましょう。</p>
          </div>
        ) : (
          <div className="space-y-6">
            {qas.map((qa) => (
              /* 各QAカード：モック案に基づいたコンテナデザイン */
              <div key={qa.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                
                {/* 1. ステータスバッジ（FAQ / 回答済み） */}
                <div className="flex gap-2 mb-4">
                  {qa.is_faq && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded tracking-wider">
                      FAQ
                    </span>
                  )}
                  <span className={`${qa.answer_text ? 'bg-black text-white' : 'bg-slate-200 text-slate-500'} text-[10px] font-bold px-2 py-1 rounded tracking-wider`}>
                    {qa.answer_text ? '回答済み' : '未回答'}
                  </span>
                </div>

                {/* 2. 質問セクション */}
                <div className="mb-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="text-[16px] font-bold text-slate-900 leading-relaxed">
                        Q: {qa.question_text}
                      </h4>
                      {/* 投稿者情報：モックのレイアウトに準拠 */}
                      <p className="text-[12px] text-slate-400 mt-2 flex items-center gap-1">
                        <span>{qa.question_user_name || '匿名ユーザー'}</span>
                        <span>・</span>
                        <span>{formatDateTime(qa.created_at)}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 3. 回答セクション */}
                {qa.answer_text ? (
                  /* 回答済み：青いバー付きのレイアウト */
                  <div className="mt-4 pt-5 border-t border-slate-50 flex gap-4 relative">
                    {/* モック案にある垂直のアクセントライン */}
                    <div className="absolute left-0 top-5 bottom-0 w-[3px] bg-blue-500 rounded-full" />
                    <div className="pl-4 w-full">
                      <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                        <span className="font-bold mr-1">A:</span> {qa.answer_text}
                      </p>
                      {/* 回答者情報 */}
                      <p className="text-[12px] text-slate-400 mt-3">
                        {qa.answer_user_name || '回答担当者'} ・ {formatDateTime(qa.answered_at)}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 未回答：回答入力フォームまたは回答開始ボタン */
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    {replyingTo === qa.id ? (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in zoom-in-95">
                        <textarea
                          className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[80px]"
                          placeholder="回答を入力してください..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>キャンセル</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => handleSubmitAnswer(qa.id)} disabled={submitting || !answerText.trim()}>
                            {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 className="mr-2" size={16} />}
                            回答を登録
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold transition-colors"
                        onClick={() => {
                          setReplyingTo(qa.id);
                          setAnswerText('');
                        }}
                      >
                        回答する
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}