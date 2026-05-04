import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCreateReport, ProblemType, PROBLEM_TYPE_LABELS } from '@/hooks/useProblemReports';

const ReportProblem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createReport = useCreateReport();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ProblemType>('ponto_cheio');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = (v: boolean) => {
    if (v && !user) {
      toast({ title: 'Faça login para reportar um problema' });
      navigate('/auth');
      return;
    }
    setOpen(v);
    if (v) requestLocation();
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocalização não suportada', variant: 'destructive' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast({ title: 'Não foi possível obter a localização', variant: 'destructive' });
      }
    );
  };

  const reset = () => {
    setType('ponto_cheio');
    setDescription('');
    setPhoto(null);
    setLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !location) {
      toast({ title: 'Localização necessária', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      if (photo) {
        const ext = photo.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('problem-photos').upload(path, photo);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('problem-photos').getPublicUrl(path);
        photo_url = data.publicUrl;
      }
      await createReport.mutateAsync({
        user_id: user.id,
        problem_type: type,
        description: description || null,
        latitude: location.lat,
        longitude: location.lng,
        photo_url,
      });
      toast({ title: 'Problema reportado com sucesso!' });
      reset();
      setOpen(false);
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary">
          <AlertTriangle className="h-4 w-4" /> Reportar problema
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reportar um problema</DialogTitle>
          <DialogDescription>Conte o que aconteceu para ajudarmos a resolver.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Localização</Label>
            {locating ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Obtendo localização...
              </p>
            ) : location ? (
              <p className="text-sm text-muted-foreground">
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={requestLocation}>
                Permitir localização
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de problema</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as ProblemType)}>
              {(Object.keys(PROBLEM_TYPE_LABELS) as ProblemType[]).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <RadioGroupItem value={k} id={k} />
                  <Label htmlFor={k} className="font-normal cursor-pointer">{PROBLEM_TYPE_LABELS[k]}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">
              Descrição {type === 'outro' ? '' : '(opcional)'}
            </Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
              placeholder={type === 'outro' ? 'Descreva o problema' : 'Detalhes adicionais...'}
              required={type === 'outro'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Foto (opcional)</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting || !location}>
              {submitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportProblem;
