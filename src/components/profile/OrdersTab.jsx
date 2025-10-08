import React from 'react';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const OrdersTab = ({ orders, isLoadingOrders, handleViewOrder, getStatusColor }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Pedidos</CardTitle>
        <CardDescription>Histórico de compras realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingOrders ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-r-transparent mb-4"></div>
            <p className="text-gray-500">Carregando seus pedidos...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Pedido</th>
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Data</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Itens</th>
                  <th className="text-right py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const firstValidProduct = order.products?.find(product => product.name && !product.deleted);
                  const productName = firstValidProduct?.name || 'Produto não disponível';
                  
                  return (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">#{order.id}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate" title={productName}>
                          {productName}
                        </div>
                      </td>
                      <td className="py-3 px-4">{order.date}</td>
                      <td className="py-3 px-4">R$ {order.total?.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{order.items}</td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
  );
};

export default OrdersTab;