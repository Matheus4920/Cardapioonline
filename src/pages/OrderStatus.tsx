import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CheckCircle2, Clock, ChefHat, PackageCheck } from 'lucide-react';

export default function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;

    const docRef = doc(db, 'orders', orderId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
        setError('');
      } else {
        setError('Pedido não encontrado.');
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching order:", err);
      setError('Erro ao carregar o pedido.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-black text-white mb-4">Ops!</h1>
        <p className="text-white/60 mb-8">{error}</p>
        <Link to="/" className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold">
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: Clock, text: 'Aguardando Confirmação', color: 'text-yellow-500' },
    preparing: { icon: ChefHat, text: 'Em Preparo', color: 'text-orange-500' },
    ready: { icon: PackageCheck, text: 'Pronto para Retirada', color: 'text-green-500' },
    completed: { icon: CheckCircle2, text: 'Finalizado', color: 'text-blue-500' }
  };

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  const orderUrl = `${window.location.origin}/order/${order.id}`;

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> Voltar
        </Link>

        <div className="bg-[#111] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-orange-600/20 to-transparent p-8 border-b border-white/5 text-center">
            <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Pedido #{order.id.slice(-6).toUpperCase()}</h1>
            <div className={`inline-flex items-center gap-2 ${currentStatus.color} font-bold bg-black/30 px-4 py-2 rounded-full mt-4`}>
              <StatusIcon size={20} />
              {currentStatus.text}
            </div>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-12">
            {/* Order Details */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Itens do Pedido</h2>
              <div className="space-y-6">
                {order.items.map((item: any, index: number) => {
                  const itemTotal = (item.price + (item.selectedAddOns?.reduce((sum: number, a: any) => sum + a.price, 0) || 0)) * item.quantity;
                  return (
                    <div key={index} className="flex justify-between items-start border-b border-white/5 pb-4 last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 font-bold">{item.quantity}x</span>
                          <span className="text-white font-medium">{item.name}</span>
                        </div>
                        
                        {/* Customizations */}
                        <div className="mt-1 pl-6 space-y-1">
                          {item.removedIngredients && item.removedIngredients.length > 0 && (
                            <p className="text-sm text-red-400/80">
                              Sem: {item.removedIngredients.join(', ')}
                            </p>
                          )}
                          {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                            <p className="text-sm text-green-400/80">
                              + {item.selectedAddOns.map((a: any) => a.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-sm text-white/50 italic">
                              Obs: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-white font-medium">R$ {itemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-white/60 text-lg">Total</span>
                <span className="text-3xl font-black text-orange-500">R$ {order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center bg-black/30 rounded-3xl p-8 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-wider text-center">Acompanhe seu Pedido</h2>
              <p className="text-white/50 text-center text-sm mb-8">Escaneie o QR Code para ver o status atualizado.</p>
              
              <div className="bg-white p-4 rounded-2xl shadow-xl">
                <QRCodeSVG 
                  value={orderUrl} 
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"Q"}
                  includeMargin={false}
                />
              </div>
              
              <p className="text-white/30 text-xs mt-6 text-center break-all">
                {order.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
