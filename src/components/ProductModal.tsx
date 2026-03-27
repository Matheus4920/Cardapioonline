import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus } from 'lucide-react';
import { useStore, Product, AddOn } from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';

export default function ProductModal() {
  const { selectedProduct, setSelectedProduct, addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [notes, setNotes] = useState('');

  // Reset state when a new product is selected
  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setRemovedIngredients([]);
      setSelectedAddOns([]);
      setNotes('');
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const handleAddOnToggle = (addon: AddOn) => {
    setSelectedAddOns(prev => 
      prev.some(a => a.name === addon.name)
        ? prev.filter(a => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const handleIngredientToggle = (ingredient: string) => {
    setRemovedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const addOnsTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = (selectedProduct.price + addOnsTotal) * quantity;

  const handleAddToCart = () => {
    addToCart({
      ...selectedProduct,
      cartItemId: uuidv4(),
      quantity,
      removedIngredients,
      selectedAddOns,
      notes
    });
    setSelectedProduct(null);
  };

  return (
    <AnimatePresence>
      {selectedProduct && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        />
      )}
      {selectedProduct && (
        <motion.div
          key="modal"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4 pointer-events-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] flex flex-col shadow-2xl pointer-events-auto"
          >
          {/* Header Image */}
          <div className="relative h-64 shrink-0">
            <img 
              src={selectedProduct.imageUrl} 
              alt={selectedProduct.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{selectedProduct.name}</h2>
            <p className="text-white/60 mb-6 font-medium">{selectedProduct.description}</p>

            {/* Removable Ingredients */}
            {selectedProduct.removableIngredients && selectedProduct.removableIngredients.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Ingredientes (Desmarque para remover)</h3>
                <div className="space-y-3">
                  {selectedProduct.removableIngredients.map(ingredient => (
                    <label key={ingredient} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${!removedIngredients.includes(ingredient) ? 'bg-orange-500 border-orange-500' : 'border-white/20 group-hover:border-white/40'}`}>
                        {!removedIngredients.includes(ingredient) && <X size={14} className="text-white rotate-45" />}
                      </div>
                      <span className={`text-base font-medium ${!removedIngredients.includes(ingredient) ? 'text-white' : 'text-white/40 line-through'}`}>
                        {ingredient}
                      </span>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={!removedIngredients.includes(ingredient)}
                        onChange={() => handleIngredientToggle(ingredient)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {selectedProduct.addOns && selectedProduct.addOns.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Adicionais</h3>
                <div className="space-y-3">
                  {selectedProduct.addOns.map(addon => {
                    const isSelected = selectedAddOns.some(a => a.name === addon.name);
                    return (
                      <label key={addon.name} className="flex items-center justify-between cursor-pointer group p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-white/20 group-hover:border-white/40'}`}>
                            {isSelected && <X size={14} className="text-white rotate-45" />}
                          </div>
                          <span className="text-white font-medium">{addon.name}</span>
                        </div>
                        <span className="text-orange-400 font-bold">+ R$ {addon.price.toFixed(2)}</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isSelected}
                          onChange={() => handleAddOnToggle(addon)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Observações</h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Tirar a cebola, ponto da carne..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 transition-colors resize-none h-24"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-[#111] flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-2 border border-white/10">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="text-xl font-bold text-white w-6 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-lg uppercase tracking-widest transition-colors flex items-center justify-between group"
            >
              <span>Adicionar</span>
              <span>R$ {totalPrice.toFixed(2)}</span>
            </button>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
