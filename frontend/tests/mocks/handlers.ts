import { http, HttpResponse } from "msw";

const BASE = "/api/v1";

const mockUser = { id: "user-1", email: "test@example.com", username: "testuser", date_joined: "2024-01-01T00:00:00Z" };
const mockTokens = { access: "mock-access-token", refresh: "mock-refresh-token" };
const mockTag = { id: "tag-1", name: "Work", color: "#3B82F6", created_at: "2024-01-01T00:00:00Z" };
const mockEntry = {
  id: "entry-1",
  title: "My First Entry",
  body: "Hello **world**",
  body_preview: "Hello world",
  mood: "happy",
  is_favorite: false,
  tags: [mockTag],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const handlers = [
  http.post(`${BASE}/auth/login/`, () =>
    HttpResponse.json(mockTokens)
  ),
  http.post(`${BASE}/auth/register/`, () =>
    HttpResponse.json({ ...mockTokens, user: mockUser }, { status: 201 })
  ),
  http.post(`${BASE}/auth/logout/`, () =>
    new HttpResponse(null, { status: 204 })
  ),
  http.post(`${BASE}/auth/refresh/`, () =>
    HttpResponse.json({ access: "new-access-token", refresh: "new-refresh-token" })
  ),
  http.get(`${BASE}/auth/me/`, () =>
    HttpResponse.json(mockUser)
  ),
  http.get(`${BASE}/entries/`, () =>
    HttpResponse.json({ count: 1, next: null, previous: null, results: [mockEntry] })
  ),
  http.get(`${BASE}/entries/:id`, ({ params }) => {
    if (params.id === "entry-1") return HttpResponse.json(mockEntry);
    return new HttpResponse(null, { status: 404 });
  }),
  http.post(`${BASE}/entries/`, () =>
    HttpResponse.json(mockEntry, { status: 201 })
  ),
  http.patch(`${BASE}/entries/:id`, () =>
    HttpResponse.json(mockEntry)
  ),
  http.delete(`${BASE}/entries/:id`, () =>
    new HttpResponse(null, { status: 204 })
  ),
  http.get(`${BASE}/tags/`, () =>
    HttpResponse.json({ count: 1, next: null, previous: null, results: [mockTag] })
  ),
  http.post(`${BASE}/tags/`, () =>
    HttpResponse.json(mockTag, { status: 201 })
  ),
];
