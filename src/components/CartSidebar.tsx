import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, user } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const calculateItemTotal = (item: any) => {
    const addOnsTotal = item.selectedAddOns?.reduce((sum: number, addon: any) => sum + addon.price, 0) || 0;
    return (item.price + addOnsTotal) * item.quantity;
  };

  const total = cart.reduce((acc, item) => acc + calculateItemTotal(item), 0);

  const handleCheckout = async () => {
    if (!user) {
      alert("Por favor, faça login para finalizar o pedido.");
      return;
    }
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const orderData = {
        userId: user.uid,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          removedIngredients: item.removedIngredients || [],
          selectedAddOns: item.selectedAddOns || [],
          notes: item.notes || ''
        })),
        total,
        status: 'pending',
        paymentMethod: 'pix', // Defaulting to pix for now
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      clearCart();
      setIsCartOpen(false);
      navigate(`/order/${docRef.id}`);
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      alert("Erro ao finalizar pedido. Tente novamente.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
      )}
      {isCartOpen && (
        <motion.div
          key="sidebar"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111] border-l border-white/10 z-50 flex flex-col shadow-2xl"
        >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-orange-500" /> Seu Pedido
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40 space-y-4">
                  <ShoppingBag size={64} className="opacity-20" />
                  <p className="text-lg">Seu carrinho está vazio</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-6 py-2 bg-orange-500/20 text-orange-500 rounded-full font-medium hover:bg-orange-500/30 transition-colors"
                  >
                    Ver Cardápio
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 bg-white/5 p-4 rounded-2xl">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white font-medium line-clamp-1">{item.name}</h3>
                        <p className="text-orange-400 font-semibold mt-1">R$ {calculateItemTotal(item).toFixed(2)}</p>
                        
                        {/* Customizations Display */}
                        <div className="mt-2 space-y-1">
                          {item.removedIngredients && item.removedIngredients.length > 0 && (
                            <p className="text-xs text-red-400/80 line-clamp-2">
                              Sem: {item.removedIngredients.join(', ')}
                            </p>
                          )}
                          {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                            <p className="text-xs text-green-400/80 line-clamp-2">
                              + {item.selectedAddOns.map(a => a.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-white/50 italic line-clamp-2">
                              Obs: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-black/50 rounded-full px-2 py-1 border border-white/10">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="p-1 text-white/60 hover:text-white transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-white font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="p-1 text-white/60 hover:text-white transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-xs text-red-400 hover:text-red-300 underline"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#111]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/60">Total</span>
                  <span className="text-2xl font-bold text-white">R$ {total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCheckingOut ? 'Processando...' : 'Finalizar Pedido'}
                </button>
              </div>
            )}
          </motion.div>
      )}
    </AnimatePresence>
  );
}
