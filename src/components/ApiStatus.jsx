// src/components/ApiStatus.jsx
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import apiService from '@/services/api';

const ApiStatus = () => {
  const [status, setStatus] = useState('connected'); // 'checking', 'connected', 'disconnected'
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const lastSuccessfulRequest = useRef(null);
  
  // Pegar URL da API do .env
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const API_PORT = API_BASE_URL.split(':').pop() || '3000';

  const checkApiConnection = async (isManual = false) => {
    if (isManual) {
      setStatus('checking');
    }
    setError(null);
    
    try {
      // Usar uma requisição mais leve - apenas verificar se o servidor responde
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET', // Apenas verifica se o endpoint existe, sem baixar dados
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // Timeout de 5 segundos
      });

      if (response.ok) {
        setStatus('connected');
        setError(null);
        lastSuccessfulRequest.current = new Date();
      } else {
        throw new Error(`Servidor retornou status ${response.status}`);
      }
      
      setLastCheck(new Date());
    } catch (err) {
      console.warn('API Status check failed:', err.message);
      setStatus('disconnected');
      
      // Classificar tipos de erro
      let errorMessage = err.message;
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Não foi possível conectar com o servidor';
      } else if (err.name === 'TimeoutError') {
        errorMessage = 'Timeout - servidor não respondeu em 5 segundos';
      } else if (err.message.includes('ECONNREFUSED')) {
        errorMessage = 'Conexão recusada - servidor pode estar desligado';
      }
      
      setError(errorMessage);
      setLastCheck(new Date());
    }
  };

  // Interceptar requisições da API para monitorar status
  useEffect(() => {
    // Salvar o fetch original
    const originalFetch = window.fetch;
    
    // Interceptar todas as requisições fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Se a requisição for para nossa API e for bem-sucedida
        const url = args[0];
        if (typeof url === 'string' && url.includes('/api/')) {
          if (response.ok) {
            // API está funcionando
            if (status !== 'connected') {
              setStatus('connected');
              setError(null);
              lastSuccessfulRequest.current = new Date();
            }
          } else if (response.status >= 500) {
            // Erro do servidor
            setStatus('disconnected');
            setError(`Erro do servidor: ${response.status}`);
          }
        }
        
        return response;
      } catch (err) {
        // Se a requisição for para nossa API e falhar
        const url = args[0];
        if (typeof url === 'string' && url.includes('/api/')) {
          setStatus('disconnected');
          setError(err.message);
        }
        throw err;
      }
    };

    // Restaurar fetch original quando o componente desmontar
    return () => {
      window.fetch = originalFetch;
    };
  }, [status]);

  // Monitorar status de conexão da internet
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Verificar API quando voltar online
      setTimeout(() => checkApiConnection(), 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus('disconnected');
      setError('Sem conexão com a internet');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificação inicial
  useEffect(() => {
    checkApiConnection();
  }, []);

  // Monitorar mudanças de foco da janela para verificar reconexão
  useEffect(() => {
    const handleFocus = () => {
      if (status === 'disconnected' && isOnline) {
        checkApiConnection();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status, isOnline]);

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-red-600" />;
    }

    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Wifi className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) {
      return 'Sem internet';
    }

    switch (status) {
      case 'checking':
        return 'Verificando conexão...';
      case 'connected':
        return 'Servidor conectado';
      case 'disconnected':
        return 'Servidor desconectado';
      default:
        return 'Status desconhecido';
    }
  };

  const getStatusVariant = () => {
    if (!isOnline || status === 'disconnected') {
      return 'destructive';
    }
    return 'default';
  };

  // Só mostrar quando há problema ou está verificando
  if (status === 'connected' && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert variant={getStatusVariant()}>
        {getStatusIcon()}
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium">{getStatusText()}</div>
            {error && (
              <div className="text-xs mt-1 opacity-80">
                {error}
              </div>
            )}
            {lastCheck && (
              <div className="text-xs mt-1 opacity-60">
                Última verificação: {lastCheck.toLocaleTimeString()}
              </div>
            )}
            {lastSuccessfulRequest.current && status === 'disconnected' && (
              <div className="text-xs mt-1 opacity-60">
                Última conexão: {lastSuccessfulRequest.current.toLocaleTimeString()}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => checkApiConnection(true)}
            disabled={status === 'checking' || !isOnline}
            className="ml-2 p-1 h-6 w-6"
            title="Verificar conexão manualmente"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ApiStatus;