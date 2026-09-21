import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'
import { BRAZIL_CENTER, OSM_ATTRIBUTION, OSM_TILE_URL } from './geo'

export interface RouteHub {
  id: string
  label: string
  lat: number
  lng: number
}
export interface RouteLine {
  id: string
  from: string
  to: string
  volume: number
}

interface RouteMapProps {
  title: string
  hubs: RouteHub[]
  routes: RouteLine[]
  format?: (value: number) => string
  height?: number
}

export function RouteMap({ title, hubs, routes, format = (value) => String(value), height = 320 }: RouteMapProps) {
  const byId = new Map(hubs.map((h) => [h.id, h]))
  const lines = routes.flatMap((r) => {
    const from = byId.get(r.from)
    const to = byId.get(r.to)
    return from && to ? [{ route: r, from, to }] : []
  })
  const max = Math.max(1, ...lines.map((l) => l.route.volume))
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div role="region" aria-label={`Mapa: ${title}`} style={{ height }} className="overflow-hidden rounded-lg">
        <MapContainer center={BRAZIL_CENTER} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          {lines.map(({ route, from, to }) => (
            <Polyline
              key={route.id}
              positions={[[from.lat, from.lng], [to.lat, to.lng]]}
              pathOptions={{ color: '#3b82f6', weight: 2 + (route.volume / max) * 6, opacity: 0.7 }}
            />
          ))}
          {hubs.map((h) => (
            <CircleMarker key={h.id} center={[h.lat, h.lng]} radius={7} pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.9 }}>
              <Popup>{h.label}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <ul aria-label={`Rotas: ${title}`} className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {lines.map(({ route, from, to }) => (
          <li key={route.id}>{`${from.label} → ${to.label}: ${format(route.volume)}`}</li>
        ))}
      </ul>
    </section>
  )
}
