import 'leaflet/dist/leaflet.css'
import { Circle, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'
import { BRAZIL_CENTER, OSM_ATTRIBUTION, OSM_TILE_URL } from './geo'

export interface CoverageArea {
  id: string
  label: string
  lat: number
  lng: number
  radiusKm: number
  detail: string
}

interface CoverageMapProps {
  title: string
  areas: CoverageArea[]
  height?: number
}

export function CoverageMap({ title, areas, height = 320 }: CoverageMapProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div
        role="region"
        aria-label={`Mapa: ${title}`}
        style={{ height }}
        className="overflow-hidden rounded-lg"
      >
        <MapContainer
          center={BRAZIL_CENTER}
          zoom={4}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          {areas.map((a) => (
            <Circle
              key={a.id}
              center={[a.lat, a.lng]}
              radius={a.radiusKm * 1000}
              pathOptions={{ color: '#1baf7a', fillColor: '#1baf7a', fillOpacity: 0.25 }}
            >
              <Popup>
                <strong>{a.label}</strong>
                <br />
                {a.detail}
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
      <ul
        aria-label={`Áreas: ${title}`}
        className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2"
      >
        {areas.map((a) => (
          <li key={a.id}>{`${a.label}: raio de ${a.radiusKm} km, ${a.detail}`}</li>
        ))}
      </ul>
    </section>
  )
}
