import { searchMovies } from "@/lib/tmdb";
import { render, screen, fireEvent } from "@testing-library/react"
import SearchBar from "@/components/SearchBar";

jest.mock("@/lib/tmdb", () => ({
  searchMovies: jest.fn(),
}));

const mockCommonDict = {
  back: 'Back',
  close: 'Close',
  noTitle: 'No title',
  noPoster: 'No poster',
  notAvailable: 'N/A',
};
const PLACEHOLDER = "Search movies & series...";

describe('Searchbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('render input field', () => {
    render(<SearchBar placeholder={PLACEHOLDER} commonDict={mockCommonDict} />);
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
  });

  test('input field', () => {
    render(<SearchBar placeholder={PLACEHOLDER} commonDict={mockCommonDict} />)
    const input_field = screen.getByPlaceholderText(PLACEHOLDER);
    fireEvent.change(input_field, { target: { value: "Mario" }})

    expect(input_field).toHaveValue("Mario");
  });

  test('displayed books', async () => {
    (searchMovies as jest.Mock).mockResolvedValue([
      {id: 1, title: "The Rookie"},
      {id: 2, title: "Rookie"}
    ]);

    render(<SearchBar placeholder={PLACEHOLDER} commonDict={mockCommonDict} />)
    const input_field = screen.getByPlaceholderText(PLACEHOLDER);
    fireEvent.change(input_field, { target: { value: "Rookie" }})

    expect(screen.findByAltText("The Rookie"));
    expect(screen.findByAltText("Rookie"));

  });


});