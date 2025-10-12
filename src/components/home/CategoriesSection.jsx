import { motion } from 'framer-motion';
import { Dumbbell, Home, Shirt, ShoppingBag, Smartphone, Sparkles } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

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

const CategoriesSection = ({ categories }) => {
  return (
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
  );
};

export default CategoriesSection;
