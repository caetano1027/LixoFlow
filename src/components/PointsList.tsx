import { CollectionPoint } from '@/hooks/useCollectionPoints';
import { getDistanceKm, formatDistance } from '@/lib/distance';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, ExternalLink } from 'lucide-react';

interface PointsListProps {
  points: CollectionPoint[];
  userLocation: { lat: number; lng: number } | null;
}

const PointsList = ({ points, userLocation }: PointsListProps) => {
  const sorted = userLocation
    ? [...points].sort((a, b) =>
        getDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude) -
        getDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
      )
    : points;

  if (sorted.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Nenhum ponto de coleta cadastrado ainda.
      </div>
    );
  }

  const bestPoint = userLocation && sorted.length > 0 ? sorted[0] : null;

  return (
    <div className="p-4 space-y-3">
      {bestPoint && userLocation && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary">Ponto de coleta mais próximo</p>
            <p className="text-base font-bold text-foreground truncate">{bestPoint.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {bestPoint.address} — {formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, bestPoint.latitude, bestPoint.longitude))}
            </p>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${bestPoint.latitude},${bestPoint.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <ExternalLink className="h-4 w-4" /> Ir
          </a>
        </div>
      )}
      <h2 className="font-semibold text-lg text-foreground">Todos os pontos</h2>
      {sorted.map((point) => {
        const isBest = bestPoint?.id === point.id;
        const dist = userLocation
          ? formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, point.latitude, point.longitude))
          : null;
        return (
          <Card key={point.id} className={`hover:shadow-md transition-shadow ${isBest ? 'ring-2 ring-primary/50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium text-foreground flex items-center gap-1">
                    {isBest && <span className="text-sm">⭐</span>}
                    {point.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {point.address}
                  </p>
                  {point.opening_hours && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {point.opening_hours}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 ml-3">
                  {dist && (
                    <span className="text-sm font-semibold text-primary">{dist}</span>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> Rota
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PointsList;
