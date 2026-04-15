import { render, screen } from '@testing-library/react';
import MovieCard from '@/components/MovieCard';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  );
});

const mockMovie = {
  id: 1,
  title: 'Inception',
  poster_path: '/test.jpg',
  vote_average: 8.8,
  release_date: '2010-07-16',
  overview: 'A mind-bending thriller.',
};

const mockTv = {
  id: 42,
  name: 'Breaking Bad',
  poster_path: '/bb.jpg',
  vote_average: 9.5,
  first_air_date: '2008-01-20',
  overview: 'Chemistry teacher turns cook.',
  media_type: 'tv' as const,
};

describe('MovieCard', () => {
  it('renders the movie title', () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('links to the movie detail page', () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/movie/1');
  });

  it('links to the tv detail page when media_type is tv', () => {
    render(<MovieCard movie={mockTv} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tv/42');
  });
});
