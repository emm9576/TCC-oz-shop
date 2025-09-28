import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

const TokenStatus = ({ className = '' }) => {
  const { isAuthenticated, getTokenTimeRemaining } = useAuth();
  const [tokenInfo, setTokenInfo] = useState({
    hasToken: false,
    hasRefreshToken: false,
    expiresIn: null,
    timeRemaining: 0,
    isExpired: false,
    isExpiringSoon: false
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateTokenInfo = () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const expiresIn = localStorage.getItem('expiresIn');
    
    const currentTime = Date.now();
    const expirationTime = expiresIn ? parseInt(expiresIn) : 0;
    const timeRemaining = Math.max(0, expirationTime - currentTime);
    const isExpired = currentTime >= expirationTime;
    const fiveMinutes = 5 * 60 * 1000;
    const isExpiringSoon = timeRemaining > 0 && timeRemaining < fiveMinutes;

    setTokenInfo({
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      expiresIn: expirationTime,
      timeRemaining,
      isExpired,
      isExpiringSoon
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setTokenInfo({
        hasToken: false,
        hasRefreshToken: false,
        expiresIn: null,
        timeRemaining: 0,
        isExpired: false,
        isExpiringSoon: false
      });
      return;
    }

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000); // Atualizar a cada segundo

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return 'Expirado';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = () => {
    if (!tokenInfo.hasToken) return 'secondary';
    if (tokenInfo.isExpired) return 'destructive';
    if (tokenInfo.isExpiringSoon) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (!tokenInfo.hasToken) return <Shield className="h-4 w-4" />;
    if (tokenInfo.isExpired) return <AlertTriangle className="h-4 w-4" />;
    if (tokenInfo.isExpiringSoon) return <Clock className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      await apiService.refreshTokenManually();
      updateTokenInfo();
    } catch (error) {
      console.error('Erro ao renovar token:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Status do Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Não autenticado</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {getStatusIcon()}
          Status do Token
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Access Token:</span>
          <Badge variant={getStatusColor()}>
            {tokenInfo.hasToken ? 'Presente' : 'Ausente'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Refresh Token:</span>
          <Badge variant={tokenInfo.hasRefreshToken ? 'success' : 'destructive'}>
            {tokenInfo.hasRefreshToken ? 'Presente' : 'Ausente'}
          </Badge>
        </div>

        {tokenInfo.hasToken && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant={getStatusColor()}>
                {tokenInfo.isExpired 
                  ? 'Expirado' 
                  : tokenInfo.isExpiringSoon 
                    ? 'Expirando em breve' 
                    : 'Válido'
                }
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tempo restante:</span>
              <span className={`text-sm font-mono ${
                tokenInfo.isExpired 
                  ? 'text-red-600' 
                  : tokenInfo.isExpiringSoon 
                    ? 'text-orange-600' 
                    : 'text-green-600'
              }`}>
                {formatTimeRemaining(tokenInfo.timeRemaining)}
              </span>
            </div>

            {tokenInfo.expiresIn && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expira em:</span>
                <span className="text-sm text-gray-800">
                  {new Date(tokenInfo.expiresIn).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </>
        )}

        {tokenInfo.hasRefreshToken && (tokenInfo.isExpired || tokenInfo.isExpiringSoon) && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefreshToken}
            disabled={isRefreshing}
            className="w-full mt-3"
          >
            {isRefreshing ? (
              <>
                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"></div>
                Renovando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Renovar Token
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenStatus;