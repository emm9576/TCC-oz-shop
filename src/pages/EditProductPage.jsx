// src/pages/EditProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Plus, 
  DollarSign,
  Package,
  Truck,
  Tag,
  FileText,
  Loader2,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const EditProductPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discount: '',
    stock: '',
    imageMain: '',
    images: [],
    features: [],
    freteGratis: false,
  });
  const [currentFeature, setCurrentFeature] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [permissionError, setPermissionError] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { fetchProductById, updateProduct } = useProducts();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Categorias disponíveis
  const categories = [
    { value: 'Electronics', label: 'Eletrônicos' },
    { value: 'Fashion', label: 'Moda' },
    { value: 'Home', label: 'Casa e Decoração' },
    { value: 'Sports', label: 'Esportes' },
    { value: 'Beauty', label: 'Beleza e Saúde' },
    { value: 'Books', label: 'Livros' },
    { value: 'Automotive', label: 'Automotivo' },
  ];

  // Carregar produto
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const result = await fetchProductById(id);
        
        if (result.success) {
          const productData = result.data;
          setProduct(productData);
          
          // Preencher formulário com dados do produto
          setFormData({
            name: productData.name || '',
            description: productData.description || '',
            category: productData.category || '',
            price: productData.price?.toString() || '',
            discount: productData.discount?.toString() || '0',
            stock: productData.stock?.toString() || '',
            imageMain: productData.imageMain || productData.image || '',
            images: productData.images || [],
            features: productData.features || [],
            freteGratis: productData.freteGratis || false,
          });
        } else {
          toast({
            title: "Erro",
            description: "Produto não encontrado",
            variant: "destructive",
            duration: 3000,
          });
          navigate('/produtos');
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar produto",
          variant: "destructive",
          duration: 3000,
        });
        navigate('/produtos');
      } finally {
        setLoading(false);
      }
    };

    if (id && isAuthenticated) {
      loadProduct();
    }
  }, [id, isAuthenticated, fetchProductById, navigate, toast]);

  // Verificar permissões
  useEffect(() => {
    /*if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/produto/${id}/edit` } } });
      return;
    }*/

    if (product && user) {
      const isOwner = product.seller === user.name || product.sellerId === user.id;
      const isAdmin = user.role === 'admin' || user.isAdmin;
      
      if (!isOwner && !isAdmin) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para editar este produto",
          variant: "destructive",
          duration: 3000,
        });
        navigate(`/produto/${id}`);
      }
    }
  }, [isAuthenticated, product, user, id, navigate, toast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddFeature = () => {
    if (currentFeature.trim() && !formData.features.includes(currentFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature('');
    }
  };

  const handleRemoveFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleAddImage = () => {
    if (currentImage.trim() && !formData.images.includes(currentImage.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, currentImage.trim()]
      }));
      setCurrentImage('');
    }
  };

  const handleRemoveImage = (image) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== image)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Campos obrigatórios
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Estoque deve ser um número válido';
    }

    if (!formData.imageMain.trim()) {
      newErrors.imageMain = 'Imagem principal é obrigatória';
    }

    // Validar desconto
    if (formData.discount && (parseFloat(formData.discount) < 0 || parseFloat(formData.discount) > 100)) {
      newErrors.discount = 'Desconto deve estar entre 0 e 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        stock: parseInt(formData.stock),
      };

      const result = await updateProduct(id, productData);

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso",
          duration: 3000,
        });
        navigate(`/produto/${id}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Carregando produto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Produto não encontrado
          </h2>
          <Button onClick={() => navigate('/produtos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <button 
              onClick={() => navigate(`/produto/${id}`)}
              className="hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Produto
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Editar Produto
            </h1>
            <p className="text-gray-600">
              Atualize as informações do seu produto
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: iPhone 15 Pro Max"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva seu produto em detalhes..."
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preço e Estoque */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Preço e Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Desconto (%)</Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={formData.discount}
                      onChange={handleChange}
                      className={errors.discount ? 'border-red-500' : ''}
                    />
                    {errors.discount && (
                      <p className="text-sm text-red-500">{errors.discount}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Quantidade em Estoque *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      placeholder="1"
                      value={formData.stock}
                      onChange={handleChange}
                      className={errors.stock ? 'border-red-500' : ''}
                    />
                    {errors.stock && (
                      <p className="text-sm text-red-500">{errors.stock}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="freteGratis"
                    name="freteGratis"
                    checked={formData.freteGratis}
                    onChange={handleChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="freteGratis" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Frete Grátis
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Imagens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Imagens do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageMain">Imagem Principal (URL) *</Label>
                  <Input
                    id="imageMain"
                    name="imageMain"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.imageMain}
                    onChange={handleChange}
                    className={errors.imageMain ? 'border-red-500' : ''}
                  />
                  {errors.imageMain && (
                    <p className="text-sm text-red-500">{errors.imageMain}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Imagens Adicionais</Label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="URL da imagem adicional"
                      value={currentImage}
                      onChange={(e) => setCurrentImage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddImage}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.images.map((image, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          Imagem {index + 1}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Características */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Características do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Tela OLED, 128GB, 5G..."
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(feature)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/produto/${id}`)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando Alterações...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProductPage;