import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';
import ProfileTab from '@/components/profile/ProfileTab';
import OrdersTab from '@/components/profile/OrdersTab';
import ProductsTab from '@/components/profile/ProductsTab';

const ProfilePage = () => {
  const { user, updateProfile, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    rua: '',
    cidade: '',
    estado: '',
    cep: '',
    bio: '',
    profilePicture: '',
    shareInfo: {
      email: false,
      phone: false,
      estado: false,
      cidade: false,
      cep: false
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [myProducts, setMyProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Buscar dados do perfil da API
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingProfile(true);
        const response = await apiService.getMe();
        
        if (response.success && response.data) {
          const userData = response.data;
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            rua: userData.rua || '',
            cidade: userData.cidade || '',
            estado: userData.estado || '',
            cep: userData.cep || '',
            bio: userData.bio || '',
            shareInfo: userData.shareInfo || {
              email: false,
              phone: false,
              estado: false,
              cidade: false,
              cep: false
            }
          });
        } else {
          toast({
            title: "Erro ao carregar perfil",
            description: response.message || "Não foi possível carregar suas informações",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: error.message || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated, toast]);

  // Buscar produtos do usuário
  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingProducts(true);
        const response = await apiService.getMyProducts();
        
        if (response.success) {
          setMyProducts(response.data);
        } else {
          toast({
            title: "Erro ao carregar produtos",
            description: response.message || "Não foi possível carregar seus produtos",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: error.message || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchMyProducts();
  }, [isAuthenticated, toast]);

  // Buscar pedidos do usuário
  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingOrders(true);
        const response = await apiService.getMyOrders();
        
        if (response.success) {
          setOrders(response.data);
        } else {
          toast({
            title: "Erro ao carregar pedidos",
            description: response.message || "Não foi possível carregar seus pedidos",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        toast({
          title: "Erro ao carregar pedidos",
          description: error.message || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchMyOrders();
  }, [isAuthenticated, toast]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShareInfoToggle = (field) => {
    setProfileData(prev => ({
      ...prev,
      shareInfo: {
        ...prev.shareInfo,
        [field]: !prev.shareInfo[field]
      }
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const response = await apiService.updateUser('me', profileData);
      
      if (response.success) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
          duration: 3000,
        });
        
        setIsEditing(false);
        
        const updatedResponse = await apiService.getMe();
        if (updatedResponse.success && updatedResponse.data) {
          const userData = updatedResponse.data;
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            rua: userData.rua || '',
            cidade: userData.cidade || '',
            estado: userData.estado || '',
            cep: userData.cep || '',
            bio: userData.bio || '',
            shareInfo: userData.shareInfo || {
              email: false,
              phone: false,
              estado: false,
              cidade: false,
              cep: false
            }
          });
        }
      } else {
        throw new Error(response.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar perfil",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      const response = await apiService.deleteProduct(productId);
      
      if (response.success) {
        setMyProducts(prev => prev.filter(product => product.id !== productId));
        toast({
          title: "Produto excluído",
          description: "O produto foi removido com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao excluir produto",
          description: response.message || "Não foi possível excluir o produto",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro ao excluir produto",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/produto/${productId}`);
  };

  const handleEditProduct = (productId) => {
    navigate(`/vender?edit=${productId}`);
  };

  const handleViewOrder = (order) => {
    if (order.products && order.products.length > 0) {
      const firstProduct = order.products.find(product => product.id && !product.deleted);
      
      if (firstProduct && firstProduct.id) {
        navigate(`/produto/${firstProduct.id}`);
      } else {
        toast({
          title: "Produto não disponível",
          description: "Os produtos deste pedido não estão mais disponíveis.",
          variant: "destructive",
        });
      }
    }
  };

  const handleProfilePictureUpdate = async (newPictureUrl) => {
    if (user) {
      user.profilePicture = newPictureUrl;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'entregue': 'bg-green-100 text-green-800',
      'em trânsito': 'bg-blue-100 text-blue-800',
      'em transito': 'bg-blue-100 text-blue-800',
      'processando': 'bg-yellow-100 text-yellow-800',
      'pendente': 'bg-yellow-100 text-yellow-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="orders">Meus Pedidos</TabsTrigger>
          <TabsTrigger value="selling">Meus Produtos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileTab
            user={user}
            profileData={profileData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleChange={handleChange}
            handleSaveProfile={handleSaveProfile}
            isSaving={isSaving}
            isLoadingProfile={isLoadingProfile}
            handleLogout={handleLogout}
            formatDate={formatDate}
            onProfilePictureUpdate={handleProfilePictureUpdate}
            handleShareInfoToggle={handleShareInfoToggle}
          />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersTab
            orders={orders}
            isLoadingOrders={isLoadingOrders}
            handleViewOrder={handleViewOrder}
            getStatusColor={getStatusColor}
          />
        </TabsContent>
        
        <TabsContent value="selling">
          <ProductsTab
            myProducts={myProducts}
            isLoadingProducts={isLoadingProducts}
            handleViewProduct={handleViewProduct}
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            navigate={navigate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;