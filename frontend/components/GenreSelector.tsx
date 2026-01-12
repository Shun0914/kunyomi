'use client';

import { useEffect, useState } from 'react';
import { getGenres } from '@/lib/api/genres';
import type { Genre } from '@/types/knowledge';

interface GenreSelectorProps {
  selectedGenreId: number | null;
  onSelectGenre: (genreId: number | null) => void;
}

export function GenreSelector({ 
  selectedGenreId, 
  onSelectGenre 
}: GenreSelectorProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGenres();
  }, []);

  async function loadGenres() {
    try {
      setLoading(true);
      setError(null);
      const data = await getGenres();
      setGenres(data);
    } catch (err) {
      console.error('ジャンル読み込みエラー:', err);
      setError('ジャンルの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-2">{error}</div>
        <button onClick={loadGenres} className="text-blue-600 underline">
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="px-4 py-2 font-semibold">ジャンル</h3>
      
      <button
        onClick={() => onSelectGenre(null)}
        className={`w-full text-left px-4 py-2 ${
          selectedGenreId === null
            ? 'bg-blue-100 font-medium'
            : 'hover:bg-gray-100'
        }`}
      >
        すべて
      </button>

      {genres.map(genre => (
        <GenreTree
          key={genre.id}
          genre={genre}
          selectedGenreId={selectedGenreId}
          onSelectGenre={onSelectGenre}
          level={0}
        />
      ))}
    </div>
  );
}

interface GenreTreeProps {
  genre: Genre;
  selectedGenreId: number | null;
  onSelectGenre: (genreId: number | null) => void;
  level: number;
}

function GenreTree({ 
  genre, 
  selectedGenreId, 
  onSelectGenre, 
  level 
}: GenreTreeProps) {
  const sizeClass = level === 0 ? '' : level === 1 ? 'text-sm' : 'text-xs';
  const paddingLeft = (level + 1) * 16;
  
  return (
    <div>
      <button
        onClick={() => onSelectGenre(genre.id)}
        className={`w-full text-left px-4 py-2 ${sizeClass} ${
          selectedGenreId === genre.id
            ? 'bg-blue-100 font-medium'
            : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {level > 0 && '└ '}
        {genre.name}
      </button>

      {genre.children && genre.children.length > 0 && (
        <>
          {genre.children.map(child => (
            <GenreTree
              key={child.id}
              genre={child}
              selectedGenreId={selectedGenreId}
              onSelectGenre={onSelectGenre}
              level={level + 1}
            />
          ))}
        </>
      )}
    </div>
  );
}