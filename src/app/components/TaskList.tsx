import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Plus, LogOut, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, Task, User } from "../services/api";
import { mockApi } from "../services/mockApi";

interface TaskListProps {
  user: User;
  onLogout: () => void;
  isDemoMode?: boolean;
}

export function TaskList({ user, onLogout, isDemoMode = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = isDemoMode ? mockApi.getTasks() : await api.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      toast.error("Nie udało się pobrać zadań");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("Wpisz nazwę zadania");
      return;
    }

    setIsSubmitting(true);
    try {
      const newTask = isDemoMode ? mockApi.createTask(newTaskTitle) : await api.createTask(newTaskTitle);
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setIsAdding(false);
      toast.success("Zadanie dodane!");
    } catch (error) {
      toast.error("Nie udało się dodać zadania");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const updatedTask = isDemoMode ? mockApi.updateTask(task.id, {
        completed: !task.completed,
      }) : await api.updateTask(task.id, {
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (error) {
      toast.error("Nie udało się zaktualizować zadania");
      console.error(error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      if (isDemoMode) {
        mockApi.deleteTask(id);
      } else {
        await api.deleteTask(id);
      }
      setTasks(tasks.filter((task) => task.id !== id));
      toast.success("Zadanie usunięte");
    } catch (error) {
      toast.error("Nie udało się usunąć zadania");
      console.error(error);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Ładowanie zadań...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-24">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl">Zadania na dziś</h1>
              {isDemoMode && (
                <Badge variant="secondary" className="text-xs">
                  DEMO
                </Badge>
              )}
            </div>
            <p className="text-gray-600">{today}</p>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">
              Postęp: {completedCount} / {tasks.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : "0%",
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2 mb-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task)}
                    id={`task-${task.id}`}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`flex-1 cursor-pointer ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {tasks.length === 0 && !isAdding && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-gray-500">
                Brak zadań na dziś. Dodaj pierwsze zadanie!
              </CardContent>
            </Card>
          )}
        </div>

        {isAdding ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nazwa zadania..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSubmitting) {
                      handleAddTask();
                    } else if (e.key === "Escape") {
                      setIsAdding(false);
                      setNewTaskTitle("");
                    }
                  }}
                  disabled={isSubmitting}
                  autoFocus
                />
                <Button onClick={handleAddTask} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Dodaj"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskTitle("");
                  }}
                  disabled={isSubmitting}
                >
                  Anuluj
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            className="w-full"
            size="lg"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj zadanie
          </Button>
        )}
      </div>
    </div>
  );
}