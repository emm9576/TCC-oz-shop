import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  ArrowLeft,
  Package,
  Home,
  Navigation
} from 'lucide-react';

const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Verificar se está visualizando o próprio perfil
  const isOwnProfile = currentUser?.id === id;

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getUserById(id);
        
        if (response.success) {
          setUserData(response.data);
        } else {
          throw new Error(response.message || 'Erro ao carregar perfil');
        }
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        setError(err.message || 'Não foi possível carregar o perfil do usuário');
        
        toast({
          title: 'Erro ao carregar perfil',
          description: err.message || 'Não foi possível carregar os dados do usuário',
          variant: 'destructive',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id, toast]);

  // Buscar produtos do usuário
  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await apiService.getProductsBySeller(id);
        
        if (response.success) {
          setUserProducts(response.data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar produtos do usuário:', err);
        // Não exibe toast de erro para produtos - é opcional
      } finally {
        setLoadingProducts(false);
      }
    };

    if (id) {
      fetchUserProducts();
    }
  }, [id]);

  // Função para obter iniciais do nome
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Função para verificar se um campo existe e não é vazio
  const hasValue = (value) => {
    return value !== undefined && value !== null && value !== '';
  };

  // Renderizar loading
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar erro
  if (error || !userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Perfil não encontrado
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'O usuário que você está procurando não existe ou foi removido.'}
              </p>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Botão voltar */}
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Card principal do perfil */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userData.profilePicture || ""} />
                <AvatarFallback className="text-2xl bg-blue-600 text-white">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
                <div>
                  <CardTitle className="text-2xl mb-2">{userData.name}</CardTitle>
                  {hasValue(userData.role) && (
                    <div className="flex gap-2">
                      <Badge variant={userData.role === 'admin' ? 'destructive' : 'secondary'}>
                        {userData.role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Administrador
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Usuário
                          </>
                        )}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botão de editar perfil (apenas para o próprio usuário) */}
              {isOwnProfile && (
                <Button
                  onClick={() => navigate('/perfil')}
                  variant="outline"
                >
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            {/* Bio - Seção destacada */}
            {hasValue(userData.bio) && (
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-lg mb-3">Sobre</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {userData.bio}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Coluna 1 - Informações disponíveis */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-3">Informações do Usuário</h3>
                
                {/* Nome - sempre presente */}
                {hasValue(userData.name) && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Nome completo</p>
                      <p className="font-medium">{userData.name}</p>
                    </div>
                  </div>
                )}

                {/* Data de criação */}
                {hasValue(userData.createdAt) && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Membro desde</p>
                      <p className="font-medium">{formatDate(userData.createdAt)}</p>
                    </div>
                  </div>
                )}

                {/* Produtos anunciados */}
                <div className="flex items-center gap-3 text-gray-700">
                  <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Produtos anunciados</p>
                    <p className="font-medium">
                      {loadingProducts ? '...' : userProducts.length}
                    </p>
                  </div>
                </div>

                {/* Email */}
                {hasValue(userData.email) && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium break-all">{userData.email}</p>
                    </div>
                  </div>
                )}

                {/* Telefone */}
                {hasValue(userData.phone) && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">{userData.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna 2 - Informações de localização */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-3">Localização</h3>
                
                {/* Cidade e Estado */}
                {(hasValue(userData.cidade) || hasValue(userData.estado)) && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Cidade / Estado</p>
                      <p className="font-medium">
                        {[userData.cidade, userData.estado].filter(hasValue).join(', ') || 'Não informado'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rua */}
                {hasValue(userData.rua) && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Home className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Rua</p>
                      <p className="font-medium">{userData.rua}</p>
                    </div>
                  </div>
                )}

                {/* CEP */}
                {hasValue(userData.cep) && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Navigation className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">CEP</p>
                      <p className="font-medium">{userData.cep}</p>
                    </div>
                  </div>
                )}

                {/* Mensagem quando não há informações de localização */}
                {!hasValue(userData.cidade) && 
                 !hasValue(userData.estado) && 
                 !hasValue(userData.rua) && 
                 !hasValue(userData.cep) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Nenhuma informação de localização disponível.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Card de produtos do usuário */}
        {userProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produtos Anunciados ({userProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProducts.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/produto/${product.id}`)}
                    className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <img
                      src={product.images?.[0] || '/placeholder-product.png'}
                      alt={product.nome}
                      className="w-full h-32 object-cover rounded-md mb-2"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                    <h4 className="font-medium text-sm truncate mb-1">
                      {product.nome}
                    </h4>
                    <p className="text-blue-600 font-bold text-sm">
                      R$ {product.preco?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              {userProducts.length > 6 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/produtos?seller=${id}`)}
                  >
                    Ver todos os produtos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default UserProfilePage;