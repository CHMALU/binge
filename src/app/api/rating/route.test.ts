import { POST } from './route';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    rating: {
      upsert: jest.fn(),
    },
  },
}));

beforeAll(() => {
  const responseJson = (body: unknown, init?: ResponseInit) => ({
    status: init?.status ?? 200,
    json: async () => body,
  }) as Response;

  Object.defineProperty(globalThis, 'Response', {
    configurable: true,
    value: { json: responseJson } as typeof Response,
  });
});


function ratingRequest(body: unknown) {
  return {
    json: async () => body,
  } as Request;
}

describe('POST /api/rating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated users', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const response = await POST(ratingRequest({ tmdbId: 1, mediaType: 'movie', stars: 4 }));

    expect(response.status).toBe(401);
    expect(prisma.rating.upsert).not.toHaveBeenCalled();
  });

  it.each([
    { tmdbId: 0, mediaType: 'movie', stars: 4 },
    { tmdbId: 1.5, mediaType: 'movie', stars: 4 },
    { tmdbId: 1, mediaType: 'book', stars: 4 },
    { tmdbId: 1, mediaType: 'movie', stars: 0 },
    { tmdbId: 1, mediaType: 'movie', stars: 6 },
    { tmdbId: 1, mediaType: 'movie', stars: 3.5 },
  ])('rejects invalid input %#', async (body) => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1', email: 'a@b.com' } });

    const response = await POST(ratingRequest(body));

    expect(response.status).toBe(400);
    expect(prisma.rating.upsert).not.toHaveBeenCalled();
  });

  it('upserts a valid rating for the authenticated user', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1', email: 'a@b.com' } });
    (prisma.rating.upsert as jest.Mock).mockResolvedValue({});

    const response = await POST(ratingRequest({ tmdbId: 123, mediaType: 'tv', stars: 5 }));

    expect(response.status).toBe(200);
    expect(prisma.rating.upsert).toHaveBeenCalledWith({
      where: {
        userId_tmdbId_mediaType: {
          userId: 'user-1',
          tmdbId: 123,
          mediaType: 'tv',
        },
      },
      update: { stars: 5 },
      create: {
        userId: 'user-1',
        tmdbId: 123,
        mediaType: 'tv',
        stars: 5,
      },
    });
  });
});
