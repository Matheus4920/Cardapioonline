import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';

const CATEGORIES = [
  'Todos',
  'Favoritos',
  'Back to Outback',
  'Aperitivos',
  'Pratos principais',
  'Carnes',
  'Massas',
  'Frango & Peixe',
  'Burgers',
  'Saladas',
  'Acompanhamentos',
  'Sobremesas',
  'Bebidas'
];

export default function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('category'));
        const snapshot = await getDocs(q);
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'Todos') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">Cardápio</h1>
            <p className="text-white/50 text-xl font-medium">Escolha seus favoritos e faça seu pedido.</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                placeholder="Buscar pratos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-full py-4 pl-14 pr-6 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500 transition-all text-lg"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-8 mb-12 gap-4 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-4 rounded-full font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white shadow-[0_0_30px_rgba(234,88,12,0.4)]'
                  : 'bg-[#0f0f0f] text-white/50 hover:bg-white/5 hover:text-white border border-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-[#111] rounded-[2rem] h-[500px] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
          >
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-32 bg-[#0f0f0f] rounded-[3rem] border border-white/5">
            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Nenhum prato encontrado</h3>
            <p className="text-white/50 text-lg mb-8">Tente buscar por outro termo ou categoria.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}
              className="px-10 py-4 bg-orange-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors shadow-[0_0_30px_rgba(234,88,12,0.3)]"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
