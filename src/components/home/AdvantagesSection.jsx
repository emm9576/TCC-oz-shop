
import React from 'react';
import { motion } from 'framer-motion';
import { Truck, CreditCard, Award, ShoppingBag } from 'lucide-react';

const AdvantageCard = ({ icon, title, description, delay }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
  >
    <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const AdvantagesSection = () => {
  const advantages = [
    {
      icon: <Truck className="h-7 w-7 text-primary" />,
      title: "Entrega Rápida",
      description: "Receba seus produtos em até 2 dias úteis em diversas regiões do Brasil.",
      delay: 0.1
    },
    {
      icon: <CreditCard className="h-7 w-7 text-primary" />,
      title: "Pagamento Seguro",
      description: "Diversas opções de pagamento com total segurança para suas transações.",
      delay: 0.2
    },
    {
      icon: <Award className="h-7 w-7 text-primary" />,
      title: "Produtos de Qualidade",
      description: "Todos os produtos passam por verificação de qualidade antes da venda.",
      delay: 0.3
    },
    {
      icon: <ShoppingBag className="h-7 w-7 text-primary" />,
      title: "Venda Facilitada",
      description: "Processo simples para cadastrar e vender seus produtos na plataforma.",
      delay: 0.4
    }
  ];

  return (
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
          <p className="text-gray-600">Oferecemos a melhor experiência para compradores e vendedores</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <AdvantageCard key={index} {...advantage} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
