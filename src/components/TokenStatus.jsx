import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Shield, AlertTriangle, User, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TokenStatus = ({ className = '' }) => {
  const { isAuthenticated, user } = useAuth();
  const [authInfo, setAuthInfo] = useState({
    hasUser: false,
    hasUsersDb: false,
    userCreatedAt: null,
    sessionDuration: 0,
    usersCount: 0
  });

  const updateAuthInfo = () => {
    const storedUser = localStorage.getItem('user');
    const storedUsers = localStorage.getItem('users');
    
    let userCreatedAt = null;
    let sessionDuration = 0;
    let usersCount = 0;

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        userCreatedAt = userData.createdAt ? new Date(userData.createdAt) : null;
        if (userCreatedAt) {
          sessionDuration = Date.now() - userCreatedAt.getTime();
        }
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
      }
    }

    if (storedUsers) {
      try {
        const usersData = JSON.parse(storedUsers);
        usersCount = Array.isArray(usersData) ? usersData.length : 0;
      } catch (error) {
        console.error('Erro ao parsear lista de usuários:', error);
      }
    }

    setAuthInfo({
      hasUser: !!storedUser,
      hasUsersDb: !!storedUsers,
      userCreatedAt,
      sessionDuration,
      usersCount
    });
  };

  useEffect(() => {
    updateAuthInfo();
    
    // Atualizar a cada 5 segundos (menos frequente que tokens)
    const interval = setInterval(updateAuthInfo, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const formatDuration = (milliseconds) => {
    if (milliseconds <= 0) return 'Agora';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const clearLocalData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('users');
    window.location.reload(); // Recarregar para atualizar estado
  };

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Status da Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="secondary">Não autenticado</Badge>
          
          {authInfo.hasUsersDb && (
            <div className="text-xs text-gray-500">
              {authInfo.usersCount} usuário(s) cadastrado(s)
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          Status da Autenticação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Usuário Logado:</span>
          <Badge variant="success">
            {authInfo.hasUser ? 'Sim' : 'Não'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Sistema:</span>
          <Badge variant="secondary">
            localStorage
          </Badge>
        </div>

        {user && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nome:</span>
              <span className="text-sm text-gray-800 font-medium">
                {user.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm text-gray-800">
                {user.email}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ID:</span>
              <span className="text-sm text-gray-500 font-mono">
                {user.id}
              </span>
            </div>
          </>
        )}

        {authInfo.userCreatedAt && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conta criada:</span>
              <span className="text-sm text-gray-800">
                {authInfo.userCreatedAt.toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tempo de sessão:</span>
              <span className="text-sm text-green-600 font-mono">
                {formatDuration(authInfo.sessionDuration)}
              </span>
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Database className="h-3 w-3" />
            Usuários cadastrados:
          </span>
          <span className="text-sm text-gray-800">
            {authInfo.usersCount}
          </span>
        </div>

        {/* Botão para limpar dados locais */}
        <div className="pt-2 border-t">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={clearLocalData}
            className="w-full text-xs"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Limpar Dados Locais
          </Button>
        </div>

        {/* Nota sobre o sistema */}
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border">
          💡 <strong>Sistema atual:</strong> localStorage (mock). 
          Sessão persiste até limpar navegador.
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenStatus;