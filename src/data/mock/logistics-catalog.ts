import type { LogisticsCatalog } from '@/data/types/logistics'

export const LOGISTICS_CATALOG: LogisticsCatalog = {
  types: [
    { id: 'flash', label: 'Flash' },
    { id: 'terceiros', label: 'Terceiros' },
  ],
  groups: [
    {
      key: 'entregue',
      label: 'Entregue',
      steps: [
        { id: 'entregue-ciclo-encerrado', label: 'Ciclo operacional encerrado' },
        { id: 'entregue-comprovante', label: 'Comprovante registrado' },
        { id: 'entregue-terceiro', label: 'Entregue pelo terceiro' },
        { id: 'entregue-via-rt', label: 'Entrega registrada via RT' },
        { id: 'entregue-pod-fragmentado', label: 'POD fragmentado' },
      ],
    },
    {
      key: 'pendente',
      label: 'Em trânsito',
      steps: [
        { id: 'pendente-em-rota', label: 'Entrega em andamento (na rua)' },
        { id: 'pendente-postado', label: 'Postado, logística iniciada' },
        { id: 'pendente-transferencia', label: 'Preparada para transferência' },
        { id: 'pendente-nova-tentativa', label: 'Programado nova tentativa' },
        { id: 'pendente-nao-efetuada', label: 'Entrega não efetuada' },
        { id: 'pendente-rastreamento', label: 'Não recebido, em rastreamento' },
        { id: 'pendente-aguardando-retirada', label: 'Aguardando retirada' },
        { id: 'pendente-retido-devolucao', label: 'Retido para devolução' },
      ],
    },
    {
      key: 'custodia',
      label: 'Custódia',
      steps: [
        { id: 'custodia-telemarketing', label: 'Aguardando telemarketing' },
        { id: 'custodia-devolucao-habilitada', label: 'Devolução habilitada' },
        { id: 'custodia-habilitado-reenvio', label: 'Habilitado para reenvio' },
        { id: 'custodia-objeto-retirado', label: 'Objeto retirado da custódia' },
        { id: 'custodia-devolvido', label: 'Devolvido' },
      ],
    },
    {
      key: 'devolvido',
      label: 'Em devolução',
      steps: [
        { id: 'devolvido-ciclo-encerrado', label: 'Ciclo operacional encerrado' },
        { id: 'devolvido-comprovante', label: 'Comprovante registrado' },
        { id: 'devolvido-protocolada-cliente', label: 'Devolução protocolada ao cliente' },
        { id: 'devolvido-conciliada', label: 'Devolução conciliada' },
        { id: 'devolvido-recebida-avulsa', label: 'Devolução recebida avulsa' },
        { id: 'devolvido-procedimento-retorno', label: 'Em procedimento de retorno' },
        { id: 'devolvido-via-terceiro', label: 'Devolvendo via terceiro' },
      ],
    },
    {
      key: 'reenviado',
      label: 'Reenviado',
      steps: [
        { id: 'reenviado-ciclo-encerrado', label: 'Ciclo operacional encerrado' },
        { id: 'reenviado-habilitado', label: 'Habilitado para reenvio' },
      ],
    },
    {
      key: 'sinistrado',
      label: 'Sinistrado',
      steps: [
        { id: 'sinistrado-ciclo-encerrado', label: 'Ciclo operacional encerrado' },
        { id: 'sinistrado-terceiro', label: 'Sinistrado pelo terceiro' },
      ],
    },
  ],
}
