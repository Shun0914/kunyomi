import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, Bot } from 'lucide-react';
import { Document } from '../types/knowledge';

interface ChatbotSearchProps {
  documents: Document[];
  onDocumentSelect: (doc: Document) => void;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  suggestedDocuments?: Document[];
}

export function ChatbotSearch({ documents, onDocumentSelect }: ChatbotSearchProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'こんにちは！ナレッジベースについて何かお探しですか？キーワードを教えてください。',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input,
    };

    // 簡易的な検索ロジック（実際にはAI APIを使用）
    const searchResults = documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(input.toLowerCase()) ||
        doc.content.toLowerCase().includes(input.toLowerCase()) ||
        doc.keywords?.some((k) => k.name.toLowerCase().includes(input.toLowerCase()))
    );

    const assistantMessage: Message = {
      id: messages.length + 2,
      role: 'assistant',
      content:
        searchResults.length > 0
          ? `「${input}」に関連するナレッジを${searchResults.length}件見つけました。以下の記事をご確認ください：`
          : `申し訳ございません。「${input}」に関連するナレッジが見つかりませんでした。別のキーワードで試してみてください。`,
      suggestedDocuments: searchResults.slice(0, 3),
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AIチャットボット検索
        </CardTitle>
        <p className="text-sm text-gray-600">
          質問や探したいトピックを入力してください。関連するナレッジを提案します。
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.suggestedDocuments && message.suggestedDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white rounded p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => onDocumentSelect(doc)}
                      >
                        <p className="text-sm text-blue-600 hover:underline">{doc.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          評価: {doc.helpfulness_score.toFixed(1)} | 閲覧: {doc.view_count}回
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="質問やキーワードを入力..."
          />
          <Button onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
