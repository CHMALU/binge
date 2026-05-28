import {
  getPosterUrl,
  getMovieDetails,
  getTvDetails,
  getPopularMovies,
  getPopularSeries,
  getNowPlaying,
  getOnAir,
  searchMovies,
  getGenres,
  discoverMovies,
  discoverSeries,
  getWatchProviders,
  getProvidersForLocale,
} from './tmdb';

function mockFetchOk(body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    statusText: 'OK',
    status: 200,
    json: async () => body,
  });
}

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

describe('list wrappers (popular/now-playing/on-air)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
  });

  it('getPopularMovies hits /movie/popular and passes locale language', async () => {
    mockFetchOk({ results: [{ id: 1, title: 'A', poster_path: '/a.jpg', vote_average: 7, overview: '' }] });

    const result = await getPopularMovies('pl');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/movie/popular');
    expect(calledUrl).toContain('language=pl-PL');
    expect(result[0].title).toBe('A');
  });

  it('getPopularMovies returns [] when results missing', async () => {
    mockFetchOk({});
    const result = await getPopularMovies('en');
    expect(result).toEqual([]);
  });

  it('getPopularSeries hits /tv/popular and stamps media_type=tv', async () => {
    mockFetchOk({ results: [{ id: 9, name: 'S', poster_path: null, vote_average: 6, overview: '' }] });

    const result = await getPopularSeries('en');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/tv/popular');
    expect(result[0].media_type).toBe('tv');
  });

  it('getNowPlaying hits /movie/now_playing with the locale language code', async () => {
    mockFetchOk({ results: [{ id: 2, title: 'N', poster_path: null, vote_average: 5, overview: '' }] });

    const result = await getNowPlaying('ar');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/movie/now_playing');
    expect(calledUrl).toContain('language=ar');
    expect(result).toHaveLength(1);
  });

  it('getOnAir hits /tv/on_the_air and stamps media_type=tv', async () => {
    mockFetchOk({ results: [{ id: 3, name: 'OnAir', poster_path: null, vote_average: 8, overview: '' }] });

    const result = await getOnAir('en');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/tv/on_the_air');
    expect(result[0].media_type).toBe('tv');
  });

  it('falls back to en-US for an unknown locale', async () => {
    mockFetchOk({ results: [] });

    await getPopularMovies('xx');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('language=en-US');
  });
});

describe('searchMovies', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
  });

  it('returns [] for a blank query and does not call fetch', async () => {
    global.fetch = jest.fn();
    const result = await searchMovies('   ');
    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('filters /search/multi results down to movie + tv', async () => {
    mockFetchOk({
      results: [
        { id: 1, media_type: 'movie', title: 'M', poster_path: null, vote_average: 6, overview: '' },
        { id: 2, media_type: 'person', name: 'P', poster_path: null, vote_average: 0, overview: '' },
        { id: 3, media_type: 'tv', name: 'S', poster_path: null, vote_average: 7, overview: '' },
      ],
    });

    const result = await searchMovies('q', 'en');

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.media_type).sort()).toEqual(['movie', 'tv']);
  });
});

describe('getGenres + discover wrappers', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
  });

  it('getGenres hits /genre/{type}/list and returns the genre array', async () => {
    mockFetchOk({ genres: [{ id: 28, name: 'Action' }] });

    const result = await getGenres('movie', 'pl');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/genre/movie/list');
    expect(result).toEqual([{ id: 28, name: 'Action' }]);
  });

  it('discoverMovies hits /discover/movie and forwards extra params', async () => {
    mockFetchOk({ results: [{ id: 1, title: 'D', poster_path: null, vote_average: 7, overview: '' }] });

    await discoverMovies({ with_genres: '28', sort_by: 'popularity.desc' }, 'en');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/discover/movie');
    expect(calledUrl).toContain('with_genres=28');
    expect(calledUrl).toContain('sort_by=popularity.desc');
  });

  it('discoverSeries hits /discover/tv and stamps media_type=tv', async () => {
    mockFetchOk({ results: [{ id: 4, name: 'X', poster_path: null, vote_average: 8, overview: '' }] });

    const result = await discoverSeries({ with_genres: '18' }, 'en');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/discover/tv');
    expect(result[0].media_type).toBe('tv');
  });
});

describe('watch providers', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
  });

  it('getWatchProviders returns the results map on success', async () => {
    mockFetchOk({ id: 550, results: { US: { flatrate: [] }, PL: { flatrate: [] } } });

    const result = await getWatchProviders('movie', 550);

    expect(result).toEqual({ US: { flatrate: [] }, PL: { flatrate: [] } });
  });

  it('getWatchProviders returns null when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('boom'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getWatchProviders('movie', 550);

    expect(result).toBeNull();
    spy.mockRestore();
  });

  it('getProvidersForLocale picks the country block matching the locale (pl → PL)', async () => {
    mockFetchOk({ id: 550, results: { US: { flatrate: [{ provider_id: 1, provider_name: 'A', logo_path: null }] }, PL: { flatrate: [{ provider_id: 9, provider_name: 'Netflix', logo_path: null }] } } });

    const result = await getProvidersForLocale('movie', 550, 'pl');

    expect(result?.flatrate?.[0].provider_name).toBe('Netflix');
  });

  it('getProvidersForLocale returns null when the locale has no providers', async () => {
    mockFetchOk({ id: 550, results: { US: { flatrate: [] } } });

    const result = await getProvidersForLocale('movie', 550, 'pl');

    expect(result).toBeNull();
  });

  it('getProvidersForLocale returns null when the upstream call fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('boom'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getProvidersForLocale('movie', 550, 'pl');

    expect(result).toBeNull();
    spy.mockRestore();
  });
});

describe('tmdbFetch error path', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
  });

  it('throws when TMDb returns a non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: async () => ({}),
    });

    await expect(getPopularMovies('en')).rejects.toThrow(/TMDb error: 500/);
  });

  it('throws when the API key is not configured', async () => {
    const saved = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    delete process.env.NEXT_PUBLIC_TMDB_API_KEY;
    global.fetch = jest.fn();

    await expect(getPopularMovies('en')).rejects.toThrow(/TMDB_API_KEY is not set/);

    process.env.NEXT_PUBLIC_TMDB_API_KEY = saved;
  });
});

describe('default-locale fallback (covers locale="en" default param)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
  });

  it('getPopularMovies() with no arg defaults to en-US', async () => {
    mockFetchOk({ results: [] });
    await getPopularMovies();
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('language=en-US');
  });

  it('getPopularSeries() with no arg defaults to en-US', async () => {
    mockFetchOk({ results: [] });
    await getPopularSeries();
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('language=en-US');
  });

  it('getProvidersForLocale falls back to en/US when locale unspecified', async () => {
    mockFetchOk({ id: 550, results: { US: { flatrate: [{ provider_id: 1, provider_name: 'A', logo_path: null }] } } });

    const result = await getProvidersForLocale('movie', 550);

    expect(result?.flatrate?.[0].provider_name).toBe('A');
  });

  it('getNowPlaying / getOnAir / searchMovies default to en-US locale', async () => {
    mockFetchOk({ results: [] });
    await getNowPlaying();
    await getOnAir();
    await searchMovies('q');

    const urls = (global.fetch as jest.Mock).mock.calls.map((c) => c[0] as string);
    expect(urls.every((u) => u.includes('language=en-US'))).toBe(true);
  });

  it('getGenres / discoverMovies / discoverSeries default to en-US locale and movie type', async () => {
    mockFetchOk({ genres: [], results: [] });
    await getGenres();
    await discoverMovies({});
    await discoverSeries({});

    const urls = (global.fetch as jest.Mock).mock.calls.map((c) => c[0] as string);
    expect(urls[0]).toContain('/genre/movie/list');
    expect(urls.every((u) => u.includes('language=en-US'))).toBe(true);
  });

  it('getMovieDetails / getTvDetails default to en-US locale', async () => {
    mockFetchOk({ id: 1, title: 'X', genres: [], vote_average: 0, overview: '', poster_path: null });
    await getMovieDetails(1);
    await getTvDetails(1);

    const urls = (global.fetch as jest.Mock).mock.calls.map((c) => c[0] as string);
    expect(urls.every((u) => u.includes('language=en-US'))).toBe(true);
  });
});
