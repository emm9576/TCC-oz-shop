// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Truck, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { deleteProduct, updateProduct } = useProducts();
  const { toast } = useToast();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    category: '',
    imageMain: '',
    freteGratis: false
  });

  // Validação e valores padrão
  if (!product) {
    return null;
  }

  const {
    id,
    name = 'Produto sem nome',
    description = '',
    price = 0,
    discount = 0,
    rating = 0,
    reviews = 0,
    seller = 'Vendedor',
    stock = 0,
    image,
    imageMain,
    category = '',
    freteGratis = false,
    freeShipping = false
  } = product;

  // Usar imageMain se disponível, senão image
  const productImage = imageMain || image;
  
  // Se não há imagem, não renderizar o produto (retorna null antes do JSX)
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

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
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
    setShowDeleteModal(false);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Pré-preencher o formulário com os dados atuais
    setEditForm({
      name: name || '',
      description: description || '',
      price: price?.toString() || '',
      discount: discount?.toString() || '',
      stock: stock?.toString() || '',
      category: category || '',
      imageMain: imageMain || image || '',
      freteGratis: freteGratis || freeShipping || false
    });
    
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const updatedData = {
      ...editForm,
      price: parseFloat(editForm.price) || 0,
      discount: parseFloat(editForm.discount) || 0,
      stock: parseInt(editForm.stock) || 0
    };

    const result = await updateProduct(id, updatedData);
    if (result.success) {
      toast({
        title: "Produto atualizado",
        description: "As informações do produto foram atualizadas com sucesso.",
        duration: 3000,
      });
      setShowEditModal(false);
    } else {
      toast({
        title: "Erro ao atualizar produto",
        description: result.message || "Ocorreu um erro ao atualizar o produto.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Modal de confirmação de deleção
  const DeleteModal = () => (
    <AnimatePresence>
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja excluir o produto <strong>"{name}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Modal de edição
  const EditModal = () => (
    <AnimatePresence>
      {showEditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Editar Produto</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Digite o nome do produto"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
                  <select
                    id="category"
                    value={editForm.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Electronics">Eletrônicos</option>
                    <option value="Fashion">Moda</option>
                    <option value="Home">Casa e Decoração</option>
                    <option value="Sports">Esportes</option>
                    <option value="Beauty">Beleza e Saúde</option>
                    <option value="Books">Livros</option>
                    <option value="Automotive">Automotivo</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Digite a descrição do produto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="discount" className="text-sm font-medium">Desconto (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.discount}
                    onChange={(e) => handleFormChange('discount', e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock" className="text-sm font-medium">Estoque *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => handleFormChange('stock', e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageMain" className="text-sm font-medium">URL da Imagem *</Label>
                <Input
                  id="imageMain"
                  type="url"
                  value={editForm.imageMain}
                  onChange={(e) => handleFormChange('imageMain', e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="freteGratis"
                  checked={editForm.freteGratis}
                  onChange={(e) => handleFormChange('freteGratis', e.target.checked)}
                  className="mr-2"
                />
                <Label htmlFor="freteGratis" className="text-sm font-medium">Frete Grátis</Label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Edit2 size={16} className="mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (viewMode === 'list') {
    return (
      <>
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
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                        onClick={handleEditClick}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={handleDeleteClick}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
        
        <DeleteModal />
        <EditModal />
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
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow w-full"
      >
        <Link to={`/produto/${id}`} className="block">
          <div className="relative h-48 sm:h-56 lg:h-64 xl:h-80 2xl:h-96 overflow-hidden">
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
          
          <div className="p-3 sm:p-4 lg:p-5 xl:p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold line-clamp-2 flex-1">{name}</h3>
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
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-green-600">
                  R$ {finalPrice.toFixed(2)}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size={viewMode === 'grid' ? 'sm' : 'sm'}
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white lg:h-10 xl:h-12 lg:px-4 xl:px-6"
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                >
                  <ShoppingCart size={viewMode === 'grid' ? 16 : 16} className="lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                </Button>
                
                {isAdmin && (
                  <>
                    <Button 
                      size={viewMode === 'grid' ? 'sm' : 'sm'}
                      variant="outline" 
                      className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white lg:h-10 xl:h-12 lg:px-4 xl:px-6"
                      onClick={handleEditClick}
                    >
                      <Edit2 size={viewMode === 'grid' ? 16 : 16} className="lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                    </Button>
                    <Button 
                      size={viewMode === 'grid' ? 'sm' : 'sm'}
                      variant="outline" 
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white lg:h-10 xl:h-12 lg:px-4 xl:px-6"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 size={viewMode === 'grid' ? 16 : 16} className="lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                    </Button>
                  </>
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
      
      <DeleteModal />
      <EditModal />
    </>
  );
};

export default ProductCard;