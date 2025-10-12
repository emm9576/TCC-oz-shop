// src/pages/ProductsPage.jsx

import { motion } from 'framer-motion';
import { ChevronDown, Filter, Grid, List, Loader2, Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/contexts/ProductsContext';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    seller: searchParams.get('seller') || ''
  });

  const { products, loading, pagination, fetchProducts, fetchProductsByCategory, clearFilters } =
    useProducts();

  // Categorias disponíveis
  const categories = [
    { value: '', label: 'Todas as Categorias' },
    { value: 'Electronics', label: 'Eletrônicos' },
    { value: 'Fashion', label: 'Moda' },
    { value: 'Home', label: 'Casa e Decoração' },
    { value: 'Sports', label: 'Esportes' },
    { value: 'Beauty', label: 'Beleza e Saúde' },
    { value: 'Books', label: 'Livros' },
    { value: 'Automotive', label: 'Automotivo' }
  ];

  // Opções de ordenação
  const sortOptions = [
    { value: 'name', label: 'Nome A-Z' },
    { value: '-name', label: 'Nome Z-A' },
    { value: 'price', label: 'Menor Preço' },
    { value: '-price', label: 'Maior Preço' },
    { value: '-rating', label: 'Melhor Avaliação' },
    { value: '-reviews', label: 'Mais Avaliações' }
  ];

  // Buscar produtos quando filtros mudarem
  const searchProducts = useCallback(async () => {
    const params = {
      ...localFilters,
      search: localFilters.search || undefined,
      category: localFilters.category || undefined,
      minPrice: localFilters.minPrice ? parseFloat(localFilters.minPrice) : undefined,
      maxPrice: localFilters.maxPrice ? parseFloat(localFilters.maxPrice) : undefined,
      seller: localFilters.seller || undefined
    };

    // Remover parâmetros vazios
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    await fetchProducts(params);

    // Atualizar URL com os parâmetros de busca (sem page e limit)
    const urlParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined) {
        urlParams.set(key, params[key].toString());
      }
    });
    setSearchParams(urlParams);
  }, [localFilters, fetchProducts, setSearchParams]);

  // Carregar produtos iniciais
  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts();
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      seller: ''
    });
    clearFilters();
    setSearchParams({});
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Produtos</h1>

        {/* Barra de busca */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar produtos..."
              className="pl-10"
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Controles de exibição */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>

            {products.length > 0 && (
              <p className="text-sm text-gray-600">
                {products.length} produto{products.length !== 1 ? 's' : ''} encontrado
                {products.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de filtros */}
        <div className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-4">Filtros</h3>

            {/* Categoria */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Categoria</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={localFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preço */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Faixa de Preço</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Vendedor */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Vendedor</Label>
              <Input
                type="text"
                placeholder="Nome do vendedor"
                value={localFilters.seller}
                onChange={(e) => handleFilterChange('seller', e.target.value)}
              />
            </div>

            {/* Botões de ação */}
            <div className="space-y-2">
              <Button onClick={searchProducts} className="w-full" disabled={loading}>
                {loading ? 'Aplicando...' : 'Aplicar Filtros'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
                disabled={loading}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Carregando produtos...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">Nenhum produto encontrado</p>
              <Button onClick={handleClearFilters}>Limpar Filtros</Button>
            </div>
          ) : (
            <motion.div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-2 gap-6'
                  : 'space-y-4'
              }
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {products
                .filter((product) => product.imageMain || product.image)
                .map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
