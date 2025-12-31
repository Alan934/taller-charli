export interface UserProfile {
  id: number;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: UserProfile;
}
