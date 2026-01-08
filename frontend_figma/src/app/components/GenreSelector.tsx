import { Genre } from '../types/knowledge';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenreId: number | null;
  onSelectGenre: (genreId: number | null) => void;
}

export function GenreSelector({ genres, selectedGenreId, onSelectGenre }: GenreSelectorProps) {
  const topLevelGenres = genres.filter((g) => g.parent_id === null);

  const getChildGenres = (parentId: number) => {
    return genres.filter((g) => g.parent_id === parentId);
  };

  return (
    <div className="space-y-2">
      <h3 className="px-4 mb-2">ジャンル</h3>
      <Button
        variant={selectedGenreId === null ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => onSelectGenre(null)}
      >
        すべて
      </Button>
      {topLevelGenres.map((genre) => {
        const children = getChildGenres(genre.id);
        return (
          <div key={genre.id}>
            <Button
              variant={selectedGenreId === genre.id ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onSelectGenre(genre.id)}
            >
              {genre.name}
            </Button>
            {children.length > 0 && (
              <div className="ml-4 space-y-1 mt-1">
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedGenreId === child.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => onSelectGenre(child.id)}
                  >
                    <ChevronRight className="w-3 h-3 mr-1" />
                    {child.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
