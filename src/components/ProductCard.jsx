// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Truck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { deleteProduct } = useProducts();
  const { toast } = useToast();

  // Validação e valores padrão
  if (!product) {
    return null;
  }

  const {
    id,
    name = 'Produto sem nome',
    price = 0,
    discount = 0,
    rating = 0,
    reviews = 0,
    seller = 'Vendedor',
    stock = 0,
    image,
    imageMain,
    freteGratis = false,
    freeShipping = false
  } = product;

  // Usar imageMain se disponível, senão image, sem placeholder
  const productImage = imageMain || image;
  
  // Se não há imagem, não renderizar o produto
  if (!productImage) {
    return null;
  }
  
  // Calcular preço com desconto
  const originalPrice = Number(price) || 0;
  const discountPercent = Number(discount) || 0;
  const finalPrice = discountPercent > 0 
    ? originalPrice * (1 - discountPercent / 100)
    : originalPrice;

  // Verificar se tem frete grátis
  const hasFreeShipping = freteGratis || freeShipping;

  // Verificar se o usuário é admin
  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@admin.com');

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stock <= 0) {
      toast({
        title: "Produto indisponível",
        description: "Este produto está fora de estoque.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    addToCart(product);
    
    toast({
      title: "Produto adicionado",
      description: `${name} foi adicionado ao carrinho.`,
      duration: 3000,
    });
  };

  const handleDeleteProduct = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      const result = await deleteProduct(id);
      if (result.success) {
        toast({
          title: "Produto excluído",
          description: `${name} foi removido do catálogo.`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Erro ao excluir produto",
          description: result.message || "Ocorreu um erro ao excluir o produto.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      >
        <Link to={`/produto/${id}`} className="flex">
          <div className="w-48 h-32 flex-shrink-0">
            <img 
              src={productImage} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 p-4 flex justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">{name}</h3>
              
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.floor(rating) ? "currentColor" : "none"} 
                      className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">({reviews})</span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                Vendido por: {seller}
              </div>
              
              <div className="flex items-center gap-2">
                {hasFreeShipping && (
                  <Badge variant="secondary" className="text-green-600">
                    <Truck className="h-3 w-3 mr-1" />
                    Frete Grátis
                  </Badge>
                )}
                {stock <= 0 && (
                  <Badge variant="destructive">Fora de Estoque</Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-between ml-4">
              <div className="text-right">
                {discountPercent > 0 && (
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive">
                      -{discountPercent}%
                    </Badge>
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="text-sm text-gray-500 line-through">
                    R$ {originalPrice.toFixed(2)}
                  </div>
                )}
                <div className="text-xl font-bold text-green-600">
                  R$ {finalPrice.toFixed(2)}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                >
                  <ShoppingCart size={16} />
                </Button>
                
                {isAdmin && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={handleDeleteProduct}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // View mode grid (padrão)
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <Link to={`/produto/${id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={productImage} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {discountPercent > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
              -{discountPercent}%
            </Badge>
          )}
          {stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive" className="text-white">
                Fora de Estoque
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold line-clamp-2 flex-1">{name}</h3>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.floor(rating) ? "currentColor" : "none"} 
                  className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({reviews})</span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              {discountPercent > 0 && (
                <div className="text-sm text-gray-500 line-through">
                  R$ {originalPrice.toFixed(2)}
                </div>
              )}
              <div className="text-lg font-bold text-green-600">
                R$ {finalPrice.toFixed(2)}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={handleAddToCart}
                disabled={stock <= 0}
              >
                <ShoppingCart size={16} />
              </Button>
              
              {isAdmin && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={handleDeleteProduct}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="text-xs text-gray-600">
              por {seller}
            </div>
            <div className="flex items-center justify-between">
              {hasFreeShipping && (
                <div className="flex items-center text-xs text-green-600">
                  <Truck className="h-3 w-3 mr-1" />
                  Frete Grátis
                </div>
              )}
              {stock > 0 && stock <= 5 && (
                <div className="text-xs text-orange-600">
                  Apenas {stock} restante{stock > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;