export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Falha no login";
    throw new Error(message);
  }
  return data as LoginResponse;
}
