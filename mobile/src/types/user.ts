// Contratos de GET /api/users/:id y POST/DELETE /api/users/:id/follow (backend F06).

export interface PublicProfile {
  id: string;
  name: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean; // ¿el usuario autenticado sigue a este usuario?
}

export interface FollowState {
  isFollowing: boolean;
  followersCount: number;
}
