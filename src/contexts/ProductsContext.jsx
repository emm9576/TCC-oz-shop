// src/contexts/ProductsContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const ProductsContext = createContext();

export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({});
  const { toast } = useToast();

  // Buscar produtos com filtros
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await apiService.getProducts(params);
      
      if (response.success) {
        setProducts(response.data || []);
        setPagination(response.pagination || null);
        setFilters(params);
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao carregar produtos';
      console.error('Erro ao buscar produtos:', error);
      
      toast({
        title: "Erro ao carregar produtos",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar produto por ID
  const fetchProductById = useCallback(async (id) => {
    try {
      const response = await apiService.getProductById(id);
      
      if (response.success) {
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao carregar produto';
      console.error('Erro ao buscar produto:', error);
      
      toast({
        title: "Erro ao carregar produto",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    }
  }, [toast]);

  // Buscar produtos por categoria
  const fetchProductsByCategory = useCallback(async (category) => {
    try {
      setLoading(true);
      const response = await apiService.getProductsByCategory(category);
      
      if (response.success) {
        setProducts(response.data || []);
        setFilters({ category });
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao carregar produtos';
      console.error('Erro ao buscar produtos por categoria:', error);
      
      toast({
        title: "Erro ao carregar produtos",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar produtos por vendedor
  const fetchProductsBySeller = useCallback(async (seller) => {
    try {
      setLoading(true);
      const response = await apiService.getProductsBySeller(seller);
      
      if (response.success) {
        setProducts(response.data || []);
        setFilters({ seller });
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao carregar produtos';
      console.error('Erro ao buscar produtos por vendedor:', error);
      
      toast({
        title: "Erro ao carregar produtos",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar produtos com frete grátis
  const fetchProductsWithFreeShipping = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getProductsWithFreeShipping();
      
      if (response.success) {
        setProducts(response.data || []);
        setFilters({ freteGratis: true });
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao carregar produtos';
      console.error('Erro ao buscar produtos com frete grátis:', error);
      
      toast({
        title: "Erro ao carregar produtos",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar produto (para vendedores)
  const createProduct = useCallback(async (productData) => {
    try {
      const response = await apiService.createProduct(productData);
      
      if (response.success) {
        toast({
          title: "Produto criado com sucesso",
          description: "Seu produto foi adicionado ao catálogo.",
          duration: 3000,
        });
        
        // Recarregar produtos se necessário
        if (products.length > 0) {
          fetchProducts(filters);
        }
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao criar produto';
      
      toast({
        title: "Erro ao criar produto",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    }
  }, [toast, products.length, filters, fetchProducts]);

  // Atualizar produto
  const updateProduct = useCallback(async (id, productData) => {
    try {
      const response = await apiService.updateProduct(id, productData);
      
      if (response.success) {
        toast({
          title: "Produto atualizado",
          description: "As informações do produto foram atualizadas.",
          duration: 3000,
        });
        
        // Atualizar produto na lista local
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === id ? { ...product, ...response.data } : product
          )
        );
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao atualizar produto';
      
      toast({
        title: "Erro ao atualizar produto",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    }
  }, [toast]);

  // Atualizar rating do produto
  const updateProductRating = useCallback(async (id, rating) => {
    try {
      const response = await apiService.updateProductRating(id, rating);
      
      if (response.success) {
        // Atualizar produto na lista local
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === id ? { ...product, ...response.data } : product
          )
        );
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao atualizar rating';
      console.error('Erro ao atualizar rating:', error);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Deletar produto
  const deleteProduct = useCallback(async (id) => {
    try {
      const response = await apiService.deleteProduct(id);
      
      if (response.success) {
        toast({
          title: "Produto removido",
          description: "O produto foi removido do catálogo.",
          duration: 3000,
        });
        
        // Remover produto da lista local
        setProducts(prevProducts => 
          prevProducts.filter(product => product.id !== id)
        );
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao remover produto';
      
      toast({
        title: "Erro ao remover produto",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    }
  }, [toast]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    setProducts([]);
    setPagination(null);
  }, []);

  return (
    <ProductsContext.Provider value={{
      products,
      loading,
      pagination,
      filters,
      fetchProducts,
      fetchProductById,
      fetchProductsByCategory,
      fetchProductsBySeller,
      fetchProductsWithFreeShipping,
      createProduct,
      updateProduct,
      updateProductRating,
      deleteProduct,
      clearFilters,
    }}>
      {children}
    </ProductsContext.Provider>
  );
};