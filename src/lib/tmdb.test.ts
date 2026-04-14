import { getPosterUrl } from './tmdb';

describe('getPosterUrl', () => {
  it('returns correct URL for valid path and size', () => {
    expect(getPosterUrl('/abc.jpg', 'w300')).toBe('https://image.tmdb.org/t/p/w300/abc.jpg');
  });

  it('returns null for null path', () => {
    expect(getPosterUrl(null, 'w500')).toBeNull();
  });
});
