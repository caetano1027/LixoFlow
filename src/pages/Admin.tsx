import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollectionPoints, useCreatePoint, useUpdatePoint, useDeletePoint, CollectionPoint, CollectionPointInsert } from '@/hooks/useCollectionPoints';
import { useTruckSchedules, useCreateSchedule, useUpdateSchedule, useDeleteSchedule, TruckSchedule, TruckScheduleInsert } from '@/hooks/useTruckSchedules';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Truck } from 'lucide-react';

const emptyForm: CollectionPointInsert = {
  name: '',
  address: '',
  latitude: 0,
  longitude: 0,
  opening_hours: '',
  materials: ['reciclável'],
  active: true,
};

const emptySchedule: TruckScheduleInsert = {
  zone: '',
  days: '',
  time: '',
  notes: '',
  active: true,
};

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const { data: points = [] } = useCollectionPoints();
  const createPoint = useCreatePoint();
  const updatePoint = useUpdatePoint();
  const deletePoint = useDeletePoint();
  const { data: schedules = [] } = useTruckSchedules();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const { toast } = useToast();

  const [form, setForm] = useState<CollectionPointInsert>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [scheduleForm, setScheduleForm] = useState<TruckScheduleInsert>(emptySchedule);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Acesso restrito a administradores.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePoint.mutateAsync({ id: editingId, ...form });
        toast({ title: 'Ponto atualizado!' });
      } else {
        await createPoint.mutateAsync(form);
        toast({ title: 'Ponto criado!' });
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const startEdit = (point: CollectionPoint) => {
    setForm({
      name: point.name,
      address: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      opening_hours: point.opening_hours || '',
      materials: point.materials,
      active: point.active,
    });
    setEditingId(point.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este ponto?')) return;
    try {
      await deletePoint.mutateAsync(id);
      toast({ title: 'Ponto excluído!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const updateField = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateScheduleField = (field: string, value: any) => setScheduleForm((prev) => ({ ...prev, [field]: value }));

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingScheduleId) {
        await updateSchedule.mutateAsync({ id: editingScheduleId, ...scheduleForm });
        toast({ title: 'Horário atualizado!' });
      } else {
        await createSchedule.mutateAsync(scheduleForm);
        toast({ title: 'Horário criado!' });
      }
      setScheduleForm(emptySchedule);
      setEditingScheduleId(null);
      setShowScheduleForm(false);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const startEditSchedule = (s: TruckSchedule) => {
    setScheduleForm({
      zone: s.zone,
      days: s.days,
      time: s.time,
      notes: s.notes || '',
      active: s.active,
    });
    setEditingScheduleId(s.id);
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Excluir este horário?')) return;
    try {
      await deleteSchedule.mutateAsync(id);
      toast({ title: 'Horário excluído!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />
      <div className="max-w-3xl mx-auto w-full p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          {!showForm && (
            <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="gap-1">
              <Plus className="h-4 w-4" /> Novo Ponto
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Ponto' : 'Novo Ponto de Coleta'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input placeholder="Nome" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                <Input placeholder="Endereço" value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" step="any" placeholder="Latitude" value={form.latitude || ''} onChange={(e) => updateField('latitude', parseFloat(e.target.value) || 0)} required />
                  <Input type="number" step="any" placeholder="Longitude" value={form.longitude || ''} onChange={(e) => updateField('longitude', parseFloat(e.target.value) || 0)} required />
                </div>
                <Input placeholder="Horário (ex: Seg-Sex 8h-18h)" value={form.opening_hours || ''} onChange={(e) => updateField('opening_hours', e.target.value)} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={createPoint.isPending || updatePoint.isPending}>
                    {editingId ? 'Salvar' : 'Criar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {points.map((point) => (
            <Card key={point.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{point.name}</h3>
                  <p className="text-sm text-muted-foreground">{point.address}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(point)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(point.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {points.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum ponto cadastrado.</p>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> Horários do caminhão de lixo
          </h2>
          {!showScheduleForm && (
            <Button
              onClick={() => { setScheduleForm(emptySchedule); setEditingScheduleId(null); setShowScheduleForm(true); }}
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> Novo Horário
            </Button>
          )}
        </div>

        {showScheduleForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingScheduleId ? 'Editar Horário' : 'Novo Horário do Caminhão'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleSubmit} className="space-y-3">
                <Input placeholder="Zona / Bairro" value={scheduleForm.zone} onChange={(e) => updateScheduleField('zone', e.target.value)} required />
                <Input placeholder="Dias (ex: Seg, Qua, Sex)" value={scheduleForm.days} onChange={(e) => updateScheduleField('days', e.target.value)} required />
                <Input placeholder="Horário (ex: 18h - 20h)" value={scheduleForm.time} onChange={(e) => updateScheduleField('time', e.target.value)} required />
                <Input placeholder="Observações (opcional)" value={scheduleForm.notes || ''} onChange={(e) => updateScheduleField('notes', e.target.value)} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={createSchedule.isPending || updateSchedule.isPending}>
                    {editingScheduleId ? 'Salvar' : 'Criar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowScheduleForm(false); setEditingScheduleId(null); }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {schedules.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{s.zone}</h3>
                  <p className="text-sm text-muted-foreground">{s.days} • {s.time}</p>
                  {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEditSchedule(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(s.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {schedules.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum horário cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
