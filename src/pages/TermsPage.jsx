import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const TermsAndPrivacyPage = () => {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Termos e Privacidade</h1>
        <p className="text-gray-600">
          Informações importantes sobre o uso da plataforma Oz Shop
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="terms">Termos de Uso</TabsTrigger>
          <TabsTrigger value="privacy">Política de Privacidade</TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Termos de Uso</CardTitle>
              <CardDescription>
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">1. Natureza do Projeto</h3>
                <p className="text-gray-700 leading-relaxed">
                  O Oz Shop é um projeto educacional desenvolvido para fins acadêmicos e de
                  aprendizado. Esta plataforma não realiza transações comerciais reais e não deve
                  ser utilizada para fins comerciais. Todos os produtos, preços e transações são
                  simulados para demonstração de funcionalidades de um e-commerce.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">2. Aceitação dos Termos</h3>
                <p className="text-gray-700 leading-relaxed">
                  Ao acessar e utilizar a plataforma Oz Shop, você concorda com estes Termos de
                  Uso. Se você não concorda com qualquer parte destes termos, não deve utilizar a
                  plataforma.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">3. Cadastro e Conta de Usuário</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Para utilizar certas funcionalidades da plataforma, você precisará criar uma
                  conta. Ao criar uma conta, você concorda em:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
                  <li>Manter a segurança de sua senha e dados de acesso</li>
                  <li>Notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
                  <li>Ser responsável por todas as atividades realizadas em sua conta</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">4. Uso Aceitável</h3>
                <p className="text-gray-700 leading-relaxed mb-3">Você concorda em não:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Usar a plataforma para qualquer finalidade ilegal ou não autorizada</li>
                  <li>Publicar conteúdo ofensivo, difamatório ou inadequado</li>
                  <li>Tentar obter acesso não autorizado a sistemas ou dados</li>
                  <li>Interferir no funcionamento adequado da plataforma</li>
                  <li>
                    Coletar informações de outros usuários sem autorização expressa
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Conteúdo do Usuário</h3>
                <p className="text-gray-700 leading-relaxed">
                  Ao publicar produtos ou qualquer outro conteúdo na plataforma, você garante que
                  possui todos os direitos necessários sobre esse conteúdo. Você concede ao Oz Shop
                  uma licença não exclusiva para usar, modificar e exibir esse conteúdo dentro da
                  plataforma para fins educacionais.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Propriedade Intelectual</h3>
                <p className="text-gray-700 leading-relaxed">
                  Todo o conteúdo da plataforma, incluindo mas não limitado a textos, gráficos,
                  logotipos, ícones, imagens e software, é propriedade do Oz Shop ou de seus
                  licenciadores e está protegido por leis de propriedade intelectual.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">7. Limitação de Responsabilidade</h3>
                <p className="text-gray-700 leading-relaxed">
                  Como projeto educacional, o Oz Shop é fornecido no estado em que se encontra,
                  sem garantias de qualquer tipo. Não nos responsabilizamos por quaisquer danos
                  diretos, indiretos, incidentais ou consequenciais resultantes do uso ou
                  incapacidade de uso da plataforma.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">8. Modificações</h3>
                <p className="text-gray-700 leading-relaxed">
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As
                  alterações entrarão em vigor imediatamente após sua publicação na plataforma. O
                  uso continuado da plataforma após as alterações constitui aceitação dos novos
                  termos.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">9. Encerramento</h3>
                <p className="text-gray-700 leading-relaxed">
                  Podemos encerrar ou suspender seu acesso à plataforma imediatamente, sem aviso
                  prévio, se você violar estes Termos de Uso ou por qualquer outro motivo que
                  consideremos apropriado.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">10. Contato</h3>
                <p className="text-gray-700 leading-relaxed">
                  Para dúvidas sobre estes Termos de Uso, entre em contato através do e-mail:
                  contato@ozshop.com.br
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Política de Privacidade</CardTitle>
              <CardDescription>
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">1. Introdução</h3>
                <p className="text-gray-700 leading-relaxed">
                  Esta Política de Privacidade descreve como o Oz Shop, um projeto educacional,
                  coleta, usa e protege as informações dos usuários. Levamos sua privacidade a
                  sério e estamos comprometidos em proteger seus dados pessoais.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">2. Informações Coletadas</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Para fins educacionais, coletamos as seguintes informações:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Informações de cadastro:</strong> nome, e-mail, telefone e endereço
                  </li>
                  <li>
                    <strong>Informações de perfil:</strong> foto, biografia e preferências
                  </li>
                  <li>
                    <strong>Informações de produtos:</strong> dados dos produtos cadastrados para
                    venda
                  </li>
                  <li>
                    <strong>Informações de uso:</strong> dados de navegação e interação com a
                    plataforma
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">3. Uso das Informações</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Utilizamos as informações coletadas para:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Demonstrar funcionalidades de um sistema de e-commerce</li>
                  <li>Permitir a criação e gerenciamento de contas de usuário</li>
                  <li>Facilitar a publicação e visualização de produtos</li>
                  <li>Simular processos de compra e venda</li>
                  <li>Melhorar a experiência do usuário na plataforma</li>
                  <li>Fins de aprendizado e desenvolvimento técnico</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">
                  4. Compartilhamento de Informações
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Como projeto educacional, não compartilhamos suas informações pessoais com
                  terceiros para fins comerciais. As informações são utilizadas exclusivamente
                  dentro da plataforma para demonstração de funcionalidades. Informações públicas
                  de perfil, como nome e produtos cadastrados, podem ser visíveis a outros
                  usuários da plataforma.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Segurança dos Dados</h3>
                <p className="text-gray-700 leading-relaxed">
                  Implementamos medidas de segurança técnicas e organizacionais apropriadas para
                  proteger suas informações pessoais contra acesso não autorizado, alteração,
                  divulgação ou destruição. No entanto, como projeto educacional, não podemos
                  garantir segurança absoluta dos dados.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Cookies e Tecnologias Similares</h3>
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos cookies e tecnologias similares para melhorar a funcionalidade da
                  plataforma, manter sessões de usuário e analisar o uso do sistema. Você pode
                  configurar seu navegador para recusar cookies, mas isso pode afetar algumas
                  funcionalidades da plataforma.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">7. Seus Direitos</h3>
                <p className="text-gray-700 leading-relaxed mb-3">Você tem o direito de:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Acessar suas informações pessoais armazenadas na plataforma</li>
                  <li>Corrigir informações incorretas ou desatualizadas</li>
                  <li>Solicitar a exclusão de sua conta e dados associados</li>
                  <li>Retirar seu consentimento para processamento de dados</li>
                  <li>Exportar seus dados em formato legível</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">8. Retenção de Dados</h3>
                <p className="text-gray-700 leading-relaxed">
                  Mantemos suas informações pessoais enquanto sua conta estiver ativa ou conforme
                  necessário para fins educacionais. Você pode solicitar a exclusão de seus dados
                  a qualquer momento, e processaremos sua solicitação de acordo com as leis
                  aplicáveis.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">9. Menores de Idade</h3>
                <p className="text-gray-700 leading-relaxed">
                  A plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente
                  informações de menores de idade. Se tomarmos conhecimento de que coletamos dados
                  de um menor, tomaremos medidas para excluir essas informações.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">
                  10. Alterações na Política de Privacidade
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos
                  sobre alterações significativas publicando a nova política na plataforma. O uso
                  continuado após as alterações constitui aceitação da política atualizada.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">11. Contato</h3>
                <p className="text-gray-700 leading-relaxed">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de
                  Privacidade, entre em contato através do e-mail: contato@ozshop.com.br
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-3">12. Consentimento</h3>
                <p className="text-gray-700 leading-relaxed">
                  Ao utilizar a plataforma Oz Shop, você consente com a coleta e uso de suas
                  informações conforme descrito nesta Política de Privacidade.
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TermsAndPrivacyPage;