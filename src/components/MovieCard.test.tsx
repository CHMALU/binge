// ...existing code...
import { render, screen } from '@testing-library/react';
import MovieCard from '@/components/MovieCard';

describe('MovieCard', () => {
  it('renders the movie title', () => {
    const mockMovie = {
      id: 1,
      title: 'Inception',
      poster_path: '/test.jpg',
      vote_average: 8.8,
      release_date: '2010-07-16',
      overview: 'A mind-bending thriller.'
    };
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });
});
