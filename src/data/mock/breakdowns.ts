import type {
  AccountReasons,
  InsuranceBreakdown,
  IntegrationReasons,
} from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import { buildOverview } from './overview'
import { createRng } from './random'
import { seedFor, splitByWeights } from './scale'

const STOP_REASONS = [
  'Margem negativa',
  'Em criação de conta',
  'Endereço errado',
  'Benefício assistencial',
  'Emissão não autorizada',
] as const
const NON_DIGITIZED = ['Saque realizado', 'Liquidado'] as const
const CREATED = ['Conta nova', 'Conta portada', 'Conta reaproveitada'] as const
const NOT_CREATED = [
  'Endereço errado',
  'Documentação incompleta',
  'Dados inválidos',
  'Erro de sistema',
] as const

export function buildIntegrationReasons(f: GlobalFilters): IntegrationReasons {
  const o = buildOverview(f)
  const rng = createRng(seedFor(f, 'integration-reasons'))
  return {
    stopReasons: splitByWeights(Math.round(o.integration.digitized * 0.2), STOP_REASONS, rng),
    nonDigitizedBreakdown: splitByWeights(o.integration.notDigitized, NON_DIGITIZED, rng),
  }
}

export function buildAccountReasons(f: GlobalFilters): AccountReasons {
  const o = buildOverview(f)
  const rng = createRng(seedFor(f, 'account-reasons'))
  return {
    created: splitByWeights(o.accounts.created, CREATED, rng),
    notCreated: splitByWeights(o.accounts.notCreated, NOT_CREATED, rng),
  }
}

export function buildInsuranceBreakdown(f: GlobalFilters): InsuranceBreakdown {
  const { insurance } = buildOverview(f)
  const rng = createRng(seedFor(f, 'insurance'))
  const large = Math.round(insurance.withInsurance * (0.55 + rng.next() * 0.2))
  const assigned = Math.round(large * (0.4 + rng.next() * 0.3))
  return {
    byCoverage: [
      { reason: 'Com seguro', count: insurance.withInsurance },
      { reason: 'Sem seguro', count: insurance.withoutInsurance },
    ],
    byValue: [
      { reason: 'Maiores que R$ 200', count: large },
      { reason: 'Menores que R$ 200', count: insurance.withInsurance - large },
    ],
    byAssignment: [
      { reason: 'Casos cedidos', count: assigned },
      { reason: 'Em processo de cessão', count: large - assigned },
    ],
  }
}
