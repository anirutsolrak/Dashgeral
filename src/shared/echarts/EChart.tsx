import type { EChartsType } from 'echarts/core'
import { useEffect, useRef } from 'react'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'
import { echarts, type EChartsOption } from './core'

interface EChartProps {
  title: string
  description: string
  option: EChartsOption
  height?: number
}

export function EChart({ title, description, option, height = 320 }: EChartProps) {
  const host = useRef<HTMLDivElement>(null)
  const chart = useRef<EChartsType | null>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const instance = echarts.init(el, undefined, { renderer: 'svg' })
    chart.current = instance
    const observer = new ResizeObserver(() => instance.resize())
    observer.observe(el)
    return () => {
      observer.disconnect()
      instance.dispose()
      chart.current = null
    }
  }, [])

  useEffect(() => {
    chart.current?.setOption(option, true)
  }, [option])

  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div ref={host} role="img" aria-label={`${title}. ${description}`} style={{ height }} />
    </section>
  )
}
