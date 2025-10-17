import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  FileText, 
  Copy, 
  Check,
  ArrowLeft,
  ShieldCheck,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';
import apiService from '@/services/api';
import PixIcon from '@/components/icons/PixIcon';

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const pollingIntervalRef = useRef(null);
  
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [pixLink, setPixLink] = useState('');
  const [pixExpiresAt, setPixExpiresAt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await apiService.getProductById(id);
        
        if (response && response.data) {
          setProduto(response.data);
        } else if (response) {
          setProduto(response);
        } else {
          throw new Error('Produto não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao carregar produto",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduto();
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      navigate(`/checkout/pix/confirm?code=${codeParam}`);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const generatePixPayment = async () => {
    try {
      setIsProcessing(true);
      const response = await apiService.checkoutPix(id, quantity);
      
      if (response.success) {
        setPixCode(response.pixCode);
        
        const siteUrl = window.location.origin;
        const pixPaymentLink = `${siteUrl}/checkout/pix/confirm?code=${response.pixCode}`;
        setPixLink(pixPaymentLink);
        setPixExpiresAt(new Date(response.expiresAt));
        
        const qrUrl = await QRCode.toDataURL(pixPaymentLink, {
          width: 300,
          margin: 2,
        });
        setQrCodeUrl(qrUrl);
        
        startPixPolling(response.pixCode);
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie o código para realizar o pagamento.",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar código PIX",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startPixPolling = (code) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await apiService.checkPixStatus(code);
        
        if (response.success) {
          if (response.paymentStatus === 'approved') {
            clearInterval(pollingIntervalRef.current);
            setPaymentStatus('approved');
            toast({
              title: "Pagamento aprovado!",
              description: "Seu pedido foi confirmado com sucesso.",
              duration: 5000,
            });
          } else if (response.paymentStatus === 'expired' || response.paymentStatus === 'failed') {
            clearInterval(pollingIntervalRef.current);
            setPaymentStatus(response.paymentStatus);
            toast({
              title: "Pagamento não realizado",
              description: response.paymentStatus === 'expired' 
                ? "O código PIX expirou. Gere um novo código."
                : "Houve um erro no pagamento.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status do PIX:', error);
      }
    }, 3000);
  };

  useEffect(() => {
    if (produto && paymentMethod === 'pix' && !pixCode) {
      generatePixPayment();
    }
  }, [produto, paymentMethod]);

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixLink);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "O link de pagamento foi copiado para a área de transferência",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validateCardData = () => {
    if (cardData.number.replace(/\s/g, '').length !== 16) {
      toast({
        title: "Erro",
        description: "Número do cartão inválido",
        variant: "destructive",
      });
      return false;
    }
    
    if (!cardData.name || cardData.name.length < 3) {
      toast({
        title: "Erro",
        description: "Nome do titular inválido",
        variant: "destructive",
      });
      return false;
    }
    
    if (cardData.expiry.length !== 5) {
      toast({
        title: "Erro",
        description: "Data de validade inválida",
        variant: "destructive",
      });
      return false;
    }
    
    if (cardData.cvv.length < 3) {
      toast({
        title: "Erro",
        description: "CVV inválido",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    
    if (!validateCardData()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const response = await apiService.checkoutCartao(id, {
        quantity: quantity,
        cardNumber: cardData.number.replace(/\s/g, ''),
        cardName: cardData.name,
        cvv: cardData.cvv,
        expiryDate: cardData.expiry
      });
      
      if (response.success) {
        setPaymentStatus('approved');
        toast({
          title: "Pagamento aprovado!",
          description: "Seu pedido foi confirmado com sucesso.",
          duration: 5000,
        });
        
        setTimeout(() => {
          navigate('/perfil?tab=orders');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      setPaymentStatus('failed');
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBoletoPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await apiService.checkoutBoleto(id, quantity);
      
      if (response.success) {
        setPaymentStatus('approved');
        toast({
          title: "Boleto gerado!",
          description: "Seu pedido foi confirmado. O boleto foi enviado para seu e-mail.",
          duration: 5000,
        });
        
        setTimeout(() => {
          navigate('/perfil?tab=orders');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao gerar boleto:', error);
      setPaymentStatus('failed');
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o boleto",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTimeRemaining = () => {
    if (!pixExpiresAt) return null;
    
    const now = new Date();
    const diff = pixExpiresAt - now;
    
    if (diff <= 0) return 'Expirado';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!produto) {
    return null;
  }

  const finalPrice = produto.discount > 0 
    ? produto.price * (1 - produto.discount / 100) 
    : produto.price;
  
  const totalPrice = finalPrice * quantity;

  const paymentMethods = [
    { id: 'pix', name: 'Pix', icon: PixIcon },
    { id: 'card', name: 'Cartão de Crédito', icon: CreditCard },
    { id: 'boleto', name: 'Boleto', icon: FileText }
  ];

  if (paymentStatus === 'approved') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="max-w-md mx-auto"
        >
          <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Pagamento Confirmado!</h1>
          <p className="text-gray-600 mb-6">
            Seu pedido foi confirmado com sucesso e será processado em breve.
          </p>
          <Button onClick={() => navigate('/perfil?tab=orders')}>
            Ver meus pedidos
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Método de Pagamento</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        setPaymentMethod(method.id);
                        setPaymentStatus(null);
                        if (pollingIntervalRef.current) {
                          clearInterval(pollingIntervalRef.current);
                        }
                      }}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={isProcessing}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{method.name}</span>
                    </button>
                  );
                })}
              </div>

              <Separator className="my-6" />

              <AnimatePresence mode="wait">
                {paymentMethod === 'pix' && (
                  <motion.div
                    key="pix"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Pagamento via Pix</h3>
                    
                    {isProcessing && !qrCodeUrl ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Gerando código PIX...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        {qrCodeUrl && (
                          <div className="mb-4">
                            <img 
                              src={qrCodeUrl} 
                              alt="QR Code Pix" 
                              className="mx-auto border-4 border-gray-200 rounded-lg"
                            />
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-600 mb-4">
                          Escaneie o QR Code com o app do seu banco ou copie o link
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <p className="text-xs text-gray-600 mb-2">Link de pagamento:</p>
                          <div className="flex items-center gap-2">
                            <Input 
                              value={pixLink} 
                              readOnly 
                              className="text-xs font-mono"
                            />
                            <Button
                              size="sm"
                              onClick={handleCopyPixCode}
                              variant="outline"
                            >
                              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Expira em: {getTimeRemaining()}</span>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            Aguardando pagamento... A página será atualizada automaticamente quando o pagamento for confirmado.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {paymentMethod === 'card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Dados do Cartão</h3>
                    
                    <form onSubmit={handleCardPayment} className="space-y-4">
                      <div>
                        <Label htmlFor="number">Número do Cartão</Label>
                        <Input
                          id="number"
                          name="number"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={handleCardInputChange}
                          required
                          disabled={isProcessing}
                        />
                      </div>

                      <div>
                        <Label htmlFor="name">Nome no Cartão</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="NOME COMPLETO"
                          value={cardData.name}
                          onChange={handleCardInputChange}
                          required
                          disabled={isProcessing}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Validade</Label>
                          <Input
                            id="expiry"
                            name="expiry"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={handleCardInputChange}
                            required
                            disabled={isProcessing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={handleCardInputChange}
                            required
                            disabled={isProcessing}
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        className="w-full"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processando...' : 'Finalizar Pagamento'}
                      </Button>
                    </form>
                  </motion.div>
                )}

                {paymentMethod === 'boleto' && (
                  <motion.div
                    key="boleto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Pagamento via Boleto</h3>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        O boleto será gerado após a confirmação do pedido e enviado para seu e-mail.
                      </p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                      <div className="flex items-start">
                        <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span>Vencimento em 3 dias úteis</span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span>Pagável em qualquer banco ou lotérica</span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span>Compensação em até 2 dias úteis</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleBoletoPayment} 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processando...' : 'Gerar Boleto'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-primary/5 rounded-lg p-4 flex items-center">
              <ShieldCheck className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                Suas informações estão protegidas e criptografadas
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
              
              <div className="flex gap-4 mb-4">
                <img 
                  src={produto.imageMain} 
                  alt={produto.name}
                  className="w-20 h-20 object-contain border rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">{produto.name}</h3>
                  <p className="text-xs text-gray-500">{produto.seller}</p>
                  <div className="mt-2">
                    <Label htmlFor="quantity" className="text-xs">Quantidade:</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={produto.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(produto.stock, parseInt(e.target.value) || 1)))}
                      className="w-20 h-8 mt-1"
                      disabled={isProcessing || paymentMethod === 'pix'}
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({quantity}x)</span>
                  <span>R$ {(produto.price * quantity).toFixed(2)}</span>
                </div>
                
                {produto.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto ({produto.discount}%)</span>
                    <span>- R$ {(produto.price * quantity * produto.discount / 100).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete</span>
                  <span className="text-green-600">Grátis</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;