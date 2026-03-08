import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { TaskList } from "./components/TaskList";
import { ShoppingList } from "./components/ShoppingList";

// Ta funkcja zostanie wywołana z App.tsx z odpowiednimi propsami
export const createAppRouter = (
  user: { id: number; email: string },
  onLogout: () => void,
  isDemoMode: boolean
) => {
  return createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Navigate to="/tasks" replace />,
        },
        {
          path: "tasks",
          element: <TaskList user={user} onLogout={onLogout} isDemoMode={isDemoMode} />,
        },
        {
          path: "shopping",
          element: <ShoppingList user={user} onLogout={onLogout} isDemoMode={isDemoMode} />,
        },
      ],
    },
  ]);
};
