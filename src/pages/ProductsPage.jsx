
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import { products, categories, getProductsByCategory, searchProducts } from '@/data/products';

const ProductsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('categoria');
  const searchParam = queryParams.get('search');

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [activeFilters, setActiveFilters] = useState([]);

  // Aplicar filtros quando a página carrega ou quando os filtros mudam
  useEffect(() => {
    let result = products;
    
    // Filtrar por categoria se selecionada
    if (selectedCategory) {
      result = getProductsByCategory(selectedCategory);
    }
    
    // Filtrar por termo de busca se existir
    if (searchQuery) {
      result = searchProducts(searchQuery);
    }
    
    // Filtrar por faixa de preço
    result = result.filter(product => {
      const discountedPrice = product.discount > 0 
        ? product.price * (1 - product.discount / 100) 
        : product.price;
      
      return discountedPrice >= priceRange.min && discountedPrice <= priceRange.max;
    });
    
    // Ordenar produtos
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => {
          const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        result.sort((a, b) => b.discount - a.discount);
        break;
      default: // relevance - mantém a ordem original
        break;
    }
    
    setFilteredProducts(result);
    
    // Atualizar filtros ativos
    const filters = [];
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        filters.push({ type: 'category', value: category.name, id: selectedCategory });
      }
    }
    if (searchQuery) {
      filters.push({ type: 'search', value: searchQuery });
    }
    if (priceRange.min > 0 || priceRange.max < 10000) {
      filters.push({ type: 'price', value: `R$${priceRange.min} - R$${priceRange.max}` });
    }
    
    setActiveFilters(filters);
    
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    // A busca já é aplicada pelo useEffect
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: Number(value)
    }));
  };

  const handleRemoveFilter = (filter) => {
    if (filter.type === 'category') {
      setSelectedCategory('');
    } else if (filter.type === 'search') {
      setSearchQuery('');
    } else if (filter.type === 'price') {
      setPriceRange({ min: 0, max: 10000 });
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('relevance');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros para desktop */}
        <motion.div 
          className="hidden md:block w-64 flex-shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Categorias</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <button
                      className={`flex items-center w-full text-left py-1 px-2 rounded-md transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Preço</h3>
              <div className="flex items-center gap-2 mb-3">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={clearAllFilters}
            >
              Limpar Filtros
            </Button>
          </div>
        </motion.div>
        
        {/* Conteúdo principal */}
        <div className="flex-1">
          {/* Barra de pesquisa e filtros */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </form>
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:hidden mr-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros
                </Button>
                
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {filter.type === 'category' && 'Categoria:'}
                      {filter.type === 'search' && 'Busca:'}
                      {filter.type === 'price' && 'Preço:'}
                      {filter.value}
                      <button 
                        onClick={() => handleRemoveFilter(filter)}
                        className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  
                  {activeFilters.length > 0 && (
                    <button 
                      onClick={clearAllFilters}
                      className="text-sm text-primary hover:underline"
                    >
                      Limpar todos
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="relevance">Relevância</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="rating">Melhor Avaliação</option>
                  <option value="discount">Maiores Descontos</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Filtros para mobile (expansível) */}
          {showFilters && (
            <motion.div 
              className="md:hidden mb-6 bg-white rounded-lg shadow-sm p-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Categorias</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`text-left py-1 px-2 rounded-md transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Preço</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-full"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  clearAllFilters();
                  setShowFilters(false);
                }}
              >
                Limpar Filtros
              </Button>
            </motion.div>
          )}
          
          {/* Resultados */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Produto' : 'Produtos'} Encontrados
              </h2>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">😕</div>
                <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-500 mb-6">
                  Não encontramos produtos que correspondam aos seus filtros.
                </p>
                <Button onClick={clearAllFilters}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
