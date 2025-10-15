import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import EditProductPage from '@/pages/EditProductPage';
import CartPage from '@/pages/CartPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import UserProfilePage from '@/pages/UserProfilePage';
import SellPage from '@/pages/SellPage';
import CheckoutPage from '@/pages/CheckoutPage';
import TermsPage from '@/pages/TermsPage';

import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductsProvider } from '@/contexts/ProductsContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/produtos" element={<ProductsPage />} />
                  <Route path="/produto/:id" element={<ProductDetailPage />} />
                  <Route path="/produto/:id/edit" element={<EditProductPage />} />
                  <Route path="/carrinho" element={<CartPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/cadastro" element={<RegisterPage />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/perfil/:id" element={<UserProfilePage />} />
                  <Route path="/vender" element={<SellPage />} />
                  <Route path="/checkout/:id" element={<CheckoutPage />} />
                  <Route path="/termos" element={<TermsPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;