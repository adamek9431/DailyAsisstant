const API_URL = "https://undividedly-plicate-lien.ngrok-free.dev/api";

export interface User {
  id: number;
  email: string;
  name?: string;
  avatar_url?: string;
  google_id?: string;
}

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface ListShare {
  user_id: number;
  email: string;
  name?: string;
  shared_at: string;
}

export interface ShareListResponse {
  message: string;
  share: ListShare;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class ApiService {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem("token");
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        }
      : {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        };
  }

  async register(email: string, password: string): Promise<{ message: string; user_id: number }> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Błąd rejestracji");
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Błąd logowania");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  }

  async loginWithGoogle(credential: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/google/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Błąd logowania przez Google");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  }

  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Błąd pobierania zadań");
    }

    return response.json();
  }

  async createTask(title: string): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error("Błąd dodawania zadania");
    }

    return response.json();
  }

  async updateTask(taskId: number, data: { title?: string; completed?: boolean }): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Błąd aktualizacji zadania");
    }

    return response.json();
  }

  async deleteTask(taskId: number): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Błąd usuwania zadania");
    }
  }

  // Shopping List Sharing API
  async shareList(listId: number, userEmail: string): Promise<ShareListResponse> {
    const response = await fetch(`${API_URL}/shopping-lists/${listId}/share`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ user_email: userEmail }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Błąd udostępniania listy");
    }

    return response.json();
  }

  async getListShares(listId: number): Promise<ListShare[]> {
    const response = await fetch(`${API_URL}/shopping-lists/${listId}/shares`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Błąd pobierania listy udostępnień");
    }

    return response.json();
  }

  async removeListShare(listId: number, userId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/shopping-lists/${listId}/shares/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Błąd usuwania udostępnienia");
    }

    return response.json();
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }
}

export const api = new ApiService();