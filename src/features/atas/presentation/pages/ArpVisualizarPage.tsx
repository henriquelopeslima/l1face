import { useParams, useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { NavArrowLeft, Printer, Download } from 'iconoir-react';

const arpsDetalhadas = {
  '1': {
    id: '1',
    numeroAta: 'ARP 012/2025',
    orgaoGerenciador: 'Prefeitura de Fortaleza',
    cnpjOrgao: '07.954.497/0001-24',
    objeto: 'Aquisição de Material de Tecnologia da Informação para todas as secretarias',
    vigenciaInicial: '2025-01-15',
    vigenciaFinal: '2026-06-30',
    aceitaAdesao: true,
    processoAdministrativo: '2024/0123456-7',
    modalidadeLicitacao: 'Pregão Eletrônico',
    numeroLicitacao: '045/2024',
    fornecedor: {
      razaoSocial: 'TechSupply Distribuidora de Informática Ltda',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua das Tecnologias, 1500 - Centro',
      cidade: 'Fortaleza',
      uf: 'CE',
      cep: '60010-000',
      telefone: '(85) 3456-7890',
      email: 'contato@techsupply.com.br',
      representanteLegal: 'João da Silva',
      cpfRepresentante: '123.456.789-00',
    },
    itens: [
      { id: '1', item: 1, descricao: 'Notebook i7 16GB RAM', especificacao: 'Processador Intel Core i7 12ª geração, 16GB RAM DDR4, SSD 512GB NVMe, Tela 15.6" Full HD, Windows 11 Pro', unidadeMedida: 'un', valorUnitario: 6000, qtdRegistrada: 60, marca: 'Dell', modelo: 'Latitude 5530' },
      { id: '2', item: 2, descricao: 'Monitor 27" 4K', especificacao: 'Monitor LED 27 polegadas, resolução 4K (3840x2160), painel IPS, taxa de atualização 60Hz, HDMI e DisplayPort', unidadeMedida: 'un', valorUnitario: 3500, qtdRegistrada: 40, marca: 'LG', modelo: '27UK850' },
      { id: '3', item: 3, descricao: 'Switch 24 portas', especificacao: 'Switch gerenciável 24 portas Gigabit Ethernet 10/100/1000, rack 19"', unidadeMedida: 'un', valorUnitario: 2200, qtdRegistrada: 20, marca: 'Cisco', modelo: 'SG250-24' },
    ],
  },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function ArpVisualizarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const arp = id ? arpsDetalhadas[id as keyof typeof arpsDetalhadas] : null;

  if (!arp) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">ARP não encontrada</p>
        <Button onClick={() => navigate('/atas/gestao')}>Voltar para Listagem</Button>
      </div>
    );
  }

  const valorTotal = arp.itens.reduce((total, item) => total + item.qtdRegistrada * item.valorUnitario, 0);
  const mesesVigencia = Math.ceil(
    (new Date(arp.vigenciaFinal).getTime() - new Date(arp.vigenciaInicial).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const clausulaAdesao = arp.aceitaAdesao ? 4 : null;
  const clausulaOffset = arp.aceitaAdesao ? 1 : 0;
  const ordinals = ['PRIMEIRA', 'SEGUNDA', 'TERCEIRA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÉTIMA', 'OITAVA', 'NONA'];

  return (
    <div className="min-h-full">
      <div className="no-print sticky top-0 z-10 bg-background border-b mb-6 py-4">
        <div className="container max-w-5xl flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/atas/${id}`)}>
            <NavArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="default" size="sm" onClick={() => alert('Funcionalidade de exportação em PDF será implementada com biblioteca específica')}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl pb-12">
        <div className="bg-white text-black p-8 lg:p-12 shadow-lg print:shadow-none print:p-0">
          <div className="text-center mb-8 pb-6 border-b-2 border-black">
            <h1 className="text-xl font-bold mb-2">{arp.orgaoGerenciador.toUpperCase()}</h1>
            <p className="text-sm">CNPJ: {arp.cnpjOrgao}</p>
            <h2 className="text-lg font-bold mt-4 mb-1">ATA DE REGISTRO DE PREÇOS</h2>
            <p className="text-base font-bold">{arp.numeroAta}</p>
          </div>

          <div className="mb-6 space-y-1 text-sm">
            <p><strong>Processo Administrativo:</strong> {arp.processoAdministrativo}</p>
            <p><strong>Modalidade:</strong> {arp.modalidadeLicitacao} nº {arp.numeroLicitacao}</p>
            <p><strong>Validade:</strong> {new Date(arp.vigenciaInicial).toLocaleDateString('pt-BR')} a {new Date(arp.vigenciaFinal).toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="mb-6 space-y-4 text-sm">
            <div>
              <p className="font-bold mb-2">ÓRGÃO GERENCIADOR:</p>
              <p>{arp.orgaoGerenciador}, inscrito no CNPJ sob o nº {arp.cnpjOrgao}.</p>
            </div>
            <div>
              <p className="font-bold mb-2">FORNECEDOR REGISTRADO:</p>
              <p>
                <strong>{arp.fornecedor.razaoSocial}</strong>, inscrita no CNPJ sob o nº {arp.fornecedor.cnpj}, com sede na {arp.fornecedor.endereco}, {arp.fornecedor.cidade}/{arp.fornecedor.uf}, CEP {arp.fornecedor.cep}, telefone {arp.fornecedor.telefone}, e-mail {arp.fornecedor.email}, neste ato representada por seu {arp.fornecedor.representanteLegal}, CPF {arp.fornecedor.cpfRepresentante}.
              </p>
            </div>
          </div>

          <div className="mb-6 text-sm">
            <p className="font-bold mb-2">OBJETO:</p>
            <p className="text-justify">{arp.objeto}.</p>
          </div>

          <div className="mb-6">
            <p className="font-bold mb-3 text-sm">ITENS REGISTRADOS:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-center w-12">Item</th>
                    <th className="border border-black p-2 text-left">Descrição/Especificação</th>
                    <th className="border border-black p-2 text-left w-24">Marca/Modelo</th>
                    <th className="border border-black p-2 text-center w-16">Unid.</th>
                    <th className="border border-black p-2 text-right w-24">Valor Unit.</th>
                    <th className="border border-black p-2 text-center w-16">Qtd.</th>
                    <th className="border border-black p-2 text-right w-28">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {arp.itens.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-black p-2 text-center">{item.item}</td>
                      <td className="border border-black p-2">
                        <p className="font-semibold mb-1">{item.descricao}</p>
                        <p className="text-gray-700">{item.especificacao}</p>
                      </td>
                      <td className="border border-black p-2">{item.marca}<br />{item.modelo}</td>
                      <td className="border border-black p-2 text-center">{item.unidadeMedida}</td>
                      <td className="border border-black p-2 text-right">{formatCurrency(item.valorUnitario)}</td>
                      <td className="border border-black p-2 text-center">{item.qtdRegistrada}</td>
                      <td className="border border-black p-2 text-right">{formatCurrency(item.qtdRegistrada * item.valorUnitario)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={6} className="border border-black p-2 text-right">VALOR TOTAL REGISTRADO:</td>
                    <td className="border border-black p-2 text-right">{formatCurrency(valorTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6 space-y-4 text-sm text-justify">
            <div>
              <p className="font-bold mb-2">CLÁUSULA PRIMEIRA - DO OBJETO</p>
              <p>A presente Ata tem por objeto o registro de preços para {arp.objeto}, conforme especificações constantes no Edital do {arp.modalidadeLicitacao} nº {arp.numeroLicitacao} e seus anexos, que fazem parte integrante desta Ata, independente de transcrição.</p>
            </div>
            <div>
              <p className="font-bold mb-2">CLÁUSULA SEGUNDA - DA VALIDADE DA ATA</p>
              <p>A presente Ata de Registro de Preços terá validade de {mesesVigencia} meses, contados a partir de {new Date(arp.vigenciaInicial).toLocaleDateString('pt-BR')}, até {new Date(arp.vigenciaFinal).toLocaleDateString('pt-BR')}, podendo ser prorrogada nos termos da legislação vigente.</p>
            </div>
            <div>
              <p className="font-bold mb-2">CLÁUSULA TERCEIRA - DA UTILIZAÇÃO DA ATA</p>
              <p>A presente Ata de Registro de Preços poderá ser utilizada por todos os órgãos e entidades da Administração Pública que desejarem, mediante prévia consulta ao órgão gerenciador, respeitadas as condições e normas estabelecidas na Lei Federal nº 14.133/2021.</p>
            </div>
            {clausulaAdesao && (
              <div>
                <p className="font-bold mb-2">CLÁUSULA QUARTA - DA ADESÃO À ATA (CARONA)</p>
                <p>Esta Ata de Registro de Preços aceita adesão de outros órgãos e entidades (carona), observando-se os limites e condições estabelecidos pela legislação vigente, especialmente o disposto no art. 86 da Lei Federal nº 14.133/2021.</p>
              </div>
            )}
            <div>
              <p className="font-bold mb-2">CLÁUSULA {ordinals[3 + clausulaOffset]} - DAS OBRIGAÇÕES DO FORNECEDOR</p>
              <p>O fornecedor registrado obriga-se a fornecer os itens registrados conforme especificações, prazos e condições estabelecidas no Edital e seus anexos, bem como a manter, durante toda a vigência da Ata, todas as condições de habilitação e qualificação exigidas na licitação.</p>
            </div>
            <div>
              <p className="font-bold mb-2">CLÁUSULA {ordinals[4 + clausulaOffset]} - DO PAGAMENTO</p>
              <p>O pagamento será efetuado mediante apresentação de Nota Fiscal/Fatura, após o fornecimento dos itens e atesto da nota fiscal pelo setor competente, no prazo de até 30 (trinta) dias, contados da data do atesto.</p>
            </div>
            <div>
              <p className="font-bold mb-2">CLÁUSULA {ordinals[5 + clausulaOffset]} - DAS PENALIDADES</p>
              <p>O descumprimento das obrigações assumidas ensejará a aplicação das sanções previstas na Lei Federal nº 14.133/2021, podendo culminar em multa, suspensão temporária ou declaração de inidoneidade.</p>
            </div>
            <div>
              <p className="font-bold mb-2">CLÁUSULA {ordinals[6 + clausulaOffset]} - DAS DISPOSIÇÕES FINAIS</p>
              <p>Integram esta Ata, o Edital do {arp.modalidadeLicitacao} nº {arp.numeroLicitacao} e seus anexos, bem como a proposta da empresa classificada.</p>
            </div>
          </div>

          <div className="mt-12 space-y-12 text-sm">
            <p className="text-center">{arp.orgaoGerenciador.split(' ')[0]}, {new Date().toLocaleDateString('pt-BR')}.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="border-t border-black pt-2 mt-16">
                  <p className="font-bold">{arp.orgaoGerenciador}</p>
                  <p>ÓRGÃO GERENCIADOR</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 mt-16">
                  <p className="font-bold">{arp.fornecedor.razaoSocial}</p>
                  <p>FORNECEDOR REGISTRADO</p>
                  <p className="text-xs mt-1">Representante: {arp.fornecedor.representanteLegal}<br />CPF: {arp.fornecedor.cpfRepresentante}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-xs text-center text-gray-600">
            <p>{arp.numeroAta} - Página 1/1</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          @page { size: A4; margin: 2cm; }
        }
      `}</style>
    </div>
  );
}
