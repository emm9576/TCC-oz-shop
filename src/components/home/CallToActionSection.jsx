
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CallToActionSection = () => {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para começar?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Junte-se a milhares de pessoas que já estão comprando e vendendo no Oz Shop.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
            <Link to="/produtos">Explorar Produtos</Link>
          </Button>
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
            <Link to="/cadastro">Criar uma Conta</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
