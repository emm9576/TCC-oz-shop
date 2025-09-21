// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Verificar se há um token válido e carregar dados do usuário
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Tentar obter dados do usuário atual
          const response = await apiService.getMe();
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          // Token inválido ou expirado, remover
          localStorage.removeItem('token');
          apiService.setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.success) {
        setUser(response.data);
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo(a), ${response.data.name}!`,
          duration: 3000,
        });
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao fazer login';
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.signup(userData);
      
      if (response.success) {
        // Após criar a conta, fazer login automaticamente
        const loginResponse = await apiService.login({
          email: userData.email,
          password: userData.password
        });
        
        if (loginResponse.success) {
          setUser(loginResponse.data);
          
          toast({
            title: "Cadastro realizado com sucesso",
            description: "Sua conta foi criada e você já está logado.",
            duration: 3000,
          });
          
          return { success: true };
        }
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao criar conta';
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta.",
        duration: 3000,
      });
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      if (!user?.id) {
        throw new Error('Usuário não encontrado');
      }

      const response = await apiService.updateUser(user.id, updatedData);
      
      if (response.success) {
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
          duration: 3000,
        });
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao atualizar perfil';
      
      toast({
        title: "Erro ao atualizar perfil",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    }
  };

  const deleteAccount = async (password) => {
    try {
      const response = await apiService.deleteAccount(password);
      
      if (response.success) {
        setUser(null);
        
        toast({
          title: "Conta deletada",
          description: "Sua conta foi deletada com sucesso.",
          duration: 3000,
        });
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao deletar conta';
      
      toast({
        title: "Erro ao deletar conta",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      
      return { success: false, message: errorMessage };
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await apiService.getMe();
      if (response.success) {
        setUser(response.data);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      return { success: false, message: error.message };
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
      deleteAccount,
      refreshUserData,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};