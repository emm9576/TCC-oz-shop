// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  ArrowLeft,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

// Componente de Rating Interativo
const RatingComponent = ({ 
  productId, 
  currentRating = 0, 
  userRating = 0, 
  totalRatings = 0, 
  isAuthenticated, 
  onRatingUpdate 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingClick = async (rating) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para avaliar produtos.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.updateProductRating(productId, rating);
      
      if (response.success) {
        toast({
          title: "Avaliação enviada",
          description: "Sua avaliação foi registrada com sucesso!",
          duration: 3000,
        });
        
        // Callback para atualizar os dados do produto
        if (onRatingUpdate) {
          onRatingUpdate(response.data);
        }
      } else {
        throw new Error(response.message || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Erro ao avaliar produto:', error);
      toast({
        title: "Erro na avaliação",
        description: error.message || "Não foi possível enviar sua avaliação. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Rating atual do produto */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(currentRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {currentRating > 0 ? currentRating.toFixed(1) : 'Sem avaliações'} 
          {totalRatings > 0 && ` (${totalRatings} avaliação${totalRatings > 1 ? 'ões' : ''})`}
        </span>
      </div>

      {/* Interface de avaliação do usuário */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">
            {userRating > 0 ? 'Sua avaliação' : 'Avaliar este produto'}
          </h3>
          {userRating > 0 && (
            <Badge variant="outline">
              Você avaliou: {userRating} estrela{userRating > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }, (_, i) => {
              const starValue = i + 1;
              const isActive = starValue <= (hoverRating || userRating);
              
              return (
                <button
                  key={i}
                  className={`p-1 transition-colors ${
                    !isAuthenticated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
                  }`}
                  disabled={!isAuthenticated || isSubmitting}
                  onMouseEnter={() => isAuthenticated && setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRatingClick(starValue)}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      isActive
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          )}
        </div>

        {!isAuthenticated ? (
          <p className="text-sm text-gray-500 mt-1">
            Faça login para avaliar este produto
          </p>
        ) : userRating > 0 ? (
          <p className="text-sm text-gray-600 mt-1">
            Clique nas estrelas para alterar sua avaliação
          </p>
        ) : (
          <p className="text-sm text-gray-600 mt-1">
            Clique nas estrelas para avaliar
          </p>
        )}
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buying, setBuying] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [loadingUserRating, setLoadingUserRating] = useState(false);

  const { addToCart, buyProduct, isInCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const { fetchProductById } = useProducts();
  const { toast } = useToast();

  // Carregar produto e rating do usuário
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchProductById(id);
        
        if (result.success) {
          setProduct(result.data);

        } else {
          setError(result.message || 'Produto não encontrado');
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError('Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, fetchProductById, isAuthenticated]);

  // Callback para atualizar dados após nova avaliação
  const handleRatingUpdate = (newRatingData) => {
    if (newRatingData) {
      // Atualizar dados do produto com novos valores de rating
      setProduct(prev => ({
        ...prev,
        rating: newRatingData.averageRating || prev.rating,
        reviews: newRatingData.totalRatings || prev.reviews,
        totalRatings: newRatingData.totalRatings || prev.totalRatings
      }));
      
      // Atualizar rating do usuário
      setUserRating(newRatingData.userRating || newRatingData.rating);
    }
  };

  // Handlers existentes
  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
      setQuantity(1); // Reset quantidade após adicionar
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para fazer compras.",
        variant: "destructive",
        duration: 3000,
      });
      navigate('/login', { state: { from: { pathname: `/produto/${id}` } } });
      return;
    }

    setBuying(true);
    try {
      const result = await buyProduct(product.id, quantity);
      
      if (result.success) {
        navigate('/perfil?tab=pedidos');
      }
    } catch (error) {
      console.error('Erro na compra:', error);
    } finally {
      setBuying(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado",
        description: "O link do produto foi copiado para a área de transferência.",
        duration: 3000,
      });
    }
  };

  // Calcular preço com desconto
  const calculatePrice = (price, discount) => {
    return discount > 0 ? price * (1 - discount / 100) : price;
  };

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Carregando produto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Produto não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'O produto que você está procurando não existe ou foi removido.'}
          </p>
          <Button onClick={() => navigate('/produtos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Produtos
          </Button>
        </div>
      </div>
    );
  }

  const finalPrice = calculatePrice(product.price, product.discount);
  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button 
          onClick={() => navigate('/produtos')}
          className="hover:text-gray-900 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Produtos
        </button>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Imagens do produto */}
        <div className="space-y-4">
          <motion.div 
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={product.images?.[selectedImage] || product.imageMain || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do produto */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Vendido por: <span className="font-medium">{product.seller}</span>
            </p>
            
            {/* Rating Component */}
            <Card className="mb-4">
              <CardContent className="pt-4">
                <RatingComponent
                  productId={product.id}
                  currentRating={product.rating || 0}
                  userRating={userRating}
                  totalRatings={product.reviews || product.totalRatings || 0}
                  isAuthenticated={isAuthenticated}
                  onRatingUpdate={handleRatingUpdate}
                />
                {loadingUserRating && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Carregando sua avaliação...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preço */}
          <div className="space-y-2">
            {product.discount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-500 line-through">
                  R$ {product.price.toFixed(2)}
                </span>
                <Badge variant="destructive">
                  -{product.discount}%
                </Badge>
              </div>
            )}
            <div className="text-3xl font-bold text-green-600">
              R$ {finalPrice.toFixed(2)}
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-4">
            <div className={`text-sm ${
              product.stock > 10 ? 'text-green-600' : 
              product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {product.stock > 10 ? (
                'Em estoque'
              ) : product.stock > 0 ? (
                `Apenas ${product.stock} unidade${product.stock > 1 ? 's' : ''} restante${product.stock > 1 ? 's' : ''}`
              ) : (
                'Fora de estoque'
              )}
            </div>
            
            {product.freteGratis && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Truck className="h-4 w-4" />
                Frete grátis
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">Quantidade:</label>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.stock || 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                className="w-full"
                size="lg"
                disabled={product.stock === 0 || buying}
              >
                {buying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Comprar Agora'
                )}
              </Button>
              
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={product.stock === 0 || addingToCart}
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {inCart ? `Adicionar mais (${cartQuantity} no carrinho)` : 'Adicionar ao Carrinho'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Garantias */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              Garantia de 30 dias
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="h-4 w-4" />
              Entrega segura
            </div>
          </div>
        </div>
      </div>

      {/* Descrição e detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Descrição */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Descrição do Produto
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Características */}
          {product.features && product.features.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Características
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Informações do vendedor */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Vendedor
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{product.seller}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">4.0 (123 vendas)</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Localização:</span>
                  <span className="text-gray-900">São Paulo, SP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membro desde:</span>
                  <span className="text-gray-900">2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Produtos ativos:</span>
                  <span className="text-gray-900">25</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                Ver Perfil do Vendedor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;