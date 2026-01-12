'use client';

import { useState } from 'react';
import { GenreSelector } from '@/components/GenreSelector';
import { GenreDropdown } from '@/components/GenreDropdown';

export default function TestGenrePage() {
  const [sidebarGenre, setSidebarGenre] = useState<number | null>(null);
  const [formGenre, setFormGenre] = useState<number | null>(null);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">ジャンルコンポーネント テスト</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GenreSelector（サイドバー用） */}
        <div>
          <h2 className="text-xl font-bold mb-4">GenreSelector（サイドバー用）</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            <GenreSelector
              selectedGenreId={sidebarGenre}
              onSelectGenre={setSidebarGenre}
            />
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">選択中のジャンルID:</p>
            <pre className="p-4 bg-blue-50 rounded text-sm">
              {JSON.stringify({ sidebarGenre }, null, 2)}
            </pre>
          </div>
        </div>

        {/* GenreDropdown（フォーム用） */}
        <div>
          <h2 className="text-xl font-bold mb-4">GenreDropdown（フォーム用）</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">全ジャンル</label>
              <GenreDropdown
                value={formGenre}
                onChange={setFormGenre}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">L3のみ</label>
              <GenreDropdown 
                level={3} 
                onChange={() => {}} 
                className="w-full border rounded px-3 py-2" 
              />
            </div>
            <div>
              <label className="block font-medium mb-2">必須項目</label>
              <GenreDropdown 
                required 
                onChange={() => {}} 
                className="w-full border rounded px-3 py-2" 
              />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">選択中のジャンルID:</p>
            <pre className="p-4 bg-blue-50 rounded text-sm">
              {JSON.stringify({ formGenre }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}