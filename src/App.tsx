import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useStore } from './store/useStore';

import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import ProductModal from './components/ProductModal';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Admin from './pages/Admin';
import OrderStatus from './pages/OrderStatus';

const OWNER_EMAIL = 'cdl.matheusalmeida@gmail.com';

export default function App() {
  const { setUser, user } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        const isOwner = firebaseUser.email === OWNER_EMAIL;

        if (userSnap.exists()) {
          const userData = userSnap.data() as any;
          // Force owner to be admin if they aren't already
          if (isOwner && userData.role !== 'admin') {
            await updateDoc(userRef, { role: 'admin' });
            userData.role = 'admin';
          }
          setUser({ uid: firebaseUser.uid, ...userData } as any);
        } else {
          // Create new user
          const newUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
            role: isOwner ? 'admin' : 'customer',
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newUser);
          setUser(newUser as any);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30">
        <Navbar />
        <CartSidebar />
        <ProductModal />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/order/:orderId" element={<OrderStatus />} />
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" replace />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
