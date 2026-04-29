import { render, screen } from '@testing-library/react';
import MovieDetail from '@/components/MovieDetail';
import Image from 'next/image';

jest.mock('next/link', () => {
  // FIX: named const → React kann displayName ableiten
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/image', () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => (
    <Image src={src} alt={alt} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const mockMovie = {
  id: 1,
  title: 'Inception',
  overview: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
  runtime: 148,
  genres: [
    { id: 28, name: 'Action' },
    { id: 878, name: 'Science Fiction' },
  ],
  vote_average: 8.8,
  release_date: '2010-07-16',
  poster_path: '/test.jpg',
  media_type: 'movie' as const,
};

const mockTv = {
  id: 2,
  name: 'Breaking Bad',
  overview: 'A high school chemistry teacher turned drug dealer.',
  episode_run_time: [45],
  genres: [{ id: 18, name: 'Drama' }],
  vote_average: 9.5,
  first_air_date: '2008-01-20',
  poster_path: '/bb.jpg',
  media_type: 'tv' as const,
};

describe('MovieDetail', () => {
  describe('movie', () => {
    beforeEach(() => {
      render(<MovieDetail detail={mockMovie} />);
    });

    it('renders the title', () => {
      expect(screen.getByRole('heading', { name: 'Inception' })).toBeInTheDocument();
    });

    it('renders the overview/description', () => {
      expect(
        screen.getByText('A thief who steals corporate secrets through the use of dream-sharing technology.')
      ).toBeInTheDocument();
    });

    it('renders the runtime', () => {
      expect(screen.getByText('148 min')).toBeInTheDocument();
    });

    it('renders all genres', () => {
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    });

    it('renders the rating', () => {
      expect(screen.getByText('8.8')).toBeInTheDocument();
    });

    it('renders the release year', () => {
      expect(screen.getByText('2010')).toBeInTheDocument();
    });

    it('renders a back link for navigation', () => {
      expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument();
    });
  });

  describe('tv series', () => {
    beforeEach(() => {
      render(<MovieDetail detail={mockTv} />);
    });

    it('renders the series name', () => {
      expect(screen.getByRole('heading', { name: 'Breaking Bad' })).toBeInTheDocument();
    });

    it('renders the episode runtime', () => {
      expect(screen.getByText('45 min')).toBeInTheDocument();
    });

    it('renders the first air year', () => {
      expect(screen.getByText('2008')).toBeInTheDocument();
    });
  });
});
