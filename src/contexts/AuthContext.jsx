import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar usuário do localStorage quando o componente montar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar o usuário:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Simulando autenticação com localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    toast({
      title: "Login realizado com sucesso",
      description: `Bem-vindo(a), ${userData.name}!`,
      duration: 3000,
    });
    
    return true;
  };

  const register = (userData) => {
    // Simulando registro com localStorage
    // Em uma aplicação real, isso seria feito com uma API
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Verificar se o email já está em uso
    if (users.some(u => u.email === userData.email)) {
      toast({
        title: "Erro no cadastro",
        description: "Este email já está em uso.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Fazer login automaticamente após o registro
    login(newUser);
    
    toast({
      title: "Cadastro realizado com sucesso",
      description: "Sua conta foi criada e você já está logado.",
      duration: 3000,
    });
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
      duration: 3000,
    });
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Atualizar também na lista de usuários
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, ...updatedData } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
      duration: 3000,
    });
    
    return true;
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