import { searchMovies } from "@/lib/tmdb";
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import SearchBar from "@/components/SearchBar";
import { title } from "process";

jest.mock("@/lib/tmdb", () => ({
  searchMovies: jest.fn(),
}));

describe('Searchbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('render input field', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText("Search movies & series...")).toBeInTheDocument();
  });

  test('input field', () => {
    render(<SearchBar />)
    const input_field = screen.getByPlaceholderText("Search movies & series...");
    fireEvent.change(input_field, { target: { value: "Mario" }})

    expect(input_field).toHaveValue("Mario");
  });

  test('displayed books', async () => {
    (searchMovies as jest.Mock).mockResolvedValue([
      {id: 1, title: "The Rookie"},
      {id: 2, title: "Rookie"}
    ]);

    render(<SearchBar />)
    const input_field = screen.getByPlaceholderText("Search movies & series...");
    fireEvent.change(input_field, { target: { value: "Rookie" }})

    expect(screen.findByAltText("The Rookie"));
    expect(screen.findByAltText("Rookie"));

  });


});