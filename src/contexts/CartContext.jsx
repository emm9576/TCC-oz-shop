// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Adicionar item ao carrinho (funcionalidade local para UX)
  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity }];
    });

    toast({
      title: "Produto adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
      duration: 3000,
    });
  }, [toast]);

  // Remover item do carrinho
  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== productId);
      
      if (updatedItems.length < prevItems.length) {
        toast({
          title: "Produto removido",
          description: "O produto foi removido do seu carrinho.",
          duration: 3000,
        });
      }
      
      return updatedItems;
    });
  }, [toast]);

  // Atualizar quantidade do item
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  // Limpar carrinho
  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos do carrinho.",
      duration: 3000,
    });
  }, [toast]);

  // Comprar produto individual
  const buyProduct = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para fazer compras.",
        variant: "destructive",
        duration: 3000,
      });
      return { success: false, message: "Login necessário" };
    }

    try {
      setLoading(true);
      const response = await apiService.buyProduct(productId, quantity);
      
      if (response.success) {
        toast({
          title: "Compra realizada com sucesso!",
          description: "Seu pedido foi processado com sucesso.",
          duration: 3000,
        });
        
        // Remover item do carrinho se estiver lá
        removeFromCart(productId);
        
        // Atualizar lista de pedidos
        await fetchOrders();
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao processar compra';
      
      toast({
        title: "Erro na compra",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast, removeFromCart]);

  // Comprar todos os itens do carrinho
  const buyCartItems = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para fazer compras.",
        variant: "destructive",
        duration: 3000,
      });
      return { success: false, message: "Login necessário" };
    }

    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive",
        duration: 3000,
      });
      return { success: false, message: "Carrinho vazio" };
    }

    try {
      setLoading(true);
      const results = [];
      
      // Processar cada item do carrinho
      for (const item of cartItems) {
        try {
          const response = await apiService.buyProduct(item.id, item.quantity);
          results.push({ ...response, productId: item.id });
        } catch (error) {
          results.push({ 
            success: false, 
            message: error.message, 
            productId: item.id 
          });
        }
      }

      const successfulPurchases = results.filter(r => r.success);
      const failedPurchases = results.filter(r => !r.success);

      if (successfulPurchases.length > 0) {
        toast({
          title: "Compras processadas",
          description: `${successfulPurchases.length} de ${cartItems.length} itens comprados com sucesso.`,
          duration: 3000,
        });
        
        // Limpar carrinho dos itens comprados com sucesso
        const failedProductIds = failedPurchases.map(p => p.productId);
        setCartItems(prevItems => 
          prevItems.filter(item => failedProductIds.includes(item.id))
        );
        
        // Atualizar lista de pedidos
        await fetchOrders();
      }

      if (failedPurchases.length > 0) {
        toast({
          title: "Alguns itens não puderam ser comprados",
          description: "Verifique o estoque dos produtos restantes no carrinho.",
          variant: "destructive",
          duration: 4000,
        });
      }

      return { 
        success: successfulPurchases.length > 0, 
        results,
        successCount: successfulPurchases.length,
        failureCount: failedPurchases.length
      };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao processar compras';
      
      toast({
        title: "Erro ao processar compras",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, cartItems, toast]);

  // Buscar pedidos do usuário
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      return { success: false, message: "Usuário não autenticado" };
    }

    try {
      setLoading(true);
      const response = await apiService.getOrdersByUser(user.id);
      
      if (response.success) {
        setOrders(response.data || []);
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Buscar pedido específico
  const fetchOrderById = useCallback(async (orderId) => {
    try {
      const response = await apiService.getOrderById(orderId);
      
      if (response.success) {
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return { success: false, message: error.message };
    }
  }, []);

  // Calcular totais do carrinho
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.discount > 0 
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return total + (price * item.quantity);
  }, 0);

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Verificar se produto está no carrinho
  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.id === productId);
  }, [cartItems]);

  // Obter quantidade de um produto no carrinho
  const getItemQuantity = useCallback((productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      // Carrinho
      cartItems,
      cartTotal,
      cartItemsCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity,
      
      // Compras
      buyProduct,
      buyCartItems,
      
      // Pedidos
      orders,
      fetchOrders,
      fetchOrderById,
      
      // Estado
      loading,
    }}>
      {children}
    </CartContext.Provider>
  );
};