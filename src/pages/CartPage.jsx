import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  CreditCard, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para continuar com a compra.",
        variant: "destructive",
        duration: 3000,
      });
      navigate('/login');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulando processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      
      toast({
        title: "Compra realizada com sucesso!",
        description: "Seu pedido foi processado e será enviado em breve.",
        duration: 5000,
      });
      
      navigate('/');
    }, 2000);
  };
  
  const shippingCost = cartTotal > 100 ? 0 : 15.90;
  const totalWithShipping = cartTotal + shippingCost;
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 text-6xl">🛒</div>
          <h1 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h1>
          <p className="text-gray-600 mb-8">
            Parece que você ainda não adicionou nenhum produto ao seu carrinho.
          </p>
          <Button asChild size="lg">
            <Link to="/produtos">Explorar Produtos</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <ShoppingCart className="mr-2 h-6 w-6" />
        Meu Carrinho
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de produtos */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Itens'}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar Carrinho
                </Button>
              </div>
            </div>
            
            <div className="divide-y">
              {cartItems.map((item) => {
                const itemTotal = item.discount > 0 
                  ? (item.price * (1 - item.discount / 100)) * item.quantity 
                  : item.price * item.quantity;
                
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 flex flex-col sm:flex-row"
                  >
                    <div className="sm:w-24 h-24 flex-shrink-0 mb-4 sm:mb-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1 sm:ml-4">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div>
                          <Link 
                            to={`/produto/${item.id}`}
                            className="text-lg font-medium hover:text-primary transition-colors"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500 mb-2">Vendido por: {item.seller}</p>
                        </div>
                        
                        <div className="flex items-start sm:items-end flex-col">
                          <div className="flex items-center mb-2">
                            {item.discount > 0 ? (
                              <>
                                <span className="font-bold text-primary">
                                  R$ {((item.price * (1 - item.discount / 100)) * item.quantity).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  R$ {(item.price * item.quantity).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-primary">
                                R$ {(item.price * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex items-center border rounded-md mr-4">
                              <button 
                                className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button 
                                className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            
                            <button 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/produtos" className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Continuar Comprando
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Resumo do pedido */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span>
                  {shippingCost === 0 
                    ? <span className="text-green-600">Grátis</span> 
                    : `R$ ${shippingCost.toFixed(2)}`
                  }
                </span>
              </div>
              
              {shippingCost > 0 && (
                <div className="text-sm text-gray-500">
                  Frete grátis para compras acima de R$ 100,00
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">
                R$ {totalWithShipping.toFixed(2)}
              </span>
            </div>
            
            <Button 
              className="w-full mb-4" 
              size="lg"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  Processando...
                </>
              ) : (
                <>
                  Finalizar Compra
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-primary" />
                <span>Pagamento seguro</span>
              </div>
              <div className="flex items-center">
                <Truck className="h-4 w-4 mr-2 text-primary" />
                <span>Entrega em todo o Brasil</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                <span>Garantia de satisfação</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;