import { render, screen } from '@testing-library/react';
import MovieDetail from '@/components/MovieDetail';
import { ProvidersCountry } from '@/lib/tmdb';

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
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const mockDict = {
  overview: 'Overview',
  availableOn: 'Available on',
  network: 'Network',
  createdBy: 'Created by',
  lastAired: 'Last aired',
  budget: 'Budget',
  revenue: 'Revenue',
  languages: 'Languages',
  status: 'Status',
  language: 'Language',
  votes: 'votes',
  viewOnIMDb: 'View on IMDb',
  officialSite: 'Official site',
  season: 'season',
  seasons: 'seasons',
  episode: 'ep.',
  ratingAriaLabel: '{stars} out of 5',
  rating: 'Rate this',
  movie: 'Movie',
  series: 'Series',
  rate: 'Rate',
  selectRating: 'Select a rating',
  cancel: 'Cancel',
  submit: 'Submit',
  saving: 'Saving...',
  error: 'Failed to submit rating. Please try again.',
  success: 'Rating submitted successfully!'
};

const mockCommonDict = {
  back: 'Back',
  close: 'Close',
  noTitle: 'No title',
  noPoster: 'No poster',
  notAvailable: 'N/A',
};

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
      render(<MovieDetail detail={mockMovie} lang="en" dict={mockDict} commonDict={mockCommonDict} />);
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

    it('renders streaming providers when provided and deduplicates duplicates', () => {
      const providers = {
        link: 'https://www.themoviedb.org/movie/1/watch?locale=US',
        flatrate: [
          { provider_id: 8, provider_name: 'Netflix', logo_path: '/nf.png' },
          { provider_id: 3, provider_name: 'HBO Max', logo_path: '/hbo.png' },
        ],
        rent: [
          { provider_id: 8, provider_name: 'Netflix', logo_path: '/nf.png' }, // duplicate on purpose
          { provider_id: 192, provider_name: 'Apple TV+', logo_path: '/apple.png' },
        ],
        buy: [
          { provider_id: 192, provider_name: 'Apple TV+', logo_path: '/apple.png' }, // duplicate
        ],
      } satisfies ProvidersCountry;

      render(<MovieDetail detail={mockMovie} lang="en" dict={mockDict} commonDict={mockCommonDict} providers={providers} />);

      // logos should be present
      expect(screen.getByAltText('Netflix')).toBeInTheDocument();
      expect(screen.getByAltText('HBO Max')).toBeInTheDocument();
      expect(screen.getByAltText('Apple TV+')).toBeInTheDocument();

      // duplicates should be deduped (Netflix appears twice in source, but only once rendered)
      const netflixImgs = screen.getAllByAltText('Netflix');
      expect(netflixImgs.length).toBe(1);

      // provider anchors should link to the TMDb country page
      const anchor = screen.getByAltText('Netflix').closest('a') as HTMLAnchorElement;
      expect(anchor).toHaveAttribute('href', providers.link);
    });
  });

  describe('tv series', () => {
    beforeEach(() => {
      render(<MovieDetail detail={mockTv} lang="en" dict={mockDict} commonDict={mockCommonDict} />);
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
