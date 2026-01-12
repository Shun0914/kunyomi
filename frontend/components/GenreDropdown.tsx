'use client';

import { useEffect, useState } from 'react';
import { getGenresFlat } from '@/lib/api/genres';
import type { Genre } from '@/types/knowledge';

interface GenreDropdownProps {
  value?: number | null;
  onChange: (genreId: number | null) => void;
  level?: 1 | 2 | 3; // フロントエンド側でフィルタリング
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function GenreDropdown({
  value,
  onChange,
  level,
  disabled = false,
  required = false,
  className = '',
}: GenreDropdownProps) {
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGenres();
  }, []);

  async function loadGenres() {
    try {
      setLoading(true);
      setError(null);
      const data = await getGenresFlat();
      setAllGenres(data);
    } catch (err) {
      console.error('ジャンル読み込みエラー:', err);
      setError('ジャンルの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValue = e.target.value;
    onChange(selectedValue ? Number(selectedValue) : null);
  }

  // レベルでフィルタリング（クライアント側）
  const genres = level 
    ? allGenres.filter(g => g.level === level)
    : allGenres;

  if (loading) {
    return (
      <select disabled className={className}>
        <option>読み込み中...</option>
      </select>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <select disabled className={className}>
          <option>エラーが発生しました</option>
        </select>
        <div className="text-sm text-red-600">{error}</div>
        <button
          type="button"
          onClick={loadGenres}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <select
      value={value ?? ''}
      onChange={handleChange}
      disabled={disabled}
      required={required}
      className={className}
    >
      <option value="">
        {required ? 'ジャンルを選択してください *' : 'ジャンルを選択'}
      </option>
      {genres.map((genre) => (
        <option key={genre.id} value={genre.id}>
          {'　'.repeat(genre.level - 1)}{genre.name}
        </option>
      ))}
    </select>
  );
}