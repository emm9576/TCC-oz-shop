import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  FileText, 
  Copy, 
  Check,
  ArrowLeft,
  ShieldCheck,
  Clock
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
  
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduto();
    }
  }, [id]);

  useEffect(() => {
    if (produto && paymentMethod === 'pix') {
      generatePixQRCode();
    }
  }, [produto, paymentMethod]);

  const generatePixQRCode = async () => {
    const siteUrl = window.location.origin;
    const fakePixCode = `00020126580014br.gov.bcb.pix0136${siteUrl.replace(/https?:\/\//, '')}520400005303986540${produto?.price.toFixed(2)}5802BR5925OZ SHOP6009SAO PAULO62070503***6304`;
    
    setPixCode(fakePixCode);
    
    try {
      const qrUrl = await QRCode.toDataURL(siteUrl, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast({
      title: "Código copiado!",
      description: "O código Pix foi copiado para a área de transferência",
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
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Pagamento processado!",
        description: "Seu pedido foi confirmado e será enviado em breve.",
        duration: 5000,
      });
      navigate('/');
    }, 2000);
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

  const paymentMethods = [
    { id: 'pix', name: 'Pix', icon: PixIcon },
    { id: 'card', name: 'Cartão de Crédito', icon: CreditCard },
    { id: 'boleto', name: 'Boleto', icon: FileText }
  ];

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
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
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
                        Escaneie o QR Code com o app do seu banco
                      </p>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-xs text-gray-600 mb-2">Ou copie o código:</p>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={pixCode} 
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
                        <span>Expira em 30 minutos</span>
                      </div>

                      <Button 
                        onClick={handleSubmit} 
                        className="w-full"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
                      </Button>
                    </div>
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
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="number">Número do Cartão</Label>
                        <Input
                          id="number"
                          name="number"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={handleCardInputChange}
                          required
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
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processando...' : 'Finalizar Pagamento'}
                      </Button>
                    </div>
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
                      onClick={handleSubmit} 
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
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>R$ {produto.price.toFixed(2)}</span>
                </div>
                
                {produto.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto ({produto.discount}%)</span>
                    <span>- R$ {(produto.price * produto.discount / 100).toFixed(2)}</span>
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
                  R$ {finalPrice.toFixed(2)}
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