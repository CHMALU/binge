import { render, screen } from '@testing-library/react';
import MovieCard from '@/components/MovieCard';

describe('Integration: MovieCard in a list', () => {
  it('renders multiple movie cards', () => {
    const movies = [
      { id: 1, title: 'Movie 1', poster_path: '/1.jpg', vote_average: 7.5, release_date: '2020-01-01', overview: 'Test 1' },
      { id: 2, title: 'Movie 2', poster_path: '/2.jpg', vote_average: 8.0, release_date: '2021-01-01', overview: 'Test 2' }
    ];
    render(
      <div>
        {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    );
    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
  });
});
