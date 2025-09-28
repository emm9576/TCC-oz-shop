import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductsProvider } from '@/contexts/ProductsContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import ApiStatus from '@/components/ApiStatus';
import TokenStatus from '@/components/TokenStatus';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import SellPage from '@/pages/SellPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              
              {/* Token Status - Apenas para desenvolvimento */}
              {console.log(process.env.NODE_ENV)}
              {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 z-50">
                  <TokenStatus className="w-80 shadow-lg" />
                </div>
              )}
              
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/produtos" element={<ProductsPage />} />
                  <Route path="/produto/:id" element={<ProductDetailPage />} />
                  <Route path="/carrinho" element={<CartPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/cadastro" element={<RegisterPage />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/vender" element={<SellPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <ApiStatus />
            <Toaster />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;