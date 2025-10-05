export interface JWTTokenContent {
  id: string;
  refreshToken?: string;
  duration?: number;
}
