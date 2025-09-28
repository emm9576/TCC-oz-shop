import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar usuário do localStorage quando o componente montar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Já configura o token no apiService
        apiService.setToken(storedToken);
      } catch (error) {
        console.error('Erro ao carregar o usuário:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Salvar dados do usuário e token
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (token) {
      localStorage.setItem('token', token);
      apiService.setToken(token);
    }
    
    return true;
  };

  const register = async (userData) => {
    try {
      const response = await apiService.signup(userData);
      
      if (response.success) {
        // Após cadastro bem-sucedido, fazer login automaticamente
        const loginResponse = await apiService.login({
          email: userData.email,
          password: userData.password
        });
        
        if (loginResponse.success) {
          login(loginResponse.data, loginResponse.token);
          
          toast({
            title: "Cadastro realizado com sucesso",
            description: "Sua conta foi criada e você já está logado.",
            duration: 3000,
          });
          
          return true;
        }
      }
      
      toast({
        title: "Erro no cadastro",
        description: response.message || "Erro ao criar conta.",
        variant: "destructive",
        duration: 3000,
      });
      
      return false;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
      
      return false;
    }
  };

  const logout = async () => {
    try {
      // Tentar fazer logout na API se estiver autenticado
      if (user) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Erro ao fazer logout na API:', error);
    } finally {
      // Sempre limpar dados locais
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      apiService.setToken(null);
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta.",
        duration: 3000,
      });
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      if (!user) {
        throw new Error('Usuário não está logado');
      }

      // Atualizar via API
      const response = await apiService.updateUser(user.id, updatedData);
      
      if (response.success) {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
          duration: 3000,
        });
        
        return true;
      } else {
        throw new Error(response.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Erro ao atualizar informações. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
      
      return false;
    }
  };

  const deleteAccount = async (password) => {
    try {
      if (!user) {
        throw new Error('Usuário não está logado');
      }

      const response = await apiService.deleteAccount(password);
      
      if (response.success) {
        // Limpar dados locais após exclusão
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        apiService.setToken(null);
        
        toast({
          title: "Conta excluída",
          description: "Sua conta foi excluída com sucesso.",
          duration: 3000,
        });
        
        return true;
      } else {
        throw new Error(response.message || 'Erro ao excluir conta');
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      
      toast({
        title: "Erro ao excluir conta",
        description: error.message || "Erro ao excluir conta. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
      
      return false;
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
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};