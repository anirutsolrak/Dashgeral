import type { OrgNode, WorkflowDoc, WorkflowInfo, WorkflowKpi } from '@/data/types/card-processing'

const FLOWS: Record<WorkflowKpi, string[]> = {
  integration: [
    'Proposta recebida',
    'Validação de documentos',
    'Digitação no sistema',
    'Conferência',
    'Integração concluída',
  ],
  accounts: [
    'Proposta digitada',
    'Análise de margem',
    'Criação da conta',
    'Confirmação de dados',
    'Conta ativa',
  ],
  cards: ['Conta criada', 'Emissão do cartão', 'Postagem', 'Rastreio', 'Entrega'],
  insurance: [
    'Proposta digitada',
    'Oferta de seguro',
    'Aceite do cliente',
    'Emissão da apólice',
    'Cessão',
  ],
}

const TEAM_SIZE: Record<WorkflowKpi, number> = {
  integration: 3,
  accounts: 2,
  cards: 6,
  insurance: 3,
}

const DOCS: Record<WorkflowKpi, WorkflowDoc[]> = {
  integration: [
    {
      id: 'pop-digitacao',
      title: 'POP: Digitação de propostas',
      description: 'Passo a passo da digitação e conferência.',
    },
    {
      id: 'pop-integracao',
      title: 'POP: Tratamento de pendências',
      description: 'Como tratar propostas paradas na integração.',
    },
  ],
  accounts: [
    {
      id: 'pop-contas',
      title: 'POP: Criação de contas',
      description: 'Regras de análise de margem e abertura de conta.',
    },
  ],
  cards: [
    {
      id: 'pop-emissao',
      title: 'POP: Emissão e postagem',
      description: 'Fluxo de emissão, postagem e rastreio.',
    },
    {
      id: 'pop-devolucao',
      title: 'POP: Cartões devolvidos',
      description: 'Tratamento de devolução e reenvio.',
    },
  ],
  insurance: [
    {
      id: 'pop-seguros',
      title: 'POP: Oferta de seguros',
      description: 'Abordagem, aceite e emissão da apólice.',
    },
    {
      id: 'pop-cessao',
      title: 'POP: Cessão de casos',
      description: 'Critérios e etapas da cessão.',
    },
  ],
}

function buildOrg(kpi: WorkflowKpi): OrgNode {
  const team: OrgNode[] = Array.from({ length: TEAM_SIZE[kpi] }, (_, i) => ({
    id: `analista-${i + 1}`,
    name: `Analista ${i + 1}`,
    role: 'Equipe',
    children: [],
  }))
  return {
    id: 'gestor',
    name: 'Gestor Geral',
    role: 'Gestão',
    children: [
      { id: 'supervisor', name: 'Supervisor de Operações', role: 'Supervisão', children: team },
    ],
  }
}

export function getWorkflowInfo(kpi: WorkflowKpi): WorkflowInfo {
  return {
    flow: FLOWS[kpi].map((label, i) => ({ id: `step-${i + 1}`, label })),
    org: buildOrg(kpi),
    docs: DOCS[kpi].map((d) => ({ ...d })),
  }
}
