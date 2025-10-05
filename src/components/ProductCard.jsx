// src/components/ProductCard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import apiService from '@/services/api';

const ProductCard = ({ product, viewMode = 'grid', onDelete }) => {
  const { addToCart } = useCart();
  const { user } = useAuth() || {}; // Proteção contra contexto undefined
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    sellerId,
    stock = 0,
    image,
    imageMain,
    freteGratis = false,
    freeShipping = false,
    description = ''
  } = product;

  // Usar imageMain se disponível, senão image
  const productImage = imageMain || image || 'https://i.imgur.com/sFl82h0.jpeg';

  // Estado para modal de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Verificar se é admin
  const isAdmin = user && (user.role === 'admin' || user.isAdmin);
  
  // Verificar se é o dono do produto
  const isOwner = user && (seller === user.name || sellerId === user.id);
  
  // Verificar se pode editar (admin ou dono)
  const canEdit = isAdmin || isOwner;

  // Calcular preço com desconto
  const originalPrice = Number(price) || 0;
  const discountPercent = Number(discount) || 0;
  const finalPrice = discountPercent > 0 
    ? originalPrice * (1 - discountPercent / 100)
    : originalPrice;

  // Verificar se tem frete grátis
  const hasFreeShipping = freteGratis || freeShipping;

  // Bloquear/desbloquear scroll da página quando modal estiver aberto
  useEffect(() => {
    if (showDeleteModal) {
      // Bloquear scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Compensar scrollbar
    } else {
      // Desbloquear scroll
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Cleanup quando componente for desmontado
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [showDeleteModal]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stock <= 0) {
      if (toast && typeof toast === 'function') {
        toast({
          title: "Produto indisponível",
          description: "Este produto está fora de estoque.",
          variant: "destructive",
          duration: 3000,
        });
      }
      return;
    }
    
    if (addToCart && typeof addToCart === 'function') {
      addToCart(product);
      
      if (toast && typeof toast === 'function') {
        toast({
          title: "Produto adicionado",
          description: `${name} foi adicionado ao carrinho.`,
          duration: 3000,
        });
      }
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/produto/${id}/edit`);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Tentando excluir produto ID:', id); // Debug
      
      // Chamar a API para deletar o produto
      await apiService.deleteProduct(id);
      
      console.log('Produto excluído com sucesso'); // Debug
      
      // Se onDelete foi fornecido, chamar para atualizar a lista
      if (onDelete && typeof onDelete === 'function') {
        await onDelete(id);
      }
      
      if (toast && typeof toast === 'function') {
        toast({
          title: "Produto excluído",
          description: "O produto foi removido com sucesso.",
          duration: 3000,
        });
      }
      
      setShowDeleteModal(false);
      
      // Recarregar a página para atualizar a lista
      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      
      if (toast && typeof toast === 'function') {
        toast({
          title: "Erro ao excluir",
          description: error.message || "Não foi possível excluir o produto.",
          variant: "destructive",
          duration: 3000,
        });
      }
      
      setShowDeleteModal(false);
    }
  };

  // Modal de confirmação de exclusão
  const DeleteModal = () => (
    showDeleteModal && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowDeleteModal(false)}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
          <p className="text-gray-600 mb-6">
            Tem certeza de que deseja excluir o produto "{name}"? 
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </div>
    )
  );

  if (viewMode === 'list') {
    return (
      <>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative"
        >
          <Link to={`/produto/${id}`} className="flex">
            <div className="w-48 h-32 flex-shrink-0">
              <img 
                src={productImage} 
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://i.imgur.com/sFl82h0.jpeg';
                }}
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
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                >
                  <ShoppingCart size={16} />
                </Button>
              </div>
            </div>
          </Link>

          {/* Botões de ação - editar e excluir */}
          {canEdit && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-white hover:bg-blue-50"
                onClick={handleEdit}
              >
                <Edit className="h-3 w-3" />
              </Button>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 bg-white hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </motion.div>

        <DeleteModal />
      </>
    );
  }

  // View mode grid (padrão)
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative"
      >
        <Link to={`/produto/${id}`} className="block">
          <div className="relative h-48 overflow-hidden">
            <img 
              src={productImage} 
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.src = 'https://i.imgur.com/sFl82h0.jpeg';
              }}
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
              
              <Button 
                size="sm" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={handleAddToCart}
                disabled={stock <= 0}
              >
                <ShoppingCart size={16} />
              </Button>
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

        {/* Botões de ação - editar e excluir */}
        {canEdit && (
          <div className="absolute top-2 left-2 flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 bg-white hover:bg-blue-50"
              onClick={handleEdit}
            >
              <Edit className="h-3 w-3" />
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-white hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </motion.div>

      <DeleteModal />
    </>
  );
};

export default ProductCard;