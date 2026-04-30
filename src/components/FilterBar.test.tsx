import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FilterBar from '@/components/FilterBar';
import { getGenres, discoverMovies, discoverSeries } from "@/lib/tmdb"


jest.mock('@/lib/tmdb', () => ({
  getGenres: jest.fn(),
  discoverMovies: jest.fn(),
  discoverSeries: jest.fn()
}));

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getGenres as jest.Mock).mockResolvedValue([]);
    (discoverMovies as jest.Mock).mockResolvedValue([]);
    (discoverSeries as jest.Mock).mockResolvedValue([]);
  });

  test('select movie and displaying Years', async () => {
  
    render(<FilterBar />);

    const btn = screen.getByText("🎬 Movies");
    
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByRole("option", {name: "All Years"})).toBeInTheDocument();
    });
  });

  test('select series and displaying Years', async () => {
  
    render(<FilterBar />);

    const btn = screen.getByText("📺 Series");
    
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByRole("option", {name: "All Years"})).toBeInTheDocument();
    });
  });

  test('select Series and displaying Years', async () => {
    (getGenres as jest.Mock).mockResolvedValue([
      {id: 1, name: "All Genres"},
    ]);
    render(<FilterBar />);

    const btn = screen.getByText("📺 Series");
    
    fireEvent.click(btn);
    const option = await screen.findByTestId("genre");
    expect(option).toBeInTheDocument();

  });

  test('select Series and displaying Years', async () => {
    (getGenres as jest.Mock).mockResolvedValue([
      {id: 1, name: "All Genres"},
    ]);
    render(<FilterBar />);

    const btn = screen.getByText("🎬 Movies");
    
    fireEvent.click(btn);
    const option = await screen.findByTestId("genre");
    expect(option).toBeInTheDocument();
  });

  test('reset button', async () => {
    (getGenres as jest.Mock).mockResolvedValue([
      {id: 1, name: "Action"},
    ]);

    render(<FilterBar />);

    fireEvent.click(screen.getByText("🎬 Movies"));

    const reset = await screen.findByTestId("reset");

    fireEvent.click(reset);

    expect(screen.queryByTestId("reset")).not.toBeInTheDocument();
  });

  test('select genre and get results', async () => {
    (getGenres as jest.Mock).mockResolvedValue([
      {id: 1, name: "Action"},
    ]);

    render(<FilterBar />);

    const btn = screen.getByText("🎬 Movies");
    fireEvent.click(btn);

    const dropdown = await screen.findAllByRole("combobox");
    const genre = dropdown[0];

    fireEvent.change(genre, {target: {value: "1"}});

    expect(screen.findByAltText("Sniper: No Nation"));
    expect(screen.findByAltText("Shelter"));

  });
});

