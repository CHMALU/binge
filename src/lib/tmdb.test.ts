import { getPosterUrl, getMovieDetails, getTvDetails } from './tmdb';

describe('getPosterUrl', () => {
  it('returns correct URL for valid path and size', () => {
    expect(getPosterUrl('/abc.jpg', 'w300')).toBe('https://image.tmdb.org/t/p/w300/abc.jpg');
  });

  it('returns null for null path', () => {
    expect(getPosterUrl(null, 'w500')).toBeNull();
  });
});

describe('getMovieDetails', () => {
  const mockResponse = {
    id: 550,
    title: 'Fight Club',
    overview: 'An insomniac office worker forms an underground fight club.',
    runtime: 139,
    genres: [{ id: 18, name: 'Drama' }],
    vote_average: 8.4,
    release_date: '1999-10-15',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
  });

  it('calls the correct TMDb endpoint', async () => {
    await getMovieDetails(550);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/movie/550'),
      expect.any(Object)
    );
  });

  it('returns movie detail data with runtime and genres', async () => {
    const result = await getMovieDetails(550);
    expect(result.title).toBe('Fight Club');
    expect(result.runtime).toBe(139);
    expect(result.genres).toEqual([{ id: 18, name: 'Drama' }]);
    expect(result.release_date).toBe('1999-10-15');
  });
});

describe('getTvDetails', () => {
  const mockResponse = {
    id: 1396,
    name: 'Breaking Bad',
    overview: 'A high school chemistry teacher turned drug dealer.',
    episode_run_time: [45],
    genres: [{ id: 18, name: 'Drama' }],
    vote_average: 9.5,
    first_air_date: '2008-01-20',
    poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
  });

  it('calls the correct TMDb endpoint', async () => {
    await getTvDetails(1396);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tv/1396'),
      expect.any(Object)
    );
  });

  it('returns tv detail data with episode_run_time and genres', async () => {
    const result = await getTvDetails(1396);
    expect(result.name).toBe('Breaking Bad');
    expect(result.episode_run_time).toEqual([45]);
    expect(result.genres).toEqual([{ id: 18, name: 'Drama' }]);
    expect(result.first_air_date).toBe('2008-01-20');
  });
});
