import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { LogOut, Loader2, Search, X, ChevronDown, ChevronUp, Star, Minus, Plus, Milk, Wheat, Beef, Drumstick, Carrot, Apple, Package, Coffee, ShoppingBag, Share2 } from "lucide-react";
import { toast } from "sonner";
import { User, api as realApi } from "../services/api";
import { mockApi, ShoppingItem, ProductSuggestion } from "../services/mockApi";
import { ShareListDialog } from "./ShareListDialog";

interface ShoppingListProps {
  user: User;
  onLogout: () => void;
  isDemoMode?: boolean;
}

export function ShoppingList({ user, onLogout, isDemoMode = false }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [completedItems, setCompletedItems] = useState<ShoppingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [starredProducts, setStarredProducts] = useState<string[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null);
  const [customProductName, setCustomProductName] = useState("");
  const [customProductUnit, setCustomProductUnit] = useState("szt");
  const [showCustomProductForm, setShowCustomProductForm] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shoppingListId, setShoppingListId] = useState<number>(1);

  useEffect(() => {
    loadShoppingListId();
    loadItems();
  }, []);

  const loadShoppingListId = async () => {
    if (!isDemoMode) {
      try {
        const list = await realApi.getDefaultShoppingList();
        setShoppingListId(list.id);
      } catch (error) {
        console.error("Błąd pobierania ID listy:", error);
        // Fallback do ID 1 jeśli się nie uda
        setShoppingListId(1);
      }
    }
  };

  const loadItems = () => {
    try {
      const fetchedItems = mockApi.getShoppingItems();
      // Filtruj tylko niekupione produkty
      setItems(fetchedItems.filter((item) => !item.completed));
      // Filtruj tylko kupione produkty
      setCompletedItems(fetchedItems.filter((item) => item.completed));
    } catch (error) {
      toast.error("Nie udało się pobrać listy zakupów");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pobierz wszystkie sugestie i odfiltruj te, które są już na liście
  const getFilteredSuggestions = (): ProductSuggestion[] => {
    const allSuggestions = mockApi.getProductSuggestions(searchQuery);
    
    // Filtruj sugestie - ukryj tylko te które są na głównej liście "Do kupienia"
    const filtered = allSuggestions.filter(
      (suggestion) =>
        !items.some(
          (item) => item.name.toLowerCase() === suggestion.name.toLowerCase()
        )
    );
    
    // Sortuj: najpierw gwiazdki (alfabetycznie), potem reszta (alfabetycznie)
    return filtered.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return a.name.localeCompare(b.name, 'pl');
    });
  };

  // Pobierz dostępne jednostki z wszystkich produktów
  const getAvailableUnits = (): string[] => {
    const allSuggestions = mockApi.getProductSuggestions();
    const units = new Set<string>();
    
    allSuggestions.forEach((suggestion) => {
      suggestion.commonQuantities?.forEach((quantity) => {
        // Wyciągnij jednostkę z tekstu jak "1 kg", "2 l", "10 szt"
        const match = quantity.match(/\s+(.+)$/);
        if (match && match[1]) {
          units.add(match[1]);
        }
      });
    });
    
    return Array.from(units).sort();
  };

  // Pobierz ikonę dla produktu na podstawie nazwy
  const getIconForProduct = (productName: string): string => {
    const allSuggestions = mockApi.getProductSuggestions();
    const suggestion = allSuggestions.find(
      (s) => s.name.toLowerCase() === productName.toLowerCase()
    );
    return suggestion?.icon || "shopping-bag";
  };

  // Mapowanie nazwy ikony na komponent
  const getCategoryIconComponent = (iconName?: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      "milk": <Milk className="w-5 h-5 text-blue-500 flex-shrink-0" />,
      "wheat": <Wheat className="w-5 h-5 text-amber-600 flex-shrink-0" />,
      "beef": <Beef className="w-5 h-5 text-red-600 flex-shrink-0" />,
      "drumstick": <Drumstick className="w-5 h-5 text-orange-600 flex-shrink-0" />,
      "carrot": <Carrot className="w-5 h-5 text-orange-500 flex-shrink-0" />,
      "apple": <Apple className="w-5 h-5 text-red-500 flex-shrink-0" />,
      "package": <Package className="w-5 h-5 text-gray-600 flex-shrink-0" />,
      "coffee": <Coffee className="w-5 h-5 text-brown-600 flex-shrink-0" />,
      "shopping-bag": <ShoppingBag className="w-5 h-5 text-gray-500 flex-shrink-0" />
    };
    return iconMap[iconName || "shopping-bag"] || iconMap["shopping-bag"];
  };

  const handleToggleStar = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    mockApi.toggleStarProduct(productId);
    setStarredProducts(mockApi.getStarredProducts());
  };

  const handleAddFromSuggestion = (suggestion: ProductSuggestion) => {
    try {
      // Sprawdź czy produkt jest na liście kupionych
      const completedItem = completedItems.find(
        (item) => item.name.toLowerCase() === suggestion.name.toLowerCase()
      );

      if (completedItem) {
        // Przywróć z listy kupionych
        handleUncheckItem(completedItem);
      } else {
        // Dodaj nowy produkt
        const defaultQuantity = suggestion.commonQuantities?.[0];
        const newItem = mockApi.createShoppingItem(suggestion.name, defaultQuantity);
        setItems([...items, newItem]);
        toast.success(`${suggestion.name} dodano do listy!`);
      }
    } catch (error) {
      toast.error("Nie udało się dodać produktu");
      console.error(error);
    }
  };

  const handleCheckItem = (item: ShoppingItem) => {
    try {
      // Oznacz jako kupiony i przenieś do sublisty
      mockApi.updateShoppingItem(item.id, { completed: true });
      const updatedItem = { ...item, completed: true };
      setItems(items.filter((i) => i.id !== item.id));
      setCompletedItems([...completedItems, updatedItem]);
      setIsListExpanded(false); // Zwiń dolną listę
      toast.success(`${item.name} kupiono! ✓`, {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Nie udało się zaktualizować produktu");
      console.error(error);
    }
  };

  const handleUncheckItem = (item: ShoppingItem) => {
    try {
      // Przywróć na górną listę
      mockApi.updateShoppingItem(item.id, { completed: false });
      const updatedItem = { ...item, completed: false };
      setCompletedItems(completedItems.filter((i) => i.id !== item.id));
      setItems([...items, updatedItem]);
      toast.success(`${item.name} przywrócono do listy`, {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Nie udało się przywrócić produktu");
      console.error(error);
    }
  };

  const handleClearCompleted = () => {
    try {
      completedItems.forEach((item) => {
        mockApi.deleteShoppingItem(item.id);
      });
      setCompletedItems([]);
      toast.success("Lista kupionych została wyczyszczona");
    } catch (error) {
      toast.error("Nie udało się wyczyścić listy");
      console.error(error);
    }
  };

  // Obsługa długiego przytrzymania (long press) dla drag & drop
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const timeout = setTimeout(() => {
      setDraggedItemIndex(index);
      setIsListExpanded(false); // Zwiń dolną listę
      // Wibracja dla feedbacku
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      toast.info("Przeciągnij, aby zmienić kolejność", { duration: 1500 });
    }, 500); // 500ms długie przytrzymanie
    
    setLongPressTimeout(timeout);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Anuluj long press jeśli użytkownik przesuwa palec przed aktywacją
    if (longPressTimeout && draggedItemIndex === null) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
      return;
    }

    if (draggedItemIndex === null) return;

    // Znajdź element pod palcem
    const touch = e.touches[0];
    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    const cardElement = elementAtPoint?.closest('[data-item-index]');
    
    if (cardElement) {
      const targetIndex = parseInt(cardElement.getAttribute('data-item-index') || '');
      if (!isNaN(targetIndex) && targetIndex !== draggedItemIndex) {
        setDragOverItemIndex(targetIndex);
      }
    }
  };

  const handleTouchEnd = () => {
    // Anuluj long press jeśli nie został aktywowany
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }

    if (draggedItemIndex !== null && dragOverItemIndex !== null) {
      // Przenieś element
      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedItemIndex, 1);
      newItems.splice(dragOverItemIndex, 0, draggedItem);
      setItems(newItems);
      toast.success("Kolejność zmieniona!");
    }

    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleRemoveItem = (id: number) => {
    try {
      mockApi.deleteShoppingItem(id);
      setItems(items.filter((item) => item.id !== id));
      setCompletedItems(completedItems.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Nie udało się usunąć produktu");
      console.error(error);
    }
  };

  const handleQuantityChange = (item: ShoppingItem, newQuantity: string) => {
    try {
      mockApi.updateShoppingItem(item.id, { quantity: newQuantity });
      setItems(items.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i));
    } catch (error) {
      toast.error("Nie udało się zaktualizować ilości");
      console.error(error);
    }
  };

  const parseQuantity = (quantity?: string): { value: number; unit: string } => {
    if (!quantity) return { value: 1, unit: "szt" };
    const match = quantity.match(/^([\d.]+)\s*(.*)$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] || "szt" };
    }
    return { value: 1, unit: quantity };
  };

  const handleIncreaseQuantity = (e: React.MouseEvent, item: ShoppingItem) => {
    e.preventDefault();
    e.stopPropagation();
    const { value, unit } = parseQuantity(item.quantity);
    
    let newValue: number;
    let precision: number;
    
    if (unit === "szt") {
      // Sztuki: zawsze +1
      newValue = value + 1;
      precision = 0;
    } else if (unit === "kg") {
      // Kilogramy: zawsze +0.1
      newValue = value + 0.1;
      precision = 1;
    } else if (unit === "l") {
      // Litry: zawsze +0.5
      newValue = value + 0.5;
      precision = 1;
    } else {
      // Domyślnie +1
      newValue = value + 1;
      precision = 0;
    }
    
    handleQuantityChange(item, `${newValue.toFixed(precision)} ${unit}`);
  };

  const handleDecreaseQuantity = (e: React.MouseEvent, item: ShoppingItem) => {
    e.preventDefault();
    e.stopPropagation();
    const { value, unit } = parseQuantity(item.quantity);
    
    let newValue: number;
    let precision: number;
    let minValue: number;
    
    if (unit === "szt") {
      // Sztuki: zawsze -1, minimum 1
      newValue = Math.max(1, value - 1);
      precision = 0;
      minValue = 1;
    } else if (unit === "kg") {
      // Kilogramy: zawsze -0.1, minimum 0.1
      newValue = Math.max(0.1, value - 0.1);
      precision = 1;
      minValue = 0.1;
    } else if (unit === "l") {
      // Litry: zawsze -0.5, minimum 0.5
      newValue = Math.max(0.5, value - 0.5);
      precision = 1;
      minValue = 0.5;
    } else {
      // Domyślnie -1, minimum 1
      newValue = Math.max(1, value - 1);
      precision = 0;
      minValue = 1;
    }
    
    if (value > minValue) {
      handleQuantityChange(item, `${newValue.toFixed(precision)} ${unit}`);
    }
  };

  const handleAddCustomProduct = () => {
    if (!customProductName.trim()) {
      toast.error("Wprowadź nazwę produktu");
      return;
    }

    try {
      // Sprawdź czy produkt już istnieje na głównej liście
      const existingItem = items.find(
        (item) => item.name.toLowerCase() === customProductName.trim().toLowerCase()
      );

      if (existingItem) {
        toast.error("Ten produkt jest już na liście!");
        return;
      }

      // Sprawdź czy produkt jest na liście kupionych
      const completedItem = completedItems.find(
        (item) => item.name.toLowerCase() === customProductName.trim().toLowerCase()
      );

      if (completedItem) {
        // Przywróć z listy kupionych
        handleUncheckItem(completedItem);
        setCustomProductName("");
        return;
      }

      // Dodaj nowy własny produkt
      const quantity = `1 ${customProductUnit}`;
      const newItem = mockApi.createShoppingItem(customProductName.trim(), quantity);
      setItems([...items, newItem]);
      toast.success(`${customProductName.trim()} dodano do listy!`);
      
      // Wyczyść formularz
      setCustomProductName("");
      setCustomProductUnit("szt");
      setShowCustomProductForm(false); // Zamknij formularz po dodaniu
    } catch (error) {
      toast.error("Nie udało się dodać produktu");
      console.error(error);
    }
  };

  const handleShareList = () => {
    setShowShareDialog(true);
  };

  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const filteredSuggestions = getFilteredSuggestions();
  const availableUnits = getAvailableUnits();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Ładowanie listy zakupów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="p-4 bg-white border-b flex-shrink-0">
        <div className="max-w-2xl mx-auto flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl">Lista zakupów</h1>
              {isDemoMode && (
                <Badge variant="secondary" className="text-xs">
                  DEMO
                </Badge>
              )}
            </div>
            
          </div>
          <Button variant="ghost" size="icon" onClick={handleShareList} className="text-green-600 hover:text-green-700">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-hidden flex flex-col relative pb-16"
      >
        {/* Górna połowa - Wybrane produkty */}
        <div 
          className="overflow-y-auto p-4"
          style={{ 
            flex: isListExpanded ? '1 1 0' : 'none',
            minHeight: 0
          }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Do kupienia ({items.length})</h2>
            </div>

            {items.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-gray-500">
                  <p>Brak produktów na liście.</p>
                  <p className="text-sm mt-1">Wybierz produkty z listy poniżej</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <Card 
                    key={item.id} 
                    data-item-index={index}
                    className={`hover:shadow-md transition-all ${
                      draggedItemIndex === index 
                        ? 'opacity-50 scale-95' 
                        : dragOverItemIndex === index 
                        ? 'border-green-500 border-2' 
                        : ''
                    }`}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => handleCheckItem(item)}
                          id={`item-${item.id}`}
                        />
                        {getCategoryIconComponent(getIconForProduct(item.name))}
                        <label
                          htmlFor={`item-${item.id}`}
                          className="flex-1 cursor-pointer min-w-0"
                        >
                          <span className="font-medium">{item.name}</span>
                        </label>
                        {item.quantity && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => handleDecreaseQuantity(e, item)}
                              className="h-7 w-7"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm text-gray-700 min-w-[60px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => handleIncreaseQuantity(e, item)}
                              className="h-7 w-7"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-500 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Sublista kupionych produktów */}
            {completedItems.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <span className="text-sm font-medium text-gray-600">
                    Kupione ({completedItems.length})
                  </span>
                  {isCompletedExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {isCompletedExpanded && (
                  <div className="space-y-2">
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearCompleted}
                        className="text-red-500 hover:text-red-700 hover:border-red-500"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Wyczyść listę
                      </Button>
                    </div>
                    {completedItems.map((item) => (
                      <Card key={item.id} className="bg-gray-50">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={true}
                              onCheckedChange={() => handleUncheckItem(item)}
                              id={`completed-${item.id}`}
                            />
                            {getCategoryIconComponent(getIconForProduct(item.name))}
                            <label
                              htmlFor={`completed-${item.id}`}
                              className="flex-1 cursor-pointer min-w-0"
                            >
                              <span className="font-medium text-gray-500 line-through">{item.name}</span>
                              {item.quantity && (
                                <span className="text-sm text-gray-400 ml-2">
                                  {item.quantity}
                                </span>
                              )}
                            </label>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-8 w-8 text-gray-400 hover:text-red-500 flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interaktywna linia podziału */}
        {isListExpanded && (
          <div
            className="relative flex-shrink-0 h-1 flex items-center justify-center bg-[#b3b3b3]"
          >
          </div>
        )}

        {/* Dolna połowa - Search + Sugestie */}
        <div 
          className={`flex flex-col bg-white transition-all duration-300 ${
            isListExpanded ? '' : 'fixed left-0 right-0 z-40'
          }`}
          style={{ 
            flex: isListExpanded ? '1 1 0' : undefined,
            minHeight: 0,
            bottom: isListExpanded ? undefined : '64px'
          }}
        >
          <div className="p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="max-w-2xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Szukaj produktów..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => setIsListExpanded(true)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsListExpanded(!isListExpanded)}
                className="flex-shrink-0"
              >
                {isListExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {isListExpanded && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Przycisk/Formularz dodawania własnego produktu */}
                {!showCustomProductForm ? (
                  <Button
                    onClick={() => setShowCustomProductForm(true)}
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj własny produkt
                  </Button>
                ) : (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-blue-900">Dodaj własny produkt</h3>
                        <button
                          onClick={() => {
                            setShowCustomProductForm(false);
                            setCustomProductName("");
                            setCustomProductUnit("szt");
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder="Nazwa produktu..."
                            value={customProductName}
                            onChange={(e) => setCustomProductName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCustomProduct();
                              }
                            }}
                            className="flex-1 bg-white"
                            autoFocus
                          />
                          <select
                            value={customProductUnit}
                            onChange={(e) => setCustomProductUnit(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {availableUnits.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          onClick={handleAddCustomProduct}
                          className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Dodaj
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista sugestii */}
                {filteredSuggestions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {searchQuery 
                      ? `Brak wyników dla "${searchQuery}"`
                      : "Wszystkie produkty są już na liście!"
                    }
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredSuggestions.map((suggestion) => {
                      const isCompleted = completedItems.some(
                        (item) => item.name.toLowerCase() === suggestion.name.toLowerCase()
                      );
                      
                      return (
                        <div
                          key={suggestion.id}
                          className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                            isCompleted 
                              ? 'bg-green-50 border-green-300 hover:border-green-500 hover:shadow-md' 
                              : 'bg-white border-gray-200 hover:border-green-500 hover:shadow-md'
                          }`}
                        >
                          <button
                            onClick={() => handleAddFromSuggestion(suggestion)}
                            className="flex items-center gap-3 flex-1"
                          >
                            {getCategoryIconComponent(suggestion.icon)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{suggestion.name}</span>
                                {isCompleted && (
                                  <Badge variant="secondary" className="text-xs bg-green-200 text-green-800">
                                    Kupione
                                  </Badge>
                                )}
                              </div>
                              
                            </div>
                          </button>
                          <button
                            onClick={(e) => handleToggleStar(e, suggestion.id)}
                            className="flex-shrink-0 p-1"
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                suggestion.starred 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-gray-300 hover:text-yellow-400"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog udostępniania listy */}
      <ShareListDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        listId={shoppingListId}
        isDemoMode={isDemoMode}
      />
    </div>
  );
}