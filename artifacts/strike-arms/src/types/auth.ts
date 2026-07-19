/** Public user shape exposed to the app (never includes credentials). */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  marketingOptIn: boolean;
  createdAt: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  marketingOptIn: boolean;
  /** GDPR digital-consent age (16+ in Ireland). Airsoft sale-age is checked at checkout. */
  ageConfirmed: boolean;
}

export interface ProfilePatch {
  fullName?: string;
  phone?: string;
  marketingOptIn?: boolean;
}

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };
