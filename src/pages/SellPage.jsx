
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Plus, Minus, DollarSign, Tag, Truck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { categories } from '@/data/products';

const SellPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    category: '',
    stock: '1',
    images: [],
    features: [''],
    freeShipping: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirecionar se não estiver autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para vender produtos.",
        variant: "destructive",
        duration: 3000,
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...productData.features];
    updatedFeatures[index] = value;
    setProductData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };
  
  const addFeature = () => {
    setProductData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };
  
  const removeFeature = (index) => {
    const updatedFeatures = [...productData.features];
    updatedFeatures.splice(index, 1);
    setProductData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + productData.images.length > 5) {
      toast({
        title: "Limite de imagens",
        description: "Você pode adicionar no máximo 5 imagens.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Simulando upload de imagens
    const newImages = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      name: file.name,
      // Em uma aplicação real, aqui seria feito o upload para um servidor
      url: URL.createObjectURL(file)
    }));
    
    setProductData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };
  
  const removeImage = (id) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (productData.images.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Adicione pelo menos uma imagem do produto.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulando envio do produto
    setTimeout(() => {
      toast({
        title: "Produto cadastrado com sucesso!",
        description: "Seu produto foi enviado para análise e em breve estará disponível para venda.",
        duration: 5000,
      });
      
      setIsSubmitting(false);
      navigate('/perfil?tab=selling');
    }, 2000);
  };
  
  if (!isAuthenticated) {
    return null; // Não renderizar nada enquanto redireciona
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2">Vender um Produto</h1>
          <p className="text-gray-600 mb-8">
            Preencha os detalhes do produto que você deseja vender
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Informações do Produto</CardTitle>
                  <CardDescription>Detalhes básicos do seu produto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={productData.name}
                      onChange={handleChange}
                      placeholder="Ex: Smartphone Samsung Galaxy S23"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={productData.description}
                      onChange={handleChange}
                      placeholder="Descreva seu produto em detalhes..."
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <select
                        id="category"
                        name="category"
                        value={productData.category}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stock">Quantidade em Estoque *</Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        min="1"
                        value={productData.stock}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="mb-2 block">Características do Produto</Label>
                    {productData.features.map((feature, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder={`Característica ${index + 1}`}
                          className="flex-1"
                        />
                        {productData.features.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                            className="ml-2"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                        {index === productData.features.length - 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addFeature}
                            className="ml-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Preço e Envio</CardTitle>
                  <CardDescription>Defina o valor e opções de envio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={productData.price}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discount">Desconto (%)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="discount"
                        name="discount"
                        type="number"
                        min="0"
                        max="99"
                        value={productData.discount}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="freeShipping"
                      name="freeShipping"
                      checked={productData.freeShipping}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="freeShipping" className="cursor-pointer">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-1 text-primary" />
                        Oferecer Frete Grátis
                      </div>
                    </Label>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md mt-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Dica de Preço</p>
                        <p className="mt-1">
                          Produtos com preços competitivos e frete grátis tendem a vender mais rápido.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Imagens do Produto</CardTitle>
                <CardDescription>Adicione até 5 imagens do seu produto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="images" className="mb-2 block">Carregar Imagens *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Arraste e solte ou clique para selecionar
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        PNG, JPG ou JPEG (máx. 5MB cada)
                      </p>
                      <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => document.getElementById('images').click()}
                      >
                        Selecionar Imagens
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Imagens Selecionadas ({productData.images.length}/5)</Label>
                    {productData.images.length > 0 ? (
                      <div className="space-y-2">
                        {productData.images.map((image) => (
                          <div key={image.id} className="flex items-center p-2 border rounded-md">
                            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-3">
                              <img 
                                src={image.url} 
                                alt={image.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="flex-1 truncate text-sm">{image.name}</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeImage(image.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 border rounded-md bg-gray-50">
                        <p className="text-gray-500 text-sm">Nenhuma imagem selecionada</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                    Enviando...
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
