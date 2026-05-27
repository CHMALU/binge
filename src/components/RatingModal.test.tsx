import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RatingModal from '@/components/RatingModal';
import type { Dictionary } from '@/app/[lang]/dictionaries';

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
};

describe('RatingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('opens the rating dialog from the trigger button', async () => {
    render(<RatingModal tmdbId={1} mediaType="movie" title="Inception" dict={dict} />);

    await userEvent.click(screen.getByRole('button', { name: 'Rate this Movie' }));

    expect(screen.getByRole('heading', { name: 'Rate "Inception"' })).toBeInTheDocument();
    expect(screen.getByText('Select a rating')).toBeInTheDocument();
  });

  it('submits the selected rating to the rating endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RatingModal tmdbId={42} mediaType="tv" title="Breaking Bad" dict={dict} />);

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
});
