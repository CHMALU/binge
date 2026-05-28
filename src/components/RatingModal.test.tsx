import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RatingModal from '@/components/RatingModal';
import type { Dictionary } from '@/app/[lang]/dictionaries';

jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});

type DetailDict = Dictionary['detail'];

const dict: DetailDict = {
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
  rating: 'Rate this',
  movie: 'Movie',
  series: 'Series',
  rate: 'Rate',
  selectRating: 'Select a rating',
  cancel: 'Cancel',
  submit: 'Submit',
  saving: 'Saving...',
  error: 'Failed to submit rating. Please try again.',
  success: 'Rating submitted successfully!',
  ratingAriaLabel: '{stars} out of 5',
  signInToRate: 'Sign in to rate',
  markWatched: 'Mark as watched',
  howWouldYouRate: 'How would you rate it?',
  skipRating: 'Skip rating',
};

describe('RatingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('opens the rating dialog from the trigger button', async () => {
    render(
      <RatingModal
        tmdbId={1}
        mediaType="movie"
        title="Inception"
        dict={dict}
        isAuthed={true}
        lang="en"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Rate this Movie' }));

    expect(screen.getByRole('heading', { name: 'Rate "Inception"' })).toBeInTheDocument();
    expect(screen.getByText('Select a rating')).toBeInTheDocument();
  });

  it('submits the selected rating to the rating endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <RatingModal
        tmdbId={42}
        mediaType="tv"
        title="Breaking Bad"
        dict={dict}
        isAuthed={true}
        lang="en"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Rate this Series' }));
    await userEvent.click(screen.getByRole('button', { name: 'Rate 4 stars' }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/rating',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdbId: 42, mediaType: 'tv', stars: 4 }),
        }),
      );
    });
  });

  it('renders a sign-in link instead of the trigger when the user is not authenticated', () => {
    render(
      <RatingModal
        tmdbId={1}
        mediaType="movie"
        title="Inception"
        dict={dict}
        isAuthed={false}
        lang="en"
      />
    );

    const link = screen.getByRole('link', { name: /sign in to rate/i });
    expect(link).toHaveAttribute('href', '/en/login');
    expect(screen.queryByRole('button', { name: /rate this movie/i })).not.toBeInTheDocument();
  });

  it('respects the locale in the sign-in link', () => {
    render(
      <RatingModal
        tmdbId={1}
        mediaType="movie"
        title="Inception"
        dict={dict}
        isAuthed={false}
        lang="ar"
      />
    );

    const link = screen.getByRole('link', { name: /sign in to rate/i });
    expect(link).toHaveAttribute('href', '/ar/login');
  });
});
