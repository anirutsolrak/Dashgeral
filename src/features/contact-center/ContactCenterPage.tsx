import { CallsByRegion } from './CallsByRegion'
import { ContactCenterCharts } from './ContactCenterCharts'
import { ContactCenterKpis } from './ContactCenterKpis'

export function ContactCenterPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Central de Confirmação</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Ligações para confirmar o endereço de entrega antes do envio do cartão.
      </p>
      <ContactCenterKpis />
      <ContactCenterCharts />
      <CallsByRegion />
    </section>
  )
}
