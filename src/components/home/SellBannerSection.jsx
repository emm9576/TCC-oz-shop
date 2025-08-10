
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SellBannerSection = () => {
  return (
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
              Transforme itens não utilizados em dinheiro. Venda facilmente no e-Shop FITO e alcance milhares de compradores.
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
            <img  class="rounded-lg shadow-xl" alt="Pessoa vendendo produtos online" src="https://images.unsplash.com/photo-1542744095-291d1f67b221" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SellBannerSection;
