import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiService from '@/services/api';

const PixConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const pixCode = searchParams.get('code');

  useEffect(() => {
    if (!pixCode) {
      setStatus('error');
      setMessage('Código PIX inválido');
      return;
    }

    confirmPayment();
  }, [pixCode]);

  const confirmPayment = async () => {
    try {
      const response = await apiService.confirmPixPayment(pixCode);
      
      if (response.success) {
        setStatus('success');
        setMessage('Pagamento confirmado com sucesso!');
      } else {
        setStatus('error');
        setMessage(response.message || 'Erro ao confirmar pagamento');
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      setStatus('error');
      setMessage(error.message || 'Não foi possível confirmar o pagamento. O código pode ter expirado.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Processando pagamento...</h1>
            <p className="text-gray-600">
              Aguarde enquanto confirmamos seu pagamento PIX.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Pagamento Confirmado!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              O comprador será notificado automaticamente sobre a confirmação do pagamento.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Voltar para a página inicial
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <XCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Erro no Pagamento</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Voltar para a página inicial
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default PixConfirmPage;