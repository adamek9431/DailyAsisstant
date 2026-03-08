import { Link, useLocation } from "react-router";
import { CheckCircle2, ShoppingCart } from "lucide-react";

export function BottomBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-2xl mx-auto flex">
        <Link
          to="/tasks"
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
            isActive("/tasks")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <CheckCircle2 className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Zadania</span>
        </Link>
        <Link
          to="/shopping"
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
            isActive("/shopping")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <ShoppingCart className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Zakupy</span>
        </Link>
      </div>
    </div>
  );
}
