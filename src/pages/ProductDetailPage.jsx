
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  ArrowLeft, 
  Star, 
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/ProductCard';
import { getProductById, products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  useEffect(() => {
    // Simular carregamento de dados
    setLoading(true);
    
    setTimeout(() => {
      const foundProduct = getProductById(id);
      setProduct(foundProduct);
      
      if (foundProduct) {
        // Encontrar produtos relacionados (mesma categoria)
        const related = products
          .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
      
      setLoading(false);
    }, 500);
  }, [id]);
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      
      toast({
        title: "Produto adicionado",
        description: `${product.name} foi adicionado ao carrinho.`,
        duration: 3000,
      });
    }
  };
  
  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Carregando produto...</p>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
          <p className="text-gray-600 mb-6">O produto que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/produtos">Ver outros produtos</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary">Início</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link to="/produtos" className="hover:text-primary">Produtos</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-700 font-medium truncate">{product.name}</span>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Galeria de imagens */}
        <div className="lg:w-1/2">
          <div className="relative bg-white rounded-lg overflow-hidden mb-4 h-80 md:h-96">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
            
            {product.discount > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                -{product.discount}%
              </div>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`relative rounded-md overflow-hidden border-2 flex-shrink-0 w-20 h-20 ${
                  selectedImage === index ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={image} 
                  alt={`${product.name} - imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* Informações do produto */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Heart className="h-5 w-5 text-gray-500" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Share2 className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                      className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating} ({product.reviews} avaliações)
                </span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                {product.discount > 0 ? (
                  <>
                    <span className="text-3xl font-bold text-primary mr-2">
                      R$ {discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="ml-2">
                      {product.discount}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    R$ {product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                Em até 12x de R$ {(discountedPrice / 12).toFixed(2)} sem juros
              </div>
              
              {product.freeShipping && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    <Truck className="h-3 w-3 mr-1" /> Frete Grátis
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Vendido por</h3>
              <div className="flex items-center">
                <span className="text-gray-700">{product.seller}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Quantidade</h3>
                <span className="text-sm text-gray-500">
                  Disponível: {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'}
                </span>
              </div>
              
              <div className="flex items-center border rounded-md w-32">
                <button 
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="flex-1 text-center">{quantity}</span>
                <button 
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                className="flex-1"
              >
                Comprar Agora
              </Button>
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="h-4 w-4 mr-2 text-primary" />
                <span>Entrega estimada em 3-5 dias úteis</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                <span>Garantia de 12 meses diretamente com o fabricante</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detalhes do produto em abas */}
      <div className="mb-12">
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start border-b">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="specifications">Especificações</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="p-4">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Sobre este produto</h3>
              <p className="mb-4">{product.description}</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in odio vitae justo vestibulum
                bibendum ac vitae ipsum. Suspendisse varius tellus non sem molestie dignissim. Fusce fermentum
                purus sed tortor placerat finibus. Cras consequat varius viverra.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Características</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Informações Técnicas</h3>
                <div className="space-y-2">
                  <div className="flex border-b pb-2">
                    <span className="font-medium w-1/3">Marca</span>
                    <span className="w-2/3">{product.seller.split(' ')[0]}</span>
                  </div>
                  <div className="flex border-b pb-2">
                    <span className="font-medium w-1/3">Modelo</span>
                    <span className="w-2/3">{product.name.split(' ').slice(-1)[0]}</span>
                  </div>
                  <div className="flex border-b pb-2">
                    <span className="font-medium w-1/3">Garantia</span>
                    <span className="w-2/3">12 meses</span>
                  </div>
                  <div className="flex border-b pb-2">
                    <span className="font-medium w-1/3">Categoria</span>
                    <span className="w-2/3 capitalize">{product.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="p-4">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Avaliações dos Clientes</h3>
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  <span className="text-3xl font-bold mr-2">{product.rating}</span>
                  <div className="flex flex-col">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                          className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{product.reviews} avaliações</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Avaliações simuladas */}
              <div className="border-b pb-4">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <span className="font-medium">JD</span>
                    </div>
                    <span className="font-medium">João D.</span>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < 5 ? "currentColor" : "none"} 
                        className={i < 5 ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-2">
                  Produto excelente! Superou minhas expectativas em todos os aspectos. Entrega rápida e bem embalado.
                </p>
                <span className="text-sm text-gray-500">12/05/2023</span>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <span className="font-medium">MS</span>
                    </div>
                    <span className="font-medium">Maria S.</span>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < 4 ? "currentColor" : "none"} 
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-2">
                  Muito bom, mas poderia ter mais opções de cores. A qualidade é ótima e o preço justo.
                </p>
                <span className="text-sm text-gray-500">28/04/2023</span>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <span className="font-medium">CP</span>
                    </div>
                    <span className="font-medium">Carlos P.</span>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < 5 ? "currentColor" : "none"} 
                        className={i < 5 ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-2">
                  Comprei para presentear e a pessoa adorou! Produto de alta qualidade e com ótimo custo-benefício.
                </p>
                <span className="text-sm text-gray-500">15/03/2023</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Produtos relacionados */}
      {relatedProducts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Produtos Relacionados</h2>
            <Link to="/produtos" className="text-primary hover:underline flex items-center">
              Ver mais
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
