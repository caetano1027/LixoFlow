import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import PointsList from '@/components/PointsList';
import { useCollectionPoints } from '@/hooks/useCollectionPoints';
import { useToast } from '@/hooks/use-toast';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBd0NDNY19ctCvv0xvMmQ8-2Tctnc8iSdM';

const Index = () => {
  const { data: points = [], isLoading } = useCollectionPoints();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const locateUser = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocalização não suportada', variant: 'destructive' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast({ title: 'Não foi possível obter sua localização', variant: 'destructive' })
    );
  };

  useEffect(() => { locateUser(); }, []);

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Chave do Google Maps necessária</h1>
            <p className="text-muted-foreground">
              Para usar o mapa, adicione sua chave de API do Google Maps como variável de ambiente <code className="bg-muted px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code>.
            </p>
            <p className="text-sm text-muted-foreground">
              Crie uma chave gratuita em{' '}
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google Cloud Console
              </a>
              {' '}habilitando a API "Maps JavaScript API".
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col">
        <div className="h-[60vh] md:h-[65vh]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full bg-muted">
              <p className="text-muted-foreground">Carregando pontos...</p>
            </div>
          ) : (
            <MapView
              points={points}
              userLocation={userLocation}
              onLocateUser={locateUser}
              apiKey={GOOGLE_MAPS_KEY}
            />
          )}
        </div>
        <div className="flex-1 overflow-auto">
          <PointsList points={points} userLocation={userLocation} />
        </div>
      </div>
    </div>
  );
};

export default Index;
