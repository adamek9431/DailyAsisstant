const API_URL = "https://undividedly-plicate-lien.ngrok-free.dev/api";

export interface User {
  id: number;
  email: string;
  name?: string;
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

export interface ShoppingListItem {
  id: number;
  list_id: number;
  name: string;
  quantity?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
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

  // User Profile API
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Błąd pobierania profilu użytkownika");
    }

    return response.json();
  }

  // Shopping List API
  async getDefaultShoppingList(): Promise<{ id: number; name: string; owner_id: number }> {
    console.log('Getting default shopping list...');
    
    const response = await fetch(`${API_URL}/shopping-lists/default`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      console.error('Failed to get default list:', response.status);
      throw new Error("Błąd pobierania listy zakupów");
    }

    const list = await response.json();
    console.log('Got shopping list:', list);
    return list;
  }

  async getAllAccessibleLists(): Promise<Array<{ id: number; name: string; owner_id: number; is_owner: boolean }>> {
    const response = await fetch(`${API_URL}/shopping-lists`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Błąd pobierania list zakupów");
    }

    return response.json();
  }

  async searchUsers(query?: string): Promise<User[]> {
    const url = query 
      ? `${API_URL}/users/search?q=${encodeURIComponent(query)}`
      : `${API_URL}/users`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Błąd wyszukiwania użytkowników");
    }

    return response.json();
  }

  // Shopping List Sharing API
  async shareList(listId: number, userId: number): Promise<ShareListResponse> {
    console.log('Sharing list:', { listId, userId, url: `${API_URL}/shopping-lists/${listId}/share` });
    
    const response = await fetch(`${API_URL}/shopping-lists/${listId}/share`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      let error: any = {};
      try {
        error = await response.json();
      } catch (e) {
        error = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      // Loguj szczegóły błędu dla debugowania
      console.error('Share list error:', {
        status: response.status,
        statusText: response.statusText,
        error: error,
        userId: userId,
        listId: listId,
        fullUrl: `${API_URL}/shopping-lists/${listId}/share`
      });
      
      // Obsługa różnych kodów błędów
      if (response.status === 404) {
        if (error.detail && error.detail.includes('Lista')) {
          throw new Error("Lista zakupów nie została znaleziona. Upewnij się, że lista istnieje.");
        } else if (error.detail && error.detail.includes('Użytkownik')) {
          throw new Error(error.detail);
        } else {
          throw new Error("Lista zakupów nie została znaleziona lub endpoint nie istnieje");
        }
      } else if (response.status === 400) {
        throw new Error(error.detail || "Nieprawidłowe dane");
      } else if (response.status === 409) {
        throw new Error("Lista jest już udostępniona temu użytkownikowi");
      }
      
      throw new Error(error.detail || `Błąd ${response.status}: ${response.statusText}`);
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

  // Shopping List Items API
  async getShoppingListItems(listId: number): Promise<ShoppingListItem[]> {
    const response = await fetch(`${API_URL}/shopping-lists/${listId}/items`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Błąd pobierania produktów z listy");
    }

    return response.json();
  }

  async createShoppingListItem(
    listId: number, 
    name: string, 
    quantity?: string
  ): Promise<ShoppingListItem> {
    console.log('Creating item:', { listId, name, quantity });
    
    const response = await fetch(`${API_URL}/shopping-lists/${listId}/items`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ name, quantity }),
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch (e) {
        errorDetails = { detail: response.statusText };
      }
      console.error('Create item error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails,
        url: `${API_URL}/shopping-lists/${listId}/items`
      });
      throw new Error(errorDetails.detail || "Błąd dodawania produktu");
    }

    return response.json();
  }

  async updateShoppingListItem(
    listId: number,
    itemId: number,
    data: { name?: string; quantity?: string; completed?: boolean }
  ): Promise<ShoppingListItem> {
    const response = await fetch(`${API_URL}/shopping-lists/${listId}/items/${itemId}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Błąd aktualizacji produktu");
    }

    return response.json();
  }

  async deleteShoppingListItem(listId: number, itemId: number): Promise<void> {
    const response = await fetch(`${API_URL}/shopping-lists/${listId}/items/${itemId}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Błąd usuwania produktu");
    }
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