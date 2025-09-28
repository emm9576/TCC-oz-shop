import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Package, CreditCard, LogOut, Save, Edit, Trash2, Eye } from 'lucide-react';
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
    cep: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [myProducts, setMyProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
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
            cep: userData.cep || ''
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        setIsEditing(false);
        // Recarregar dados do perfil após atualização
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
            cep: userData.cep || ''
          });
        }
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
        // Remover produto da lista local
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

  // Função para formatar data
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
  
  // Dados simulados de pedidos
  const orders = [
    {
      id: '1001',
      date: '15/05/2023',
      total: 1299.99,
      status: 'Entregue',
      items: 3
    },
    {
      id: '1002',
      date: '28/06/2023',
      total: 499.50,
      status: 'Em trânsito',
      items: 1
    },
    {
      id: '1003',
      date: '10/07/2023',
      total: 899.90,
      status: 'Processando',
      items: 2
    }
  ];
  
  if (!user) {
    return null; // Não renderizar nada enquanto redireciona
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
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Membro desde {formatDate(user.createdAt)}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isLoadingProfile}
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
                {isLoadingProfile ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-r-transparent mb-4"></div>
                    <p className="text-gray-500">Carregando informações...</p>
                  </div>
                ) : (
                  <form className="space-y-4">
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
                      <Label htmlFor="rua">Rua/Endereço</Label>
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
              {isEditing && !isLoadingProfile && (
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
              {orders.length > 0 ? (
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
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">#{order.id}</td>
                          <td className="py-3 px-4">{order.date}</td>
                          <td className="py-3 px-4">R$ {order.total.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'Entregue' 
                                ? 'bg-green-100 text-green-800' 
                                : order.status === 'Em trânsito'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{order.items}</td>
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
                  <Button asChild>
                    <a href="/produtos">Explorar Produtos</a>
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
              {isLoadingProducts ? (
                <div className="text-center py-8">
                  <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-r-transparent mb-4"></div>
                  <p className="text-gray-500">Carregando seus produtos...</p>
                </div>
              ) : myProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Produto</th>
                        <th className="text-left py-3 px-4">Preço</th>
                        <th className="text-left py-3 px-4">Estoque</th>
                        <th className="text-left py-3 px-4">Rating</th>
                        <th className="text-left py-3 px-4">Categoria</th>
                        <th className="text-right py-3 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">#{product.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              {product.imageMain && (
                                <img 
                                  src={product.imageMain} 
                                  alt={product.name}
                                  className="h-10 w-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              R$ {product.price?.toFixed(2)}
                              {product.discount > 0 && (
                                <div className="text-sm text-green-600">
                                  -{product.discount}% desc.
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.stock > 10 
                                ? 'bg-green-100 text-green-800' 
                                : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stock > 0 ? `${product.stock} un.` : 'Sem estoque'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400">★</span>
                              <span>{product.rating?.toFixed(1) || '0.0'}</span>
                              <span className="text-sm text-gray-500">
                                ({product.reviews || 0})
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewProduct(product.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditProduct(product.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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