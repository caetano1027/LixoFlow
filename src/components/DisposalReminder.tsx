import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlarmClock, BellRing, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RETRY_MS = 5 * 60 * 1000; // 5 minutos

const DisposalReminder = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('');
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [ringing, setRinging] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const stopSound = () => {
    try {
      oscRef.current?.stop();
      oscRef.current?.disconnect();
      gainRef.current?.disconnect();
    } catch {
      /* noop */
    }
    oscRef.current = null;
    gainRef.current = null;
  };

  const playSound = () => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current!;
      if (ctx.state === 'suspended') ctx.resume();
      stopSound();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(ctx.destination);
      const now = ctx.currentTime;
      // bipes repetidos
      for (let i = 0; i < 30; i++) {
        const t = now + i * 0.6;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.4, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      }
      osc.start(now);
      osc.stop(now + 30 * 0.6);
      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      console.error('audio error', e);
    }
  };

  const triggerAlarm = () => {
    setRinging(true);
    playSound();
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Hora do descarte', {
          body: 'Lembrete para descartar o lixo. Confirme o descarte para parar o alarme.',
          icon: '/favicon.ico',
        });
      } catch {
        /* noop */
      }
    }
    if ('vibrate' in navigator) navigator.vibrate([400, 200, 400, 200, 400]);

    // Reagenda em 5 min se não confirmar
    clearTimer();
    timeoutRef.current = window.setTimeout(() => {
      triggerAlarm();
    }, RETRY_MS);
  };

  const handleSchedule = async () => {
    if (!time) {
      toast({ title: 'Escolha um horário', variant: 'destructive' });
      return;
    }
    // Pede permissão de notificação (despertador do navegador)
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        /* noop */
      }
    }

    // Destrava áudio (precisa ser dentro do clique do usuário)
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
    } catch {
      /* noop */
    }

    const [h, m] = time.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target.getTime() <= Date.now()) {
      target.setDate(target.getDate() + 1); // próximo dia
    }
    const delay = target.getTime() - Date.now();

    clearTimer();
    timeoutRef.current = window.setTimeout(triggerAlarm, delay);
    setScheduledFor(target);
    setOpen(false);

    toast({
      title: 'Alarme agendado',
      description: `Vamos te lembrar às ${target.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}.`,
    });
  };

  const handleConfirm = () => {
    clearTimer();
    stopSound();
    setRinging(false);
    setScheduledFor(null);
    toast({
      title: 'Descarte confirmado ✅',
      description: 'Obrigado por cuidar do meio ambiente!',
    });
  };

  const handleCancel = () => {
    clearTimer();
    stopSound();
    setRinging(false);
    setScheduledFor(null);
  };

  useEffect(() => {
    return () => {
      clearTimer();
      stopSound();
    };
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="h-auto py-3 px-5 flex-col gap-0 leading-tight shadow-md"
          >
            <span className="flex items-center gap-2 text-base font-semibold">
              <AlarmClock className="h-5 w-5" /> Hora do descarte
            </span>
            <span className="text-[11px] font-normal opacity-90">
              Lembrete para descartar o lixo
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlarmClock className="h-5 w-5 text-primary" /> Agendar lembrete
            </DialogTitle>
            <DialogDescription>
              Escolha o horário que você pretende descartar o lixo. Tocaremos um alarme
              no horário escolhido. Caso não confirme o descarte, o alarme tocará
              novamente a cada 5 minutos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Horário do descarte</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Permita o envio de notificações para que o alarme funcione mesmo com
              outra aba ativa. Mantenha esta página aberta no horário marcado.
            </p>
          </div>
          <Button onClick={handleSchedule} className="w-full">
            <BellRing className="h-4 w-4" /> Agendar alarme
          </Button>
        </DialogContent>
      </Dialog>

      {scheduledFor && !ringing && (
        <div className="fixed bottom-4 right-4 z-40 bg-card border border-primary/40 shadow-lg rounded-lg p-3 flex items-center gap-3 max-w-xs">
          <BellRing className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Lembrete agendado</p>
            <p className="text-muted-foreground text-xs">
              Toca às{' '}
              {scheduledFor.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      )}

      {ringing && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-2 border-primary rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-pulse">
            <AlarmClock className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Hora do descarte!</h2>
            <p className="text-muted-foreground">
              É a hora de descartar o seu lixo. Confirme abaixo para parar o alarme.
              Caso contrário, ele tocará novamente em 5 minutos.
            </p>
            <Button size="lg" onClick={handleConfirm} className="w-full">
              <CheckCircle2 className="h-5 w-5" /> Confirmar descarte
            </Button>
            <Button variant="ghost" onClick={handleCancel} className="w-full">
              Cancelar lembrete
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default DisposalReminder;
