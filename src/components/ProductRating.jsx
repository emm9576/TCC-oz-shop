// src/components/ProductRating.jsx
import React, { useState, useEffect } from 'react';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const ProductRating = ({ productId, currentRating, totalReviews, onRatingUpdate }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingRating, setIsCheckingRating] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Verificar se o usuário já avaliou este produto
  useEffect(() => {
    const checkUserRating = async () => {
      // Resetar estados primeiro
      setHasRated(false);
      setUserRating(null);
      
      if (!isAuthenticated || !user || !productId) return;

      setIsCheckingRating(true);

      try {
        // Usar o método correto do apiService
        const response = await apiService.checkUserRating(productId);
        
        if (response.success) {
          const rated = response.hasRated || false;
          const rating = response.rating || null;
          
          setHasRated(rated);
          setUserRating(rating);
        } else {
          setHasRated(false);
          setUserRating(null);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar avaliação:', error);
        // Em caso de erro, assumir que não avaliou para não bloquear o usuário
        setHasRated(false);
        setUserRating(null);
      } finally {
        setIsCheckingRating(false);
      }
    };

    checkUserRating();
  }, [productId, isAuthenticated, user]);

  // Função para enviar avaliação
  const handleRatingSubmit = async (rating) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para avaliar produtos.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (hasRated) {
      toast({
        title: "Avaliação já enviada",
        description: "Você já avaliou este produto anteriormente.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.updateProductRating(productId, rating);

      if (response.success) {
        setHasRated(true);
        setUserRating(rating);
        
        toast({
          title: "Avaliação enviada!",
          description: "Obrigado por avaliar este produto.",
          duration: 3000,
        });

        // Atualizar o produto na página
        if (onRatingUpdate && response.data) {
          onRatingUpdate(response.data);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao avaliar produto:', error);
      
      // Verificar se o erro é de avaliação duplicada
      const errorMsg = error.message || '';
      if (errorMsg.includes('já avaliou') || 
          errorMsg.includes('already rated') ||
          errorMsg.includes('duplicate')) {
        setHasRated(true);
        toast({
          title: "Você já avaliou este produto",
          description: "Cada usuário pode avaliar apenas uma vez.",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: "Erro ao enviar avaliação",
          description: errorMsg || "Tente novamente mais tarde.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
      setHoveredRating(0);
    }
  };

  // Renderizar estrelas de exibição (rating médio)
  const renderDisplayStars = () => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.floor(currentRating);
          const isHalfFilled = starValue === Math.ceil(currentRating) && currentRating % 1 !== 0;

          return (
            <div key={index} className="relative">
              <Star
                className={`h-5 w-5 ${
                  isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
              {isHalfFilled && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar estrelas interativas para avaliação
  const renderInteractiveStars = () => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (hoveredRating || userRating || 0);

          return (
            <button
              key={index}
              type="button"
              disabled={hasRated || isSubmitting}
              onMouseEnter={() => !hasRated && !isSubmitting && setHoveredRating(starValue)}
              onMouseLeave={() => !hasRated && !isSubmitting && setHoveredRating(0)}
              onClick={() => !hasRated && !isSubmitting && handleRatingSubmit(starValue)}
              className={`transition-all ${
                hasRated || isSubmitting
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:scale-110'
              }`}
            >
              <Star
                className={`h-6 w-6 ${
                  isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : hasRated 
                      ? 'text-gray-300'
                      : 'text-gray-300 hover:text-yellow-200'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  // Mostrar loader enquanto verifica
  if (isCheckingRating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {renderDisplayStars()}
          <span className="text-sm text-gray-600 font-medium">
            {currentRating > 0 ? currentRating.toFixed(1) : '0.0'}
          </span>
          <span className="text-sm text-gray-500">
            ({totalReviews || 0} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
          </span>
        </div>
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Verificando sua avaliação...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rating atual do produto */}
      <div className="flex items-center gap-3">
        {renderDisplayStars()}
        <span className="text-sm text-gray-600 font-medium">
          {currentRating > 0 ? currentRating.toFixed(1) : '0.0'}
        </span>
        <span className="text-sm text-gray-500">
          ({totalReviews || 0} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
        </span>
      </div>

      {/* Seção de avaliação do usuário */}
      {isAuthenticated && (
        <div className="border-t pt-4">
          {hasRated ? (
            // Usuário JÁ AVALIOU - Mostrar mensagem verde
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <p className="font-medium text-green-900 mb-1">
                    Você já avaliou este produto
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-700">Sua avaliação:</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`h-5 w-5 ${
                            index < (userRating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Usuário NÃO AVALIOU - Mostrar caixa para avaliar
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-900 mb-3">
                Avalie este produto
              </p>
              <div className="flex items-center gap-3">
                {isSubmitting ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Enviando avaliação...</span>
                  </div>
                ) : (
                  <>
                    {renderInteractiveStars()}
                    {hoveredRating > 0 && (
                      <span className="text-sm text-blue-700 font-medium">
                        {hoveredRating} {hoveredRating === 1 ? 'estrela' : 'estrelas'}
                      </span>
                    )}
                  </>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Clique nas estrelas para avaliar (você só pode avaliar uma vez)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mensagem para usuários não autenticados */}
      {!isAuthenticated && (
        <div className="border-t pt-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">
              Faça login para avaliar este produto
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/login'}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRating;