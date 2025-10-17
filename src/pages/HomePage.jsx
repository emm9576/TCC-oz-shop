import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  CreditCard,
  Dumbbell,
  Home,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Truck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { categories, products } from '@/data/products';
import apiService from '@/services/api';

const HomePage = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const countResponse = await apiService.getTotalProductsCount();
        if (countResponse.success) {
          setTotalProducts(countResponse.data.total);
        }

        const productsResponse = await apiService.getProducts();
        if (productsResponse.success) {
          setFeaturedProducts(productsResponse.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setFeaturedProducts(products.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Mapeamento de ícones para categorias
  const getCategoryIcon = (iconName) => {
    const icons = {
      Smartphone: <Smartphone className="h-6 w-6" />,
      Shirt: <Shirt className="h-6 w-6" />,
      Home: <Home className="h-6 w-6" />,
      Dumbbell: <Dumbbell className="h-6 w-6" />,
      Sparkles: <Sparkles className="h-6 w-6" />,
    };

    return icons[iconName] || <ShoppingBag className="h-6 w-6" />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Compre e venda no <span className="text-primary">Oz Shop</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Seu marketplace completo para encontrar produtos incríveis ou vender o que você não
                usa mais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  <Link to="/produtos" className="flex items-center">
                    Explorar Produtos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Link to="/vender" className="flex items-center">
                    Comece a Vender
                    <ShoppingBag className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <img
                  className="rounded-lg shadow-2xl"
                  alt="Pessoas comprando online"
                  src="https://images.unsplash.com/photo-1542744095-291d1f67b221"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">
                        {loading ? 'Carregando...' : `+${totalProducts.toLocaleString('pt-BR')} produtos`}
                      </p>
                      <p className="text-sm text-gray-500">Disponíveis para você</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-2">Navegue por Categorias</h2>
            <p className="text-gray-600">Encontre exatamente o que você está procurando</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {categories.map((category) => (
              <motion.div key={category.id} variants={fadeInUp} className="category-item">
                <Link
                  to={`/produtos?category=${category.id}`}
                  className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-primary/10 p-4 rounded-full mb-4 category-icon">
                    {getCategoryIcon(category.icon)}
                  </div>
                  <h3 className="font-medium text-center">{category.name}</h3>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Produtos em Destaque</h2>
            <Link to="/produtos" className="text-primary hover:underline flex items-center">
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando produtos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner de Venda */}
      <section className="py-16 bg-gradient-to-r from-primary/20 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              className="md:w-1/2 mb-8 md:mb-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tem algo para vender?</h2>
              <p className="text-lg text-gray-600 mb-6">
                Transforme itens não utilizados em dinheiro. Venda facilmente no Oz Shop e alcance
                milhares de compradores.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                <Link to="/vender" className="flex items-center">
                  Comece a Vender Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <img
                className="rounded-lg shadow-xl"
                alt="Pessoa vendendo produtos online"
                src="https://images.unsplash.com/photo-1632065509860-4fbcfc89ed7c"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-2">Por que escolher o Oz Shop?</h2>
            <p className="text-gray-600">
              Oferecemos a melhor experiência para compradores e vendedores
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">
                Receba seus produtos em até 2 dias úteis em diversas regiões do Brasil.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pagamento Seguro</h3>
              <p className="text-gray-600">
                Diversas opções de pagamento com total segurança para suas transações.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Produtos de Qualidade</h3>
              <p className="text-gray-600">
                Todos os produtos passam por verificação de qualidade antes da venda.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Venda Facilitada</h3>
              <p className="text-gray-600">
                Processo simples para cadastrar e vender seus produtos na plataforma.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão comprando e vendendo no Oz Shop.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
            >
              <Link to="/produtos">Explorar Produtos</Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
            >
              <Link to="/cadastro">Criar uma Conta</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;