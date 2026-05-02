import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { useTruckSchedules } from '@/hooks/useTruckSchedules';
import { Truck, Clock, MapPin } from 'lucide-react';

const TruckSchedules = () => {
  const { data: schedules = [], isLoading } = useTruckSchedules();

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />
      <div className="max-w-3xl mx-auto w-full p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vir até você</h1>
            <p className="text-sm text-muted-foreground">
              Confira os horários em que o caminhão de lixo passa em cada zona da cidade.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando horários...</p>
        ) : schedules.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum horário cadastrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {schedules.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {s.zone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {s.days} • {s.time}
                  </div>
                  {s.notes && <p className="text-sm text-muted-foreground pl-6">{s.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckSchedules;
