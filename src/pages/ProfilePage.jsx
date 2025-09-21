import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Package, CreditCard, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const ProfilePage = () => {
  const { user, logout, isAuthenticated, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    estado: '',
    cidade: '',
    rua: '',
    cep: ''
  });
  
  const [realUserData, setRealUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Estados para dados da API
  const [orders, setOrders] = useState([]);
  const [sellingProducts, setSellingProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Carregar dados reais do usuário via API
  const loadRealUserData = async () => {
    if (!user || !localStorage.getItem('token')) {
      // Se não tiver token, usar dados do localStorage
      if (user) {
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          estado: user.estado || user.state || '',
          cidade: user.cidade || user.city || '',
          rua: user.rua || user.address || '',
          cep: user.cep || user.zipCode || ''
        });
      }
      return;
    }
    
    setLoadingProfile(true);
    try {
      const response = await apiService.getMe();
      const userData = response.data || response;
      setRealUserData(userData);
      
      // Preencher formulário com dados reais
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        estado: userData.estado || '',
        cidade: userData.cidade || '',
        rua: userData.rua || '',
        cep: userData.cep || ''
      });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Se der erro, usar dados do localStorage como fallback
      if (user) {
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          estado: user.estado || user.state || '',
          cidade: user.cidade || user.city || '',
          rua: user.rua || user.address || '',
          cep: user.cep || user.zipCode || ''
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  };
  
  // Buscar pedidos do usuário
  const fetchUserOrders = async () => {
    const userId = realUserData?.id || user?.id;
    if (!userId) return;
    
    setLoadingOrders(true);
    try {
      const response = await apiService.getOrdersByUser(userId);
      setOrders(response.data || response || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };
  
  // Buscar produtos do vendedor
  const fetchSellerProducts = async () => {
    const userEmail = realUserData?.email || user?.email;
    if (!userEmail) return;
    
    setLoadingProducts(true);
    try {
      const response = await apiService.getProductsBySeller(userEmail);
      setSellingProducts(response.data || response || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setSellingProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };
  
  // Carregar dados quando o componente montar
  useEffect(() => {
    if (user) {
      loadRealUserData();
    }
  }, [user]);

  // Carregar pedidos e produtos quando os dados do usuário estiverem disponíveis
  useEffect(() => {
    if (realUserData || user) {
      fetchUserOrders();
      fetchSellerProducts();
    }
  }, [realUserData, user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Tentar atualizar via API usando a nova rota /me
      if (localStorage.getItem('token')) {
        const response = await apiService.updateMe(profileData);
        
        // Atualizar dados reais com a resposta da API
        if (response.data) {
          setRealUserData(response.data);
        }
      }
      
      // Atualizar contexto local (localStorage)
      updateProfile(profileData);
      
      setIsEditing(false);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      
      // Se der erro na API, pelo menos atualizar localmente
      updateProfile(profileData);
      setIsEditing(false);
      
      toast({
        title: "Perfil atualizado localmente",
        description: "Suas informações foram salvas localmente.",
        variant: "default",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };
  
  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0);
    } catch {
      return 'R$ 0,00';
    }
  };
  
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'entregue':
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'em trânsito':
      case 'in_transit':
      case 'shipping':
        return 'bg-blue-100 text-blue-800';
      case 'processando':
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'ativo':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inativo':
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Usar dados reais se disponíveis, senão usar do localStorage
  const currentUser = realUserData || user;
  
  if (!isAuthenticated) {
    return null; // Vai ser redirecionado para login
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Gerencie seus dados pessoais</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {loadingProfile ? (
                  <div className="h-24 w-24 mb-4 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                  </div>
                ) : (
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl bg-primary text-white">
                      {currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">{currentUser.name}</h3>
                  <p className="text-gray-500">{currentUser.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Membro desde {formatDate(currentUser.createdAt)}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isSaving || loadingProfile}
                >
                  {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Detalhes do Perfil</CardTitle>
                <CardDescription>
                  {isEditing ? 'Edite suas informações' : 'Suas informações pessoais'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <span className="ml-2">Carregando dados do perfil...</span>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="name"
                            name="name"
                            value={profileData.name}
                            onChange={handleChange}
                            className="pl-10"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleChange}
                            className="pl-10"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleChange}
                            className="pl-10"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-lg font-medium">Endereço</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rua">Endereço</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="rua"
                          name="rua"
                          value={profileData.rua}
                          onChange={handleChange}
                          className="pl-10"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          name="cidade"
                          value={profileData.cidade}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          name="estado"
                          value={profileData.estado}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          name="cep"
                          value={profileData.cep}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
              {isEditing && !loadingProfile && (
                <CardFooter>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="ml-auto"
                  >
                    {isSaving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Meus Pedidos</CardTitle>
              <CardDescription>Histórico de compras realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                  <span className="ml-2">Carregando pedidos...</span>
                </div>
              ) : orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Pedido</th>
                        <th className="text-left py-3 px-4">Data</th>
                        <th className="text-left py-3 px-4">Total</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Itens</th>
                        <th className="text-right py-3 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id || order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            #{(order._id || order.id || '').slice(-8) || 'N/A'}
                          </td>
                          <td className="py-3 px-4">{formatDate(order.createdAt || order.date)}</td>
                          <td className="py-3 px-4">{formatCurrency(order.total || order.totalAmount || 0)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status || 'Processando'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{order.items?.length || order.quantity || 1}</td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="outline" size="sm">Detalhes</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    Você ainda não realizou nenhuma compra.
                  </p>
                  <Button onClick={() => navigate('/produtos')}>
                    Explorar Produtos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="selling">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Meus Produtos</CardTitle>
                <CardDescription>Produtos que você está vendendo</CardDescription>
              </div>
              <Button onClick={() => navigate('/vender')}>Adicionar Produto</Button>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                  <span className="ml-2">Carregando produtos...</span>
                </div>
              ) : sellingProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Produto</th>
                        <th className="text-left py-3 px-4">Preço</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Categoria</th>
                        <th className="text-right py-3 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellingProducts.map((product) => (
                        <tr key={product._id || product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            #{(product._id || product.id || '').slice(-8) || 'N/A'}
                          </td>
                          <td className="py-3 px-4">{product.name || product.title}</td>
                          <td className="py-3 px-4">{formatCurrency(product.price)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status || 'ativo')}`}>
                              {product.status || 'Ativo'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{product.category}</td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                              onClick={() => navigate(`/produto/${product._id || product.id}`)}
                            >
                              Ver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={async () => {
                                if (confirm('Tem certeza que deseja remover este produto?')) {
                                  try {
                                    await apiService.deleteProduct(product._id || product.id);
                                    fetchSellerProducts(); // Recarregar lista
                                    toast({
                                      title: "Produto removido",
                                      description: "O produto foi removido com sucesso.",
                                      duration: 3000,
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Erro",
                                      description: "Não foi possível remover o produto.",
                                      variant: "destructive",
                                      duration: 3000,
                                    });
                                  }
                                }
                              }}
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    Você ainda não está vendendo nenhum produto.
                  </p>
                  <Button onClick={() => navigate('/vender')}>
                    Começar a Vender
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;