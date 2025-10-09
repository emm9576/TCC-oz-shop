import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, LogOut, Save, Upload, Link as LinkIcon, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const ProfileTab = ({ 
  user, 
  profileData, 
  isEditing, 
  setIsEditing, 
  handleChange, 
  handleSaveProfile, 
  isSaving, 
  isLoadingProfile, 
  handleLogout,
  formatDate,
  onProfilePictureUpdate,
  handleShareInfoToggle
}) => {
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMethod, setUploadMethod] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setUploadMethod('file');
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setUploadMethod('file');
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUrlMethodSelect = () => {
    setUploadMethod('url');
    setSelectedFile(null);
  };

  const handleFileMethodSelect = () => {
    setUploadMethod('file');
    setImageUrl('');
  };

  const handleUploadProfilePicture = async () => {
    if (!uploadMethod) {
      toast({
        title: "Selecione um método",
        description: "Escolha fazer upload de um arquivo ou colar um link.",
        variant: "destructive",
      });
      return;
    }

    if (uploadMethod === 'url' && !imageUrl.trim()) {
      toast({
        title: "URL vazia",
        description: "Por favor, cole o link da imagem.",
        variant: "destructive",
      });
      return;
    }

    if (uploadMethod === 'file' && !selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let profilePictureUrl = '';

      if (uploadMethod === 'url') {
        profilePictureUrl = imageUrl.trim();
      } else {
        // CORREÇÃO: Agora usa result.data.url ao invés de result.data.base64
        const result = await apiService.uploadImage(selectedFile);

        if (!result.success) {
          throw new Error(result.message || 'Erro ao fazer upload da imagem');
        }

        // A API agora retorna URL do Cloudinary em result.data.url
        profilePictureUrl = result.data.url;
      }

      const updateResult = await apiService.updateMe({
        profilePicture: profilePictureUrl
      });

      if (updateResult.success) {
        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso!",
        });
        
        if (onProfilePictureUpdate) {
          onProfilePictureUpdate(profilePictureUrl);
        }
        
        setShowUploadModal(false);
        setUploadMethod(null);
        setImageUrl('');
        setSelectedFile(null);
      } else {
        throw new Error(updateResult.message || 'Erro ao atualizar foto de perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error);
      toast({
        title: "Erro ao atualizar foto",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadMethod(null);
    setImageUrl('');
    setSelectedFile(null);
    setDragActive(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Gerencie seus dados pessoais</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div 
              className="relative mb-4 group cursor-pointer"
              onClick={() => setShowUploadModal(true)}
            >
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.profilePicture || user.profilePicture || ""} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>
            
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
              <form className="space-y-6">
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
                  
                  <div className="space-y-2 md:col-span-2">
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

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    placeholder="Conte um pouco sobre você..."
                    className="min-h-[100px] resize-none"
                    maxLength={500}
                    disabled={!isEditing}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {profileData.bio.length}/500 caracteres
                  </p>
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

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-medium">Privacidade do Perfil</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Escolha quais informações deseja compartilhar publicamente no seu perfil
                  </p>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="share-email" className="cursor-pointer">
                          Compartilhar email
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant={profileData.shareInfo?.email ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleShareInfoToggle('email')}
                        disabled={!isEditing}
                        className="w-20"
                      >
                        {profileData.shareInfo?.email ? 'Sim' : 'Não'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="share-phone" className="cursor-pointer">
                          Compartilhar telefone
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant={profileData.shareInfo?.phone ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleShareInfoToggle('phone')}
                        disabled={!isEditing}
                        className="w-20"
                      >
                        {profileData.shareInfo?.phone ? 'Sim' : 'Não'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="share-estado" className="cursor-pointer">
                          Compartilhar estado
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant={profileData.shareInfo?.estado ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleShareInfoToggle('estado')}
                        disabled={!isEditing}
                        className="w-20"
                      >
                        {profileData.shareInfo?.estado ? 'Sim' : 'Não'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="share-cidade" className="cursor-pointer">
                          Compartilhar cidade
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant={profileData.shareInfo?.cidade ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleShareInfoToggle('cidade')}
                        disabled={!isEditing}
                        className="w-20"
                      >
                        {profileData.shareInfo?.cidade ? 'Sim' : 'Não'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="share-cep" className="cursor-pointer">
                          Compartilhar CEP
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant={profileData.shareInfo?.cep ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleShareInfoToggle('cep')}
                        disabled={!isEditing}
                        className="w-20"
                      >
                        {profileData.shareInfo?.cep ? 'Sim' : 'Não'}
                      </Button>
                    </div>
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

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Atualizar Foto de Perfil</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={uploadMethod === 'file' ? 'default' : 'outline'}
                  onClick={handleFileMethodSelect}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload de Arquivo
                </Button>
                <Button
                  variant={uploadMethod === 'url' ? 'default' : 'outline'}
                  onClick={handleUrlMethodSelect}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Link Externo
                </Button>
              </div>

              {uploadMethod === 'file' && (
                <div className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Arraste e solte uma imagem aqui
                    </p>
                    <p className="text-xs text-gray-500 mb-4">ou</p>
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => document.querySelector('input[type="file"]').click()}
                      >
                        Selecionar Arquivo
                      </Button>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="flex-1 truncate text-sm">
                        {selectedFile.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {uploadMethod === 'url' && (
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Cole o link da imagem aqui</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isUploading}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUploadProfilePicture}
                disabled={isUploading || !uploadMethod}
              >
                {isUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                    Enviando...
                  </>
                ) : (
                  'Salvar Foto'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default ProfileTab;