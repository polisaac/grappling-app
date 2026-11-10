// Contrato de GET /api/users/me (backend F05). El historial (GET /api/users/me/logs) reutiliza
// FeedPage/FeedLog de "@/types/feed": es la misma forma que el feed.
export interface MyProfile {
  id: string;
  name: string;
  totalLogs: number;
}
