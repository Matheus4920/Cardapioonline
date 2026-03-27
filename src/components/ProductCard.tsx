import { Plus } from 'lucide-react';
import { Product, useStore } from '../store/useStore';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { setSelectedProduct } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0f0f0f] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        {product.isFeatured && (
          <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-orange-600/30">
            Destaque
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-1 relative -mt-10 z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{product.name}</h3>
        </div>
        
        <p className="text-white/50 text-base line-clamp-3 mb-8 flex-1 font-medium">
          {product.description}
        </p>

        <button
          onClick={() => setSelectedProduct(product)}
          className="w-full py-4 px-6 bg-white/5 hover:bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 group/btn border border-white/10 hover:border-orange-500"
        >
          <Plus size={20} className="text-orange-500 group-hover/btn:text-white transition-colors" />
          Adicionar
        </button>
      </div>
    </motion.div>
  );
}
