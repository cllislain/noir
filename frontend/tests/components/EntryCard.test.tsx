import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EntryCard } from "@/features/entries/EntryCard";
import type { Entry } from "@/types";

const mockEntry: Entry = {
  id: "entry-1",
  title: "Test Entry",
  body: "Hello world",
  body_preview: "Hello world",
  mood: "happy",
  is_favorite: true,
  tags: [{ id: "tag-1", name: "Work", color: "#3B82F6", created_at: "2024-01-01T00:00:00Z" }],
  created_at: "2024-06-01T12:00:00Z",
  updated_at: "2024-06-01T12:00:00Z",
};

function renderCard() {
  return render(
    <MemoryRouter>
      <EntryCard entry={mockEntry} />
    </MemoryRouter>
  );
}

describe("EntryCard", () => {
  it("renders title", () => {
    renderCard();
    expect(screen.getByText("Test Entry")).toBeInTheDocument();
  });

  it("renders body preview", () => {
    renderCard();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("shows favorite indicator", () => {
    renderCard();
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("shows tag badge", () => {
    renderCard();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("links to entry detail", () => {
    renderCard();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/entries/entry-1");
  });
});
