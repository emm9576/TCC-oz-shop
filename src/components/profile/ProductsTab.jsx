import React from 'react';
import { Package, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ProductsTab = ({ 
  myProducts, 
  isLoadingProducts, 
  handleViewProduct, 
  handleEditProduct, 
  handleDeleteProduct,
  navigate 
}) => {
  return (
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
  );
};

export default ProductsTab;