import { useState, useMemo } from 'react';
import { Document, QA, User } from './types/knowledge';
import {
  mockDocuments,
  mockGenres,
  mockUsers,
  mockKeywords,
  mockQAs,
  mockDocumentRelations,
  mockChangeHistories,
} from './data/mockData';
import { SearchBar } from './components/SearchBar';
import { GenreSelector } from './components/GenreSelector';
import { KnowledgeList } from './components/KnowledgeList';
import { KnowledgeDetail } from './components/KnowledgeDetail';
import { KnowledgeForm } from './components/KnowledgeForm';
import { KnowledgeNetwork } from './components/KnowledgeNetwork';
import { EvaluationChart } from './components/EvaluationChart';
import { ChatbotSearch } from './components/ChatbotSearch';
import { ChangeHistoryView } from './components/ChangeHistoryView';
import { LoginDialog } from './components/LoginDialog';
import { NotificationSettings, NotificationSettings as NotificationSettingsType } from './components/NotificationSettings';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Plus, BookOpen, Network, BarChart3, Bot, History, Settings, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

export default function App() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [qas, setQAs] = useState<QA[]>(mockQAs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('knowledge');

  // 検索とフィルタリング
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // ジャンルでフィルタ
    if (selectedGenreId !== null) {
      const selectedGenre = mockGenres.find((g) => g.id === selectedGenreId);
      if (selectedGenre) {
        if (selectedGenre.parent_id === null) {
          const childGenreIds = mockGenres
            .filter((g) => g.parent_id === selectedGenreId)
            .map((g) => g.id);
          filtered = filtered.filter(
            (doc) => doc.genre_id === selectedGenreId || childGenreIds.includes(doc.genre_id)
          );
        } else {
          filtered = filtered.filter((doc) => doc.genre_id === selectedGenreId);
        }
      }
    }

    // 検索クエリでフィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.content.toLowerCase().includes(query) ||
          doc.keywords?.some((k) => k.name.toLowerCase().includes(query))
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [documents, searchQuery, selectedGenreId]);

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setViewMode('detail');
    setActiveTab('knowledge');
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, view_count: d.view_count + 1 } : d))
    );
  };

  const handleCreateDocument = (data: {
    title: string;
    content: string;
    genre_id: number;
    external_link: string;
    keywords: number[];
  }) => {
    if (!currentUser) {
      toast.error('ログインが必要です');
      setShowLoginDialog(true);
      return;
    }

    const newDoc: Document = {
      id: documents.length + 1,
      title: data.title,
      content: data.content,
      genre_id: data.genre_id,
      external_link: data.external_link || undefined,
      status: 'published',
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      helpful_count: 0,
      view_count: 0,
      helpfulness_score: 0,
      keywords: data.keywords.map((id) => mockKeywords.find((k) => k.id === id)!).filter(Boolean),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setViewMode('list');
    toast.success('ナレッジを作成しました');
  };

  const handleAddQuestion = (documentId: number, questionText: string) => {
    if (!currentUser) {
      toast.error('ログインが必要です');
      setShowLoginDialog(true);
      return;
    }

    const newQA: QA = {
      id: qas.length + 1,
      document_id: documentId,
      question_user_id: currentUser.id,
      question_text: questionText,
      status: 'pending',
      is_faq: false,
      created_at: new Date().toISOString(),
    };

    setQAs((prev) => [...prev, newQA]);
    toast.success('質問を投稿しました');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    toast.success(`ようこそ、${user.name}さん`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast.info('ログアウトしました');
  };

  const handleSaveNotificationSettings = (settings: NotificationSettingsType) => {
    // 実際のアプリケーションではAPIに保存
    console.log('Notification settings:', settings);
    toast.success('通知設定を保存しました');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl">ナレッジベース</h1>
            </div>
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <span className="text-sm text-gray-600">
                    {currentUser.name} ({currentUser.department})
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    ログアウト
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowLoginDialog(true)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  ログイン
                </Button>
              )}
              <Button
                onClick={() => {
                  if (!currentUser) {
                    toast.error('ログインが必要です');
                    setShowLoginDialog(true);
                    return;
                  }
                  setViewMode('create');
                  setActiveTab('knowledge');
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新規作成
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              ナレッジ
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              ネットワーク
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              分析
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI検索
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              履歴
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              設定
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge">
            {viewMode === 'list' && (
              <div className="flex gap-6">
                <aside className="w-64 flex-shrink-0">
                  <div className="sticky top-24 space-y-4">
                    <GenreSelector
                      genres={mockGenres}
                      selectedGenreId={selectedGenreId}
                      onSelectGenre={setSelectedGenreId}
                    />
                  </div>
                </aside>

                <main className="flex-1">
                  <div className="mb-6">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    <div className="mt-2 text-sm text-gray-600">
                      {filteredDocuments.length} 件のナレッジ
                    </div>
                  </div>
                  <KnowledgeList
                    documents={filteredDocuments}
                    genres={mockGenres}
                    users={mockUsers}
                    onSelectDocument={handleSelectDocument}
                  />
                </main>
              </div>
            )}

            {viewMode === 'detail' && selectedDocument && (
              <div className="max-w-4xl mx-auto">
                <KnowledgeDetail
                  document={selectedDocument}
                  genres={mockGenres}
                  users={mockUsers}
                  qas={qas}
                  onBack={() => setViewMode('list')}
                  onAddQuestion={handleAddQuestion}
                />
              </div>
            )}

            {viewMode === 'create' && (
              <div className="max-w-4xl mx-auto">
                <KnowledgeForm
                  genres={mockGenres}
                  availableKeywords={mockKeywords}
                  onSubmit={handleCreateDocument}
                  onCancel={() => setViewMode('list')}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="network">
            <KnowledgeNetwork
              documents={documents}
              relations={mockDocumentRelations}
              onNodeClick={handleSelectDocument}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <EvaluationChart documents={documents} />
          </TabsContent>

          <TabsContent value="chatbot">
            <div className="max-w-4xl mx-auto">
              <ChatbotSearch documents={documents} onDocumentSelect={handleSelectDocument} />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="max-w-4xl mx-auto">
              <ChangeHistoryView histories={mockChangeHistories} users={mockUsers} />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-4xl mx-auto">
              <NotificationSettings onSave={handleSaveNotificationSettings} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={handleLogin}
        users={mockUsers}
      />
    </div>
  );
}
