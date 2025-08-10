
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">e-Shop FITO</h3>
            <p className="text-gray-400 mb-4">
              Seu marketplace online para comprar e vender produtos de qualidade.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="text-gray-400 hover:text-primary transition-colors">
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/vender" className="text-gray-400 hover:text-primary transition-colors">
                  Vender
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-primary transition-colors">
                  Minha Conta
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/produtos?categoria=eletronicos" className="text-gray-400 hover:text-primary transition-colors">
                  Eletrônicos
                </Link>
              </li>
              <li>
                <Link to="/produtos?categoria=moda" className="text-gray-400 hover:text-primary transition-colors">
                  Moda
                </Link>
              </li>
              <li>
                <Link to="/produtos?categoria=casa" className="text-gray-400 hover:text-primary transition-colors">
                  Casa e Decoração
                </Link>
              </li>
              <li>
                <Link to="/produtos?categoria=esportes" className="text-gray-400 hover:text-primary transition-colors">
                  Esportes
                </Link>
              </li>
              <li>
                <Link to="/produtos?categoria=beleza" className="text-gray-400 hover:text-primary transition-colors">
                  Beleza e Saúde
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 text-primary mt-1" />
                <span className="text-gray-400">Av. Principal, 1000, São Paulo - SP</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-primary" />
                <span className="text-gray-400">(11) 9999-9999</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-primary" />
                <span className="text-gray-400">contato@eshopfito.com.br</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} e-Shop FITO. Todos os direitos reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
