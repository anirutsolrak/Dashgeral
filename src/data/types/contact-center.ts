/** Central que liga para o cliente e confirma o endereço de entrega do cartão. */
export interface ContactCenterOverview {
  total: number
  /** Atendidas: duração maior que zero. */
  attended: number
  /** Abandonadas: o cliente não atendeu (duração zero). */
  abandoned: number
  /** Tabulação "Endereço confirmado". */
  confirmed: number
  /** Atendidas sem resultado: ausente, desligou, caiu, muda, caixa postal. */
  notEffective: number
  /** Tempo médio de atendimento das ligações atendidas, em segundos. */
  avgHandleSeconds: number
  /** Soma da duração das ligações não efetivas, em segundos. */
  lostSeconds: number
}

export interface HourlyCalls {
  label: string
  attended: number
  abandoned: number
}

export interface OperatorStat {
  name: string
  calls: number
  confirmed: number
  avgHandleSeconds: number
}

export interface RegionCalls {
  region: string
  label: string
  lat: number
  lng: number
  calls: number
  confirmed: number
}

export interface TabulationCount {
  label: string
  value: number
}
