import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'

export interface MapPoint {
  id: string
  label: string
  lat: number
  lng: number
  value: number
  detail: string
}

interface RegionMapProps {
  title: string
  points: MapPoint[]
  format?: (value: number) => string
  colorFor?: (value: number) => string
  height?: number
}

export const defaultColorFor = (value: number): string =>
  value >= 85 ? '#10b981' : value >= 75 ? '#f59e0b' : '#ef4444'

const BRAZIL_CENTER: [number, number] = [-14.2, -51.9]

export function RegionMap({
  title,
  points,
  format = (value) => String(value),
  colorFor = defaultColorFor,
  height = 320,
}: RegionMapProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div role="region" aria-label={`Mapa: ${title}`} style={{ height }} className="overflow-hidden rounded-lg">
        <MapContainer center={BRAZIL_CENTER} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={10 + p.value / 10}
              pathOptions={{ color: colorFor(p.value), fillColor: colorFor(p.value), fillOpacity: 0.6 }}
            >
              <Popup>
                <strong>{p.label}</strong>: {format(p.value)}
                <br />
                {p.detail}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <ul aria-label={`Valores: ${title}`} className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {points.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: colorFor(p.value) }} />
            {`${p.label}: ${format(p.value)}`}
          </li>
        ))}
      </ul>
    </section>
  )
}
