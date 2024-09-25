export interface SaveRefreshTokenPayload {
  id: number;
  refreshToken: string;
}

export interface SaveFerfeshTokenResponse {
  id: number;
  token: string;
  user_id: string;
}
