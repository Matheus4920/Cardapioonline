import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu as MenuIcon, BookOpen, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { signInWithGoogle, logOut } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, cart, setIsCartOpen } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm border-b border-white/5">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors shadow-[0_0_20px_rgba(234,88,12,0.3)]">
              <BookOpen size={24} className="text-white" />
            </div>
            <span className="text-xl font-black uppercase tracking-widest text-white">
              Outback<span className="text-orange-500">Digital</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-sm font-bold tracking-widest uppercase text-white/80 hover:text-orange-500 transition-colors">Início</Link>
            <Link to="/menu" className="text-sm font-bold tracking-widest uppercase text-white/80 hover:text-orange-500 transition-colors">Cardápio</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-bold tracking-widest uppercase text-orange-500 hover:text-orange-400 transition-colors">Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm font-medium text-white/60">Olá, {user.name.split(' ')[0]}</span>
                <button onClick={logOut} className="text-sm font-bold tracking-widest uppercase text-white/40 hover:text-white transition-colors">Sair</button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="hidden md:flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white transition-colors"
              >
                <User size={18} />
                <span>Entrar</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white/80 hover:text-orange-500 transition-colors"
            >
              <ShoppingBag size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            <button 
              className="md:hidden p-2 text-white/80 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-64 bg-[#111] border-l border-white/10 z-[70] flex flex-col shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <span className="text-lg font-black uppercase tracking-widest text-white">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col p-6 gap-6">
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="text-lg font-bold tracking-widest uppercase text-white/80 hover:text-orange-500 transition-colors">Início</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/menu" className="text-lg font-bold tracking-widest uppercase text-white/80 hover:text-orange-500 transition-colors">Cardápio</Link>
                {user?.role === 'admin' && (
                  <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin" className="text-lg font-bold tracking-widest uppercase text-orange-500 hover:text-orange-400 transition-colors">Admin</Link>
                )}
                
                <div className="h-px bg-white/10 my-2" />
                
                {user ? (
                  <div className="flex flex-col gap-4">
                    <span className="text-sm font-medium text-white/60">Olá, {user.name}</span>
                    <button onClick={() => { logOut(); setIsMobileMenuOpen(false); }} className="text-left text-lg font-bold tracking-widest uppercase text-red-500 hover:text-red-400 transition-colors">Sair</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { signInWithGoogle(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2 text-lg font-bold tracking-widest uppercase text-white/80 hover:text-white transition-colors"
                  >
                    <User size={20} />
                    <span>Entrar</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
