import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Função para salvar dados de autenticação no localStorage
  const saveAuthData = (userData, token) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1); // 1 dia
    
    setUser(userData);
    
    // Salvar no localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiry', expiryDate.toISOString());
    
    // Configurar token no apiService
    apiService.setToken(token);
  };

  // Função para limpar dados de autenticação
  const clearAuthData = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    apiService.setToken(null);
  };

  // Carregar usuário do localStorage quando o componente montar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedTokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (storedUser && storedToken && storedTokenExpiry) {
      try {
        const userData = JSON.parse(storedUser);
        const expiryDate = new Date(storedTokenExpiry);
        const now = new Date();
        
        if (now < expiryDate) {
          // Token ainda válido
          setUser(userData);
          apiService.setToken(storedToken);
        } else {
          // Token expirado - limpar dados
          clearAuthData();
          toast({
            title: "Sessão expirada",
            description: "Faça login novamente para continuar.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        clearAuthData();
      }
    }
    setLoading(false);
  }, [toast]);

  const login = async (email, password) => {
    try {
      const response = await apiService.login({ email, password });
      
      console.log('Resposta da API:', response); // Para debug - remover depois
      
      // CORREÇÃO: Sua API retorna { success: true, data: { user: {...}, accessToken: "...", refreshToken: "..." } }
      if (response.success && response.data && response.data.accessToken) {
        const token = response.data.accessToken;
        const userData = response.data.user;
        
        saveAuthData(userData, token);
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo(a), ${userData.name || userData.email}!`,
          duration: 3000,
        });
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro completo no login:', error);
      const errorMessage = error.message || 'Erro ao fazer login. Tente novamente.';
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.signup(userData);
      
      if (response.success) {
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Agora você pode fazer login com suas credenciais.",
          duration: 3000,
        });
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Erro no cadastro');
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Se der erro 500 no servidor, apenas logar mas não impedir o logout no frontend
      console.error('Erro no logout (servidor):', error);
    } finally {
      // Sempre limpar os dados locais, independente do erro do servidor
      clearAuthData();
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta.",
        duration: 3000,
      });
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      if (!user) throw new Error('Usuário não logado');
      
      const response = await apiService.updateUser(user.id, updatedData);
      
      if (response.success && response.data) {
        const updatedUser = { ...user, ...response.data };
        const currentToken = localStorage.getItem('token');
        saveAuthData(updatedUser, currentToken);
        
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
          duration: 3000,
        });
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar suas informações.",
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};