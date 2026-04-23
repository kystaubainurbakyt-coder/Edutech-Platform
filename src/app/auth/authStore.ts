import type { User } from "../data/mockData";
import { apiRequest } from "../lib/api";

type StoredUser = Partial<User> & {
  id?: string | number;
  username?: string;
  name?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
};

export type CurrentUser = {
  id?: string | number;
  username: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  role: "user";
};

const CURRENT_USER_KEY = "currentUser";
const ADMIN_AUTH_KEY = "adminAuth";

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function readAllUsers(): Promise<StoredUser[]> {
  const response = await apiRequest<{ users: StoredUser[] }>("/users");
  return response.users;
}

export function getCurrentUser(): CurrentUser | null {
  const current = safeParseJson<CurrentUser>(localStorage.getItem(CURRENT_USER_KEY));
  if (!current) return null;
  if (current.role !== "user") return null;
  if (!current.username) return null;
  return current;
}

export function setCurrentUser(user: CurrentUser | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export async function loginUser(identifier: string, password: string): Promise<CurrentUser> {
  const response = await apiRequest<{ user: CurrentUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  setCurrentUser(response.user);
  return response.user;
}

export async function registerUser(user: {
  username: string;
  phone: string;
  email: string;
  password: string;
}): Promise<CurrentUser> {
  const response = await apiRequest<{ user: CurrentUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(user),
  });
  setCurrentUser(response.user);
  return response.user;
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function isAdminAuthed(): boolean {
  return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export async function loginAdmin(password: string): Promise<boolean> {
  await apiRequest<{ ok: boolean }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  localStorage.setItem(ADMIN_AUTH_KEY, "true");
  return true;
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}
