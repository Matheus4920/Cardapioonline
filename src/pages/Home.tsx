import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../store/useStore';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), where('isFeatured', '==', true), limit(3));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop"
            alt="Steak"
            className="w-full h-full object-cover opacity-50 scale-105 animate-[pulse_10s_ease-in-out_infinite_alternate]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.85]"
          >
            Sabor <span className="text-orange-600 drop-shadow-[0_0_30px_rgba(234,88,12,0.5)]">Inconfundível</span>,<br />
            Experiência <span className="text-orange-600 drop-shadow-[0_0_30px_rgba(234,88,12,0.5)]">Premium</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto font-medium tracking-wide"
          >
            O verdadeiro sabor australiano, agora no conforto da sua casa.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/menu"
              className="px-10 py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-black text-lg uppercase tracking-widest transition-all duration-500 flex items-center gap-3 w-full sm:w-auto justify-center shadow-[0_0_40px_rgba(234,88,12,0.3)] hover:shadow-[0_0_60px_rgba(234,88,12,0.6)] hover:-translate-y-1"
            >
              Fazer Pedido <ArrowRight size={24} />
            </Link>
            <Link
              to="/menu"
              className="px-10 py-5 bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 text-white rounded-full font-bold text-lg uppercase tracking-widest transition-all duration-500 backdrop-blur-md w-full sm:w-auto justify-center flex hover:-translate-y-1"
            >
              Ver Cardápio
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="relative z-20 -mt-20 mx-4 md:mx-auto max-w-6xl">
        <div className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex items-center gap-5 md:px-8 pt-4 md:pt-0">
              <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500">
                <Star size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg uppercase tracking-wider">Qualidade Premium</h4>
                <p className="text-sm text-white/50 mt-1">Ingredientes selecionados</p>
              </div>
            </div>
            <div className="flex items-center gap-5 md:px-8 pt-4 md:pt-0">
              <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500">
                <Clock size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg uppercase tracking-wider">Entrega Rápida</h4>
                <p className="text-sm text-white/50 mt-1">Média de 40 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-5 md:px-8 pt-4 md:pt-0">
              <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500">
                <MapPin size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg uppercase tracking-wider">Acompanhamento</h4>
                <p className="text-sm text-white/50 mt-1">Rastreio em tempo real</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Mais Pedidos</h2>
            <p className="text-white/50 text-xl font-medium">Os favoritos da galera, direto para você.</p>
          </div>
          <Link to="/menu" className="hidden sm:flex items-center gap-3 text-orange-500 font-bold uppercase tracking-widest hover:text-orange-400 transition-colors group">
            Ver todos <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            // Skeletons or placeholders
            [1, 2, 3].map(i => (
              <div key={i} className="bg-[#111] rounded-[2rem] h-[500px] animate-pulse border border-white/5" />
            ))
          )}
        </div>
        
        <div className="mt-12 text-center sm:hidden">
          <Link to="/menu" className="inline-flex items-center gap-3 text-orange-500 font-bold uppercase tracking-widest hover:text-orange-400 transition-colors group">
            Ver todos <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
