import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { CollectionPoint } from '@/hooks/useCollectionPoints';
import { getDistanceKm, formatDistance } from '@/lib/distance';
import { Button } from '@/components/ui/button';
import { Navigation, ExternalLink } from 'lucide-react';
import markerLogo from '@/assets/marker-logo.png';

interface MapViewProps {
  points: CollectionPoint[];
  userLocation: { lat: number; lng: number } | null;
  onLocateUser: () => void;
  apiKey: string;
}

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 0.0349, lng: -51.0694 }; // UEAP Macapá

const MapView = ({ points, userLocation, onLocateUser, apiKey }: MapViewProps) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: apiKey });
  const [selected, setSelected] = useState<CollectionPoint | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => setMap(map), []);

  useEffect(() => {
    if (map && userLocation) {
      map.panTo(userLocation);
    }
  }, [map, userLocation]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || defaultCenter}
        zoom={14}
        onLoad={onLoad}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, gestureHandling: 'greedy', rotateControl: false }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: 'hsl(142, 64%, 36%)',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            }}
          />
        )}
        {points.map((point) => (
          <Marker
            key={point.id}
            position={{ lat: point.latitude, lng: point.longitude }}
            onClick={() => setSelected(point)}
            icon={{
              url: markerLogo,
              scaledSize: new google.maps.Size(42, 42),
              anchor: new google.maps.Point(21, 42),
            }}
          />
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.latitude, lng: selected.longitude }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="p-1 min-w-[200px]">
              <h3 className="font-semibold text-base mb-1">{selected.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{selected.address}</p>
              {selected.opening_hours && (
                <p className="text-sm text-gray-500 mb-1">🕐 {selected.opening_hours}</p>
              )}
              {userLocation && (
                <p className="text-sm font-medium text-green-700 mb-2">
                  📍 {formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, selected.latitude, selected.longitude))}
                </p>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-700 font-medium hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Como chegar
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <Button
        onClick={onLocateUser}
        size="icon"
        className="absolute bottom-4 right-4 shadow-lg rounded-full h-12 w-12"
      >
        <Navigation className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MapView;
