import { Task, User } from "./api";

export interface ShoppingItem {
  id: number;
  name: string;
  quantity?: string;
  completed: boolean;
  created_at: string;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  category: string;
  commonQuantities?: string[];
  icon?: string;
  starred?: boolean;
}

export interface MockListShare {
  user_id: number;
  email: string;
  name?: string;
  shared_at: string;
}

const DEMO_USER: User = {
  id: 1,
  email: "demo@example.com",
};

const DEMO_TASKS_KEY = "demo_tasks";
const DEMO_SHOPPING_KEY = "demo_shopping";
const DEMO_USER_KEY = "demo_user";
const DEMO_MODE_KEY = "demo_mode";
const STARRED_PRODUCTS_KEY = "starred_products";
const LIST_SHARES_KEY = "demo_list_shares";

// Początkowe przykładowe zadania
const getInitialTasks = (): Task[] => [
  {
    id: 1,
    title: "Przygotować prezentację na zebranie",
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Zrobić zakupy spożywcze",
    completed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Przeczytać dokumentację nowego projektu",
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Umówić wizytę u dentysty",
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: "Odpowiedzieć na e-maile",
    completed: true,
    created_at: new Date().toISOString(),
  },
];

const getInitialShoppingItems = (): ShoppingItem[] => [
  {
    id: 1,
    name: "Mleko",
    quantity: "2 litry",
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Chleb",
    quantity: "1 szt",
    completed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Jajka",
    quantity: "10 szt",
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Ser żółty",
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Pomidory",
    quantity: "0.5 kg",
    completed: false,
    created_at: new Date().toISOString(),
  },
];

const PRODUCT_SUGGESTIONS: ProductSuggestion[] = [
  // Nabiał
  { id: "mleko", name: "Mleko", category: "Nabiał", commonQuantities: ["1 l", "2 l", "3 l"] },
  { id: "maslo", name: "Masło", category: "Nabiał", commonQuantities: ["1 szt", "2 szt"] },
  { id: "ser-zolty", name: "Ser żółty", category: "Nabiał", commonQuantities: ["0.25 kg", "0.5 kg"] },
  { id: "jogurt", name: "Jogurt naturalny", category: "Nabiał", commonQuantities: ["1 szt", "2 szt"] },
  { id: "smietana", name: "Śmietana", category: "Nabiał", commonQuantities: ["1 szt", "2 szt"] },
  { id: "twarog", name: "Twaróg", category: "Nabiał", commonQuantities: ["0.25 kg", "0.5 kg"] },
  
  // Pieczywo
  { id: "chleb", name: "Chleb", category: "Pieczywo", commonQuantities: ["1 szt", "2 szt"] },
  { id: "bulki", name: "Bułki", category: "Pieczywo", commonQuantities: ["4 szt", "6 szt", "10 szt"] },
  { id: "bagietka", name: "Bagietka", category: "Pieczywo", commonQuantities: ["1 szt", "2 szt"] },
  
  // Mięso i wędliny
  { id: "kurczak", name: "Pierś z kurczaka", category: "Mięso", commonQuantities: ["0.5 kg", "1 kg"] },
  { id: "mielone", name: "Mięso mielone", category: "Mięso", commonQuantities: ["0.5 kg", "1 kg"] },
  { id: "szynka", name: "Szynka", category: "Wędliny", commonQuantities: ["0.2 kg", "0.3 kg"] },
  { id: "kielbasa", name: "Kiełbasa", category: "Wędliny", commonQuantities: ["0.3 kg", "0.5 kg"] },
  
  // Warzywa
  { id: "pomidory", name: "Pomidory", category: "Warzywa", commonQuantities: ["0.5 kg", "1 kg"] },
  { id: "ogorki", name: "Ogórki", category: "Warzywa", commonQuantities: ["3 szt", "5 szt"] },
  { id: "papryka", name: "Papryka", category: "Warzywa", commonQuantities: ["2 szt", "3 szt"] },
  { id: "cebula", name: "Cebula", category: "Warzywa", commonQuantities: ["1 kg", "2 kg"] },
  { id: "czosnek", name: "Czosnek", category: "Warzywa", commonQuantities: ["1 szt", "2 szt"] },
  { id: "ziemniaki", name: "Ziemniaki", category: "Warzywa", commonQuantities: ["2 kg", "5 kg"] },
  { id: "marchew", name: "Marchew", category: "Warzywa", commonQuantities: ["0.5 kg", "1 kg"] },
  { id: "salata", name: "Sałata", category: "Warzywa", commonQuantities: ["1 szt", "2 szt"] },
  
  // Owoce
  { id: "jablka", name: "Jabłka", category: "Owoce", commonQuantities: ["1 kg", "2 kg"] },
  { id: "banany", name: "Banany", category: "Owoce", commonQuantities: ["1 kg", "1.5 kg"] },
  { id: "pomarancze", name: "Pomarańcze", category: "Owoce", commonQuantities: ["1 kg", "2 kg"] },
  { id: "cytryny", name: "Cytryny", category: "Owoce", commonQuantities: ["3 szt", "5 szt"] },
  
  // Podstawowe produkty
  { id: "jajka", name: "Jajka", category: "Podstawowe", commonQuantities: ["6 szt", "10 szt", "20 szt"] },
  { id: "ryz", name: "Ryż", category: "Podstawowe", commonQuantities: ["1 szt", "2 szt"] },
  { id: "makaron", name: "Makaron", category: "Podstawowe", commonQuantities: ["1 szt", "2 szt"] },
  { id: "maka", name: "Mąka", category: "Podstawowe", commonQuantities: ["1 szt", "2 szt"] },
  { id: "cukier", name: "Cukier", category: "Podstawowe", commonQuantities: ["1 kg", "2 kg"] },
  { id: "sol", name: "Sól", category: "Podstawowe", commonQuantities: ["0.5 kg", "1 kg"] },
  { id: "olej", name: "Olej", category: "Podstawowe", commonQuantities: ["1 szt", "2 szt"] },
  
  // Napoje
  { id: "woda", name: "Woda mineralna", category: "Napoje", commonQuantities: ["1.5 l", "5 l", "6 szt"] },
  { id: "sok", name: "Sok owocowy", category: "Napoje", commonQuantities: ["1 l", "2 l"] },
  { id: "kawa", name: "Kawa", category: "Napoje", commonQuantities: ["1 szt", "2 szt"] },
  { id: "herbata", name: "Herbata", category: "Napoje", commonQuantities: ["1 szt", "2 szt"] },
];

class MockApiService {
  private getNextId(): number {
    const tasks = this.getTasks();
    return tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  }

  private getNextShoppingId(): number {
    const items = this.getShoppingItems();
    return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
  }

  loginDemo(): User {
    localStorage.setItem(DEMO_MODE_KEY, "true");
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEMO_USER));
    
    // Załaduj początkowe zadania jeśli nie istnieją
    const existingTasks = localStorage.getItem(DEMO_TASKS_KEY);
    if (!existingTasks) {
      localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(getInitialTasks()));
    }
    
    // Załaduj początkowe przedmioty zakupowe jeśli nie istnieją
    const existingShoppingItems = localStorage.getItem(DEMO_SHOPPING_KEY);
    if (!existingShoppingItems) {
      localStorage.setItem(DEMO_SHOPPING_KEY, JSON.stringify(getInitialShoppingItems()));
    }
    
    return DEMO_USER;
  }

  getTasks(): Task[] {
    const tasksJson = localStorage.getItem(DEMO_TASKS_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  }

  createTask(title: string): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      id: this.getNextId(),
      title,
      completed: false,
      created_at: new Date().toISOString(),
    };
    tasks.push(newTask);
    localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(tasks));
    return newTask;
  }

  updateTask(taskId: number, data: { title?: string; completed?: boolean }): Task {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error("Zadanie nie znalezione");
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...data };
    localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(tasks));
    return tasks[taskIndex];
  }

  deleteTask(taskId: number): void {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter((t) => t.id !== taskId);
    localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(filteredTasks));
  }

  getShoppingItems(): ShoppingItem[] {
    const itemsJson = localStorage.getItem(DEMO_SHOPPING_KEY);
    return itemsJson ? JSON.parse(itemsJson) : [];
  }

  createShoppingItem(name: string, quantity?: string): ShoppingItem {
    const items = this.getShoppingItems();
    const newItem: ShoppingItem = {
      id: this.getNextShoppingId(),
      name,
      quantity,
      completed: false,
      created_at: new Date().toISOString(),
    };
    items.push(newItem);
    localStorage.setItem(DEMO_SHOPPING_KEY, JSON.stringify(items));
    return newItem;
  }

  updateShoppingItem(itemId: number, data: { name?: string; quantity?: string; completed?: boolean }): ShoppingItem {
    const items = this.getShoppingItems();
    const itemIndex = items.findIndex((i) => i.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error("Przedmiot nie znaleziony");
    }

    items[itemIndex] = { ...items[itemIndex], ...data };
    localStorage.setItem(DEMO_SHOPPING_KEY, JSON.stringify(items));
    return items[itemIndex];
  }

  deleteShoppingItem(itemId: number): void {
    const items = this.getShoppingItems();
    const filteredItems = items.filter((i) => i.id !== itemId);
    localStorage.setItem(DEMO_SHOPPING_KEY, JSON.stringify(filteredItems));
  }

  logout(): void {
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(DEMO_USER_KEY);
    localStorage.removeItem(DEMO_TASKS_KEY);
    localStorage.removeItem(DEMO_SHOPPING_KEY);
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(DEMO_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(DEMO_MODE_KEY) === "true";
  }

  isDemoMode(): boolean {
    return localStorage.getItem(DEMO_MODE_KEY) === "true";
  }

  getProductSuggestions(searchQuery?: string): ProductSuggestion[] {
    const starred = this.getStarredProducts();
    let suggestions = PRODUCT_SUGGESTIONS.map(product => ({
      ...product,
      starred: starred.includes(product.id),
      icon: this.getCategoryIcon(product.category)
    }));
    
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      suggestions = suggestions.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }
    
    return suggestions;
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      "Nabiał": "milk",
      "Pieczywo": "wheat",
      "Mięso": "beef",
      "Wędliny": "drumstick",
      "Warzywa": "carrot",
      "Owoce": "apple",
      "Podstawowe": "package",
      "Napoje": "coffee"
    };
    return iconMap[category] || "shopping-bag";
  }

  getStarredProducts(): string[] {
    const starred = localStorage.getItem(STARRED_PRODUCTS_KEY);
    return starred ? JSON.parse(starred) : [];
  }

  toggleStarProduct(productId: string): void {
    const starred = this.getStarredProducts();
    const index = starred.indexOf(productId);
    
    if (index > -1) {
      starred.splice(index, 1);
    } else {
      starred.push(productId);
    }
    
    localStorage.setItem(STARRED_PRODUCTS_KEY, JSON.stringify(starred));
  }

  getListShares(): MockListShare[] {
    const sharesJson = localStorage.getItem(LIST_SHARES_KEY);
    return sharesJson ? JSON.parse(sharesJson) : [];
  }

  createListShare(email: string, name?: string): MockListShare {
    const shares = this.getListShares();
    // Generuj unikalny user_id bazując na emailu
    const userId = Math.abs(email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    const newShare: MockListShare = {
      user_id: userId,
      email,
      name,
      shared_at: new Date().toISOString(),
    };
    shares.push(newShare);
    localStorage.setItem(LIST_SHARES_KEY, JSON.stringify(shares));
    return newShare;
  }

  deleteListShare(email: string): void {
    const shares = this.getListShares();
    const filteredShares = shares.filter((s) => s.email !== email);
    localStorage.setItem(LIST_SHARES_KEY, JSON.stringify(filteredShares));
  }
}

export const mockApi = new MockApiService();