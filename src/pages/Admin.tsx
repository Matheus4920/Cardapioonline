import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../store/useStore';
import { Plus, Edit, Trash2, Save, X, Database, CheckCircle, Clock, Package, UserPlus } from 'lucide-react';

export interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const CATEGORIES = [
  'Aperitivos', 'Pratos principais', 'Carnes', 'Massas', 
  'Frango & Peixe', 'Burgers', 'Saladas', 'Acompanhamentos', 
  'Sobremesas', 'Bebidas', 'Favoritos', 'Back to Outback'
];

const SEED_DATA = [
  { 
    name: "Ribs Rocker Crown", 
    category: "Back to Outback", 
    description: "A majestosa coroa de costelas do Outback, perfeita para compartilhar e se deliciar com o sabor inconfundível.", 
    price: 129.90, 
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop", 
    isFeatured: true, 
    isAvailable: true,
    addOns: [{ name: 'Molho Barbecue Extra', price: 4.90 }, { name: 'Fritas Extra', price: 14.90 }]
  },
  { 
    name: "Catupiry Madness Burger", 
    category: "Back to Outback", 
    description: "Um burger insano com muito Catupiry, carne suculenta e o toque especial do Outback.", 
    price: 59.90, 
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop", 
    isFeatured: false, 
    isAvailable: true,
    removableIngredients: ['Cebola Roxa', 'Tomate', 'Picles', 'Catupiry'],
    addOns: [{ name: 'Bacon Extra', price: 6.90 }, { name: 'Queijo Extra', price: 4.90 }, { name: 'Hambúrguer Extra', price: 12.90 }]
  },
  { 
    name: "Chook’n Dillas", 
    category: "Back to Outback", 
    description: "Quesadillas recheadas com frango temperado, queijos derretidos e muito sabor.", 
    price: 64.90, 
    imageUrl: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?q=80&w=1000&auto=format&fit=crop", 
    isFeatured: false, 
    isAvailable: true,
    removableIngredients: ['Pimenta Jalapeño', 'Cebola', 'Tomate'],
    addOns: [{ name: 'Guacamole Extra', price: 8.90 }, { name: 'Sour Cream Extra', price: 6.90 }]
  },
  { 
    name: "Aussie Beef Quesadillas", 
    category: "Back to Outback", 
    description: "Quesadillas recheadas com tiras de carne macias, mix de queijos e temperos australianos.", 
    price: 69.90, 
    imageUrl: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=1000&auto=format&fit=crop", 
    isFeatured: false, 
    isAvailable: true,
    removableIngredients: ['Pimenta Jalapeño', 'Cebola', 'Tomate'],
    addOns: [{ name: 'Guacamole Extra', price: 8.90 }, { name: 'Sour Cream Extra', price: 6.90 }]
  },
  { 
    name: "S’mores Outback", 
    category: "Back to Outback", 
    description: "A clássica sobremesa americana com o toque Outback: marshmallow tostado, chocolate derretido e biscoitos.", 
    price: 39.90, 
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=1000&auto=format&fit=crop", 
    isFeatured: false, 
    isAvailable: true,
    addOns: [{ name: 'Bola de Sorvete', price: 9.90 }, { name: 'Calda de Chocolate', price: 4.90 }]
  },
  { name: "Big Five Boomerang", category: "Aperitivos", description: "Porções de aperitivos em uma mesa com dois potes com molho e talheres. A combinação perfeita para começar.", price: 89.90, imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop", isFeatured: true, isAvailable: true },
  { name: "Bloomin’ Onion®", category: "Aperitivos", description: "Cebola gigante, empanada e frita em formato de pétala com nosso maravilhoso molho Bloom ao centro.", price: 59.90, imageUrl: "https://images.unsplash.com/photo-1633436375795-12b3b339712f?q=80&w=1000&auto=format&fit=crop", isFeatured: true, isAvailable: true },
  { name: "Aussie Cheese Fries®", category: "Aperitivos", description: "Batatas fritas cobertas com um mix de queijos e bacon, servidas com o molho Ranch.", price: 64.90, imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1000&auto=format&fit=crop", isFeatured: false, isAvailable: true },
  { name: "Kookaburra Wings®", category: "Aperitivos", description: "Pedaços de frango empanados com um blend de temperos especiais, acompanhados do molho Blue Cheese.", price: 69.90, imageUrl: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=1000&auto=format&fit=crop", isFeatured: false, isAvailable: true },
  { name: "Super Wings", category: "Aperitivos", description: "Outback Wings em um prato em cima de uma mesa de madeira. Mais asas, mais sabor, mais diversão.", price: 84.90, imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=1000&auto=format&fit=crop", isFeatured: false, isAvailable: true },
  { name: "Firecracker Shrimp Nachos®", category: "Aperitivos", description: "Camarão empanado com nachos crocantes, servidos com um molho levemente picante.", price: 74.90, imageUrl: "https://images.unsplash.com/photo-1559715716-66863b010b41?q=80&w=1000&auto=format&fit=crop", isFeatured: false, isAvailable: true },
  { name: "Royal Plant Barbecue", category: "Favoritos", description: "150g de mix de proteínas vegetais empanadas servida com molho barbecue e fritas.", price: 69.90, imageUrl: "https://images.unsplash.com/photo-1625938145744-e380515399b7?q=80&w=1000&auto=format&fit=crop", isFeatured: false, isAvailable: true },
  { name: "Junior Ribs For Two", category: "Favoritos", description: "Duas Junior Ribs servidas com fritas, molho e Cinnamon Apples.", price: 139.90, imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1000&auto=format&fit=crop", isFeatured: false, isAvailable: true },
  { name: "Ribs On The Barbie", category: "Favoritos", description: "Costela servida com molho Billabong, acompanhada de fritas e Cinnamon Apples.", price: 109.90, imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop", isFeatured: true, isAvailable: true },
  { name: "Junior Ribs", category: "Favoritos", description: "Meia costela servida com fritas e molho.", price: 79.90, imageUrl: "https://images.unsplash.com/photo-1593030668930-8130abedd2b0?q=80&w=1000&auto=format&fit=crop", isFeatured: false, isAvailable: true }
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'admins'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Admin management state
  const [adminEmail, setAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  useEffect(() => {
    fetchProducts();
    
    // Real-time listener for orders
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });

    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
  };

  const handleSaveProduct = async (id?: string) => {
    try {
      // Remove id from formData to comply with Firestore security rules
      const { id: _, ...productData } = formData;
      
      if (!productData.name || productData.price === undefined || isNaN(productData.price) || !productData.category || !productData.imageUrl || !productData.description) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      if (id) {
        await updateDoc(doc(db, 'products', id), {
          ...productData,
          createdAt: productData.createdAt || new Date().toISOString(),
          isAvailable: productData.isAvailable ?? true,
          isFeatured: productData.isFeatured ?? false,
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString(),
          isAvailable: productData.isAvailable ?? true,
          isFeatured: productData.isFeatured ?? false,
        });
      }
      setIsEditing(null);
      setIsAdding(false);
      setFormData({});
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Erro ao salvar produto.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleSeed = async () => {
    if (confirm("Isso irá adicionar os produtos padrão do Outback ao banco de dados. Deseja continuar?")) {
      setIsSeeding(true);
      try {
        for (const product of SEED_DATA) {
          await addDoc(collection(db, 'products'), {
            ...product,
            createdAt: new Date().toISOString(),
          });
        }
        alert("Produtos adicionados com sucesso!");
        fetchProducts();
      } catch (error) {
        console.error("Error seeding database:", error);
        alert("Erro ao popular banco de dados.");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Erro ao atualizar status do pedido.");
    }
  };

  const handleAddAdmin = async () => {
    if (!adminEmail) return;
    
    setIsAddingAdmin(true);
    try {
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const snapshot = await getDocs(q);
      
      let userFound = false;
      for (const docSnap of snapshot.docs) {
        if (docSnap.data().email === adminEmail) {
          await updateDoc(doc(db, 'users', docSnap.id), { role: 'admin' });
          userFound = true;
          alert(`Permissão de administrador concedida para ${adminEmail}`);
          break;
        }
      }
      
      if (!userFound) {
        alert("Usuário não encontrado. O usuário precisa fazer login no site pelo menos uma vez antes de receber permissões de administrador.");
      }
      
      setAdminEmail('');
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("Erro ao adicionar administrador. Apenas o proprietário pode fazer isso.");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'preparing': return 'text-blue-500 bg-blue-500/10';
      case 'ready': return 'text-green-500 bg-green-500/10';
      case 'delivered': return 'text-gray-400 bg-gray-500/10';
      case 'cancelled': return 'text-red-500 bg-red-500/10';
      default: return 'text-white/50 bg-white/5';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando';
      case 'preparing': return 'Em Preparo';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter">Painel Admin</h1>
          
          <div className="flex bg-[#111] p-1 rounded-full border border-white/10">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'orders' ? 'bg-orange-600 text-white' : 'text-white/50 hover:text-white'}`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'products' ? 'bg-orange-600 text-white' : 'text-white/50 hover:text-white'}`}
            >
              Produtos
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'admins' ? 'bg-orange-600 text-white' : 'text-white/50 hover:text-white'}`}
            >
              Acessos
            </button>
          </div>
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white/80 mb-6">Gerenciamento de Pedidos</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-[#0f0f0f] rounded-[2rem] border border-white/5">
                <Package size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/50 font-medium">Nenhum pedido encontrado.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-[#0f0f0f] p-6 rounded-3xl border border-white/5 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/5">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-white/40">#{order.id?.slice(0, 8)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-white/60">
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id!, 'preparing')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-colors"
                          >
                            Iniciar Preparo
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id!, 'ready')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full text-sm font-bold transition-colors"
                          >
                            Marcar como Pronto
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id!, 'delivered')}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-full text-sm font-bold transition-colors"
                          >
                            Finalizar (Entregue)
                          </button>
                        )}
                        {['pending', 'preparing'].includes(order.status) && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id!, 'cancelled')}
                            className="px-4 py-2 bg-red-900/50 hover:bg-red-600 text-white rounded-full text-sm font-bold transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{item.quantity}x {item.name}</p>
                            
                            {item.removedIngredients && item.removedIngredients.length > 0 && (
                              <p className="text-xs text-red-400 mt-1">
                                Sem: {item.removedIngredients.join(', ')}
                              </p>
                            )}
                            
                            {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                              <div className="text-xs text-green-400 mt-1">
                                Extras: {item.selectedAddOns.map((addon: any) => addon.name).join(', ')}
                              </div>
                            )}
                            
                            {item.notes && (
                              <p className="text-xs text-yellow-500/80 mt-1 italic">
                                Obs: {item.notes}
                              </p>
                            )}
                          </div>
                          <p className="font-mono text-white/70">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                      <p className="text-white/50 text-sm">Método: <span className="uppercase font-bold text-white">{order.paymentMethod}</span></p>
                      <p className="text-2xl font-black text-orange-500">R$ {order.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <>
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors disabled:opacity-50"
              >
                <Database size={20} /> {isSeeding ? 'Populando...' : 'Popular BD'}
              </button>
              <button
                onClick={() => { setIsAdding(true); setFormData({}); }}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold transition-colors"
              >
                <Plus size={20} /> Novo Produto
              </button>
            </div>

            <div className="bg-[#0f0f0f] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/80 text-white/50 text-sm uppercase tracking-widest font-bold">
                      <th className="p-6">Imagem</th>
                      <th className="p-6">Nome</th>
                      <th className="p-6">Categoria</th>
                      <th className="p-6">Preço</th>
                      <th className="p-6">Destaque</th>
                      <th className="p-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isAdding && (
                      <tr className="bg-white/5">
                        <td className="p-6" colSpan={6}>
                          <ProductForm 
                            data={formData} 
                            onChange={setFormData} 
                            onSave={() => handleSaveProduct()} 
                            onCancel={() => setIsAdding(false)} 
                          />
                        </td>
                      </tr>
                    )}
                    {products.map(product => (
                      isEditing === product.id ? (
                        <tr key={product.id} className="bg-white/5">
                          <td className="p-6" colSpan={6}>
                            <ProductForm 
                              data={formData} 
                              onChange={setFormData} 
                              onSave={() => handleSaveProduct(product.id)} 
                              onCancel={() => setIsEditing(null)} 
                            />
                          </td>
                        </tr>
                      ) : (
                        <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-6">
                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-2xl object-cover shadow-lg" referrerPolicy="no-referrer" />
                          </td>
                          <td className="p-6 font-bold text-lg">{product.name}</td>
                          <td className="p-6 text-white/50 font-medium">{product.category}</td>
                          <td className="p-6 text-orange-500 font-black">R$ {product.price.toFixed(2)}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${product.isFeatured ? 'bg-orange-600/20 text-orange-500' : 'bg-white/5 text-white/30'}`}>
                              {product.isFeatured ? 'Sim' : 'Não'}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setIsEditing(product.id); setFormData(product); }}
                                className="p-3 text-white/50 hover:text-white bg-black/50 hover:bg-white/10 rounded-xl transition-colors"
                              >
                                <Edit size={20} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-3 text-red-500/50 hover:text-red-500 bg-black/50 hover:bg-red-500/10 rounded-xl transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'admins' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white/80 mb-6 text-center">Gerenciar Acessos</h2>
            
            <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
              <div className="mb-8 text-center">
                <UserPlus size={48} className="mx-auto text-orange-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Conceder Acesso de Administrador</h3>
                <p className="text-white/50 text-sm">
                  Apenas o proprietário (cdl.matheusalmeida@gmail.com) pode conceder acesso a outros usuários. 
                  O usuário deve ter feito login no site pelo menos uma vez.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest font-bold">E-mail do Usuário</label>
                  <input 
                    type="email" 
                    value={adminEmail} 
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <button 
                  onClick={handleAddAdmin}
                  disabled={isAddingAdmin || !adminEmail}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isAddingAdmin ? 'Processando...' : 'Conceder Acesso'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductForm({ data, onChange, onSave, onCancel }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl">
      <div>
        <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest font-bold">Nome</label>
        <input 
          type="text" 
          value={data.name || ''} 
          onChange={e => onChange({...data, name: e.target.value})}
          className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest font-bold">Preço (R$)</label>
        <input 
          type="number" 
          step="0.01"
          value={data.price || ''} 
          onChange={e => onChange({...data, price: parseFloat(e.target.value)})}
          className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest font-bold">Categoria</label>
        <select 
          value={data.category || ''} 
          onChange={e => onChange({...data, category: e.target.value})}
          className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
        >
          <option value="">Selecione...</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest font-bold">URL da Imagem</label>
        <input 
          type="text" 
          value={data.imageUrl || ''} 
          onChange={e => onChange({...data, imageUrl: e.target.value})}
          className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest font-bold">Descrição</label>
        <textarea 
          value={data.description || ''} 
          onChange={e => onChange({...data, description: e.target.value})}
          className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-orange-500 h-32 resize-none transition-colors"
        />
      </div>
      <div className="flex items-center gap-8">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={data.isFeatured || false} 
            onChange={e => onChange({...data, isFeatured: e.target.checked})}
            className="w-6 h-6 accent-orange-500 bg-[#111] border-white/10 rounded focus:ring-orange-500 focus:ring-offset-0"
          />
          <span className="text-sm font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">Destaque na Home</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={data.isAvailable ?? true} 
            onChange={e => onChange({...data, isAvailable: e.target.checked})}
            className="w-6 h-6 accent-orange-500 bg-[#111] border-white/10 rounded focus:ring-orange-500 focus:ring-offset-0"
          />
          <span className="text-sm font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">Disponível</span>
        </label>
      </div>
      <div className="md:col-span-2 flex justify-end gap-4 mt-6 pt-6 border-t border-white/10">
        <button 
          onClick={onCancel}
          className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
        <button 
          onClick={onSave}
          className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(234,88,12,0.3)]"
        >
          <Save size={20} /> Salvar
        </button>
      </div>
    </div>
  );
}
