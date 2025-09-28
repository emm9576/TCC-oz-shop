import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Base URL da API
  const API_BASE_URL = 'http://localhost:3000/api';

  // Carregar usuário do localStorage quando o componente montar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar o usuário:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/account/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.setItem('token', data.token);
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo(a), ${data.data.name}!`,
          duration: 3000,
        });
        
        return { success: true };
      } else {
        toast({
          title: "Erro no login",
          description: data.message,
          variant: "destructive",
          duration: 3000,
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Erro de conexão com o servidor.",
        variant: "destructive",
        duration: 3000,
      });
      return { success: false, message: "Erro de conexão" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/account/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Sua conta foi criada com sucesso!",
          duration: 3000,
        });
        
        return { success: true };
      } else {
        toast({
          title: "Erro no cadastro",
          description: data.message,
          variant: "destructive",
          duration: 3000,
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Erro de conexão com o servidor.",
        variant: "destructive",
        duration: 3000,
      });
      return { success: false, message: "Erro de conexão" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    
    // Se tiver token, tentar fazer logout na API
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/account/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Erro no logout da API:', error);
      }
    }
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
      duration: 3000,
    });
  };

  const updateProfile = async (updatedData) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para atualizar o perfil.",
        variant: "destructive",
        duration: 3000,
      });
      return { success: false };
    }

    setLoading(true);
    
    try {
      // Assumindo que existe uma rota para atualizar perfil
      const response = await fetch(`${API_BASE_URL}/account/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
          duration: 3000,
        });
        
        return { success: true };
      } else {
        toast({
          title: "Erro ao atualizar perfil",
          description: data.message,
          variant: "destructive",
          duration: 3000,
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Erro de conexão com o servidor.",
        variant: "destructive",
        duration: 3000,
      });
      return { success: false, message: "Erro de conexão" };
    } finally {
      setLoading(false);
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