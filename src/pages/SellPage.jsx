// src/pages/SellPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2
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

const SellPage = () => {
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { createProduct } = useProducts();
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

  // Verificar autenticação
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/vender' } } });
    }
  }, [isAuthenticated, navigate]);

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

  // Função para lidar com seleção de arquivo
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Função para processar o arquivo selecionado
  const processFile = (file) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos de imagem',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho do arquivo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 2MB',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Limpar erro do campo
    if (errors.imageMain) {
      setErrors(prev => ({
        ...prev,
        imageMain: ''
      }));
    }
  };

  // Função para lidar com drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Função para remover imagem selecionada
  const handleRemoveSelectedImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imageMain: ''
    }));
  };

  // Função para fazer upload da imagem
  const handleUploadImage = async () => {
    if (!imageFile) {
      return null;
    }

    setIsUploading(true);

    try {
      const response = await apiService.uploadImage(imageFile);
      
      if (response.success && response.data?.base64) {
        setFormData(prev => ({
          ...prev,
          imageMain: response.data.base64
        }));

        toast({
          title: 'Sucesso',
          description: 'Imagem enviada com sucesso',
        });

        return response.data.base64;
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao fazer upload da imagem. Tente novamente.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
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

    if (!formData.stock || parseInt(formData.stock) <= 0) {
      newErrors.stock = 'Estoque deve ser maior que zero';
    }

    if (!imageFile && !formData.imageMain.trim()) {
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
      // Se há um arquivo selecionado, fazer upload primeiro
      let imageUrl = formData.imageMain;
      if (imageFile && !formData.imageMain) {
        imageUrl = await handleUploadImage();
        if (!imageUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      const productData = {
        ...formData,
        imageMain: imageUrl,
        price: parseFloat(formData.price),
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        stock: parseInt(formData.stock),
        seller: user?.name || 'Vendedor',
        rating: 0,
        reviews: 0,
      };

      const result = await createProduct(productData);

      if (result.success) {
        navigate('/produtos');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Componente será redirecionado no useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vender Produto
            </h1>
            <p className="text-gray-600">
              Preencha as informações do seu produto para começar a vender
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
                      min="1"
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
                {/* Upload de Imagem Principal */}
                <div className="space-y-2">
                  <Label>Imagem Principal *</Label>
                  
                  {!imagePreview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        errors.imageMain 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      }`}
                      onClick={() => document.getElementById('imageUpload').click()}
                    >
                      <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">
                        Arraste uma imagem ou clique para selecionar
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF, WEBP até 2MB
                      </p>
                    </div>
                  ) : (
                    <div className="relative border-2 border-gray-300 rounded-lg p-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-contain rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveSelectedImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {errors.imageMain && (
                    <p className="text-sm text-red-500">{errors.imageMain}</p>
                  )}
                </div>

                {/* URL da Imagem Principal (opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="imageMain">Ou insira a URL da imagem</Label>
                  <Input
                    id="imageMain"
                    name="imageMain"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={imageFile ? '' : formData.imageMain}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value && imagePreview) {
                        setImageFile(null);
                        setImagePreview(null);
                      }
                    }}
                    disabled={!!imageFile}
                  />
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

            {/* Botão de submissão */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/produtos')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publicando Produto...
                  </>
                ) : (
                  'Publicar Produto'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SellPage;