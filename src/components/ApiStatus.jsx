// src/components/ApiStatus.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import apiService from '@/services/api';

const ApiStatus = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const checkApiConnection = async () => {
    setStatus('checking');
    setError(null);
    
    try {
      // Tenta fazer uma requisição simples para verificar se a API está funcionando
      // Usando endpoint de produtos que não requer autenticação
      await apiService.getProducts({ limit: 1 });
      
      setStatus('connected');
      setLastCheck(new Date());
    } catch (err) {
      setStatus('disconnected');
      setError(err.message);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkApiConnection();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkApiConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Verificando conexão...';
      case 'connected':
        return 'API conectada';
      case 'disconnected':
        return 'API desconectada';
      default:
        return 'Status desconhecido';
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'disconnected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (status === 'connected') {
    return null; // Não mostrar quando está tudo OK
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert variant={getStatusVariant()}>
        {getStatusIcon()}
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium">{getStatusText()}</div>
            {error && (
              <div className="text-xs mt-1 opacity-80">
                {error.includes('fetch') || error.includes('network') || error.includes('ECONNREFUSED') 
                  ? 'Verifique se o servidor da API está rodando na porta 3000'
                  : error
                }
              </div>
            )}
            {lastCheck && (
              <div className="text-xs mt-1 opacity-60">
                Última verificação: {lastCheck.toLocaleTimeString()}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkApiConnection}
            disabled={status === 'checking'}
            className="ml-2 p-1 h-6 w-6"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
      
      {status === 'disconnected' && (
        <div className="mt-2 text-xs bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="text-yellow-800 font-medium mb-1">
            Para usar a aplicação completa:
          </div>
          <ol className="text-yellow-700 space-y-1 text-xs">
            <li>1. Certifique-se que o servidor da API está rodando</li>
            <li>2. Verifique se a porta 3000 está disponível</li>
            <li>3. Confirme que o endpoint http://localhost:3000 está acessível</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default ApiStatus;