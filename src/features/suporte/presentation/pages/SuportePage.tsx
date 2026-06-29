import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import {
  HelpCircle,
  NavArrowDown,
  NavArrowRight,
  ThumbsUp,
  ThumbsDown,
  MessageText,
  Page,
  Notes,
  Settings,
  DollarCircle,
  Mail,
  Clock,
} from 'iconoir-react';
import { cn } from '@/shared/components/ui/utils';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Category {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  faqs: FAQ[];
}

const categories: Category[] = [
  {
    id: 'contratos',
    title: 'Instrumentos contratuais',
    icon: Page,
    faqs: [
      { id: 'c1', question: 'Como cadastrar um novo contrato?', answer: 'No menu lateral, abra o grupo "Instrumentos" e use "Cadastrar" a partir da gestão (ou o atalho no painel). Na primeira tela, escolha o tipo — Contrato, Nota de empenho ou Outro — e siga o formulário correspondente. Para contratos clássicos, preencha número, objeto, valores e vigência e conclua com "Salvar".' },
      { id: 'c2', question: 'Como acompanhar contratos próximos ao vencimento?', answer: 'No Dashboard, o bloco de alertas destaca instrumentos com vencimento ou prazo crítico. Na gestão unificada em Instrumentos, use os filtros por tipo e por status. Notas de empenho passam a considerar prazo de entrega (OF), não só data fim de vigência — ver documentação de produto.' },
      { id: 'c3', question: 'É possível exportar a lista de contratos?', answer: 'Na gestão de contratos (legado) havia exportação; a listagem unificada de instrumentos receberá o mesmo recurso na evolução da API. Enquanto isso, use os filtros e ações disponíveis na tela de gestão.' },
      { id: 'c4', question: 'Como editar informações de um contrato já cadastrado?', answer: 'Na listagem de instrumentos, abra os detalhes do registro e use as ações de edição previstas no fluxo. O histórico de alterações será mantido quando o backend estiver integrado.' },
    ],
  },
  {
    id: 'atas',
    title: 'Atas de Registro de Preços',
    icon: Notes,
    faqs: [
      { id: 'a1', question: 'Qual a diferença entre contrato e ata de registro?', answer: 'O contrato é um acordo firmado com uma empresa específica para fornecimento de produtos ou serviços. Já a ata de registro de preços é um documento que registra os preços ofertados por fornecedores, permitindo futuras contratações conforme a necessidade, sem necessidade de nova licitação.' },
      { id: 'a2', question: 'Como cadastrar uma ata de registro de preços?', answer: 'Acesse "Atas de Registro de Preços" > "Cadastrar" no menu lateral. Preencha as informações da ata, incluindo número, objeto, fornecedores participantes, itens com preços registrados e vigência. O sistema permite cadastrar múltiplos itens e fornecedores em uma mesma ata.' },
      { id: 'a3', question: 'Como fazer adesão a uma ata de outro órgão?', answer: 'Na tela de cadastro de atas, selecione a opção "Adesão a Ata Externa". Informe os dados do órgão gerenciador, número da ata original, e os itens que deseja aderir. O sistema permite controlar o limite de adesão permitido por lei.' },
    ],
  },
  {
    id: 'sistema',
    title: 'Sistema e Navegação',
    icon: Settings,
    faqs: [
      { id: 's1', question: 'Como alterar o tema do sistema (claro/escuro)?', answer: 'Você pode alterar o tema de duas formas: 1) No header superior, clique no ícone de sol/lua para alternar entre os temas. 2) Acesse "Configurações" > "Aparência" e selecione o tema desejado. Sua preferência será salva automaticamente.' },
      { id: 's2', question: 'Como configurar notificações?', answer: 'Acesse "Configurações" > "Notificações". Lá você pode ativar ou desativar alertas de contratos próximos ao vencimento, pendências financeiras e e-mail diário com resumo das atividades. As alterações são salvas automaticamente.' },
      { id: 's3', question: 'Esqueci minha senha, como recuperar?', answer: 'Na tela de login, clique em "Esqueci minha senha". Digite seu e-mail cadastrado e você receberá um link para redefinição de senha. O link é válido por 24 horas. Se não receber o e-mail, verifique sua caixa de spam ou entre em contato com o suporte.' },
      { id: 's4', question: 'Como alterar meus dados de perfil?', answer: 'Acesse "Configurações" > "Meu Perfil". Lá você pode atualizar seu nome, e-mail, telefone e foto de perfil. Para alterar a senha, utilize a opção "Segurança" > "Alterar senha".' },
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    icon: DollarCircle,
    faqs: [
      { id: 'f1', question: 'Como acompanhar pagamentos pendentes?', answer: 'Acesse "Configurações" > "Financeiro" para visualizar todos os pagamentos pendentes. O sistema mostra o valor total em aberto, lista de pagamentos aguardando processamento e histórico de pagamentos realizados. Você também pode visualizar pendências na Dashboard.' },
      { id: 'f2', question: 'Como registrar um pagamento realizado?', answer: 'No módulo Financeiro dentro de Configurações, localize o pagamento pendente e clique em "Registrar Pagamento". Informe a data de pagamento, forma de pagamento e anexe o comprovante se necessário. O sistema atualizará automaticamente o saldo do contrato.' },
      { id: 'f3', question: 'É possível gerar relatórios financeiros?', answer: 'Sim! No módulo Financeiro você pode gerar relatórios de pagamentos por período, por contrato, por fornecedor ou por status. Os relatórios podem ser exportados em formato PDF ou Excel para análise.' },
    ],
  },
];

const channels = [
  { id: 'email', icon: Mail, bgColor: 'bg-[#06D6A0]/10', title: 'E-mail', contact: 'contato@licitaone.com.br', availability: 'Resposta em até 24h' },
  { id: 'whatsapp', icon: Clock, bgColor: 'bg-[#0050FF]/10', title: 'WhatsApp', contact: '(88) 93613-0118', availability: 'Seg a Sex, 8h às 18h' },
];

export function SuportePage() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['contratos']);
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, 'helpful' | 'not-helpful'>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQs((prev) =>
      prev.includes(faqId) ? prev.filter((id) => id !== faqId) : [...prev, faqId]
    );
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Olá! Preciso de ajuda com o LicitaOne. Minha dúvida não foi respondida no FAQ.');
    window.open(`https://wa.me/5588936130118?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Suporte' }]} />

      <div className="space-y-1">
        <h1 className="text-xl lg:text-4xl">Central de suporte</h1>
        <p className="text-muted-foreground text-sm lg:text-base">Encontre respostas para suas dúvidas mais frequentes</p>
      </div>

      <Card className="border-[#0050FF]/20 bg-[#EDF4FF] dark:bg-[#0050FF]/5">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#0050FF] flex items-center justify-center flex-shrink-0">
              <MessageText className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm lg:text-base text-[#0050FF]">Não encontrou o que procura?</h3>
              <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">Nossa equipe está pronta para ajudar você</p>
            </div>
            <Button onClick={openWhatsApp} className="gap-2 h-9 lg:h-10 w-full sm:w-auto text-sm">
              <MessageText className="h-4 w-4" />
              Falar no WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 lg:space-y-4">
        {categories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          return (
            <Card key={category.id}>
              <CardHeader className="pb-3 lg:pb-4">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <category.icon className="h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-base lg:text-lg group-hover:text-[#0050FF] transition-colors">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-xs lg:text-sm mt-0.5">
                        {category.faqs.length} {category.faqs.length === 1 ? 'pergunta' : 'perguntas'}
                      </CardDescription>
                    </div>
                  </div>
                  {isExpanded
                    ? <NavArrowDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    : <NavArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  }
                </button>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {category.faqs.map((faq) => {
                      const isFAQExpanded = expandedFAQs.includes(faq.id);
                      const faqFeedback = feedback[faq.id];

                      return (
                        <div key={faq.id} className="border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full flex items-start gap-3 p-3 lg:p-4 text-left hover:bg-accent transition-colors"
                          >
                            <HelpCircle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', isFAQExpanded ? 'text-[#0050FF]' : 'text-muted-foreground')} />
                            <div className="flex-1 min-w-0">
                              <p className={cn('font-medium text-sm lg:text-base', isFAQExpanded && 'text-[#0050FF]')}>
                                {faq.question}
                              </p>
                            </div>
                            {isFAQExpanded
                              ? <NavArrowDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                              : <NavArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                            }
                          </button>

                          {isFAQExpanded && (
                            <div className="px-3 pb-3 lg:px-4 lg:pb-4 pt-0 border-t bg-accent/50">
                              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mt-3 pl-8">
                                {faq.answer}
                              </p>
                              <div className="mt-4 pl-8">
                                {faqFeedback === undefined ? (
                                  <div className="flex items-center gap-3">
                                    <p className="text-xs lg:text-sm text-muted-foreground">Esta resposta foi útil?</p>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm" onClick={() => setFeedback((p) => ({ ...p, [faq.id]: 'helpful' }))} className="h-8 gap-1.5">
                                        <ThumbsUp className="h-3.5 w-3.5" />
                                        <span className="text-xs">Sim</span>
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => setFeedback((p) => ({ ...p, [faq.id]: 'not-helpful' }))} className="h-8 gap-1.5">
                                        <ThumbsDown className="h-3.5 w-3.5" />
                                        <span className="text-xs">Não</span>
                                      </Button>
                                    </div>
                                  </div>
                                ) : faqFeedback === 'helpful' ? (
                                  <div className="flex items-center gap-2 text-[#06D6A0]">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span className="text-xs lg:text-sm font-medium">Obrigado pelo feedback!</span>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[#F59E0B]">
                                      <ThumbsDown className="h-4 w-4" />
                                      <span className="text-xs lg:text-sm font-medium">Sentimos muito que não ajudamos.</span>
                                    </div>
                                    <Button onClick={openWhatsApp} size="sm" className="gap-2 h-8 text-xs">
                                      <MessageText className="h-3.5 w-3.5" />
                                      Falar com suporte
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3 lg:pb-6">
          <CardTitle className="text-base lg:text-lg">Outros Canais de Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:gap-4 sm:grid-cols-2">
            {channels.map((channel) => (
              <a 
                key={channel.id}
                href={channel.id === 'whatsapp' ? 'https://api.whatsapp.com/send?phone=5588936130118&text=Ol%C3%A1%2C%20estou%20entrando%20em%20contato%20atrav%C3%A9s%20da%20plataforma.' : channel.id === 'email' ? 'mailto:contato@licitaone.com.br' : undefined}
                target={channel.id === 'whatsapp' ? '_blank' : undefined}
                rel={channel.id === 'whatsapp' ? 'noopener noreferrer' : undefined}
                className="flex items-start gap-3 p-3 lg:p-4 rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors"
              >
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full ${channel.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <channel.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <div>
                  <p className="font-medium text-sm lg:text-base">{channel.title}</p>
                  <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">{channel.contact}</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{channel.availability}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
