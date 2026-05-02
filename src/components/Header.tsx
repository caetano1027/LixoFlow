import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Map, Truck } from 'lucide-react';
import logo from '@/assets/logo.png';

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-lg">
          <img src={logo} alt="LixoFlow" className="h-7 w-7" />
          LixoFlow
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/horarios" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="h-auto py-1 flex-col gap-0 leading-tight border border-primary">
              <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Vir até você</span>
              <span className="text-[10px] font-normal text-muted-foreground">(Mostra os horários que o caminhão de lixo passa)</span>
            </Button>
          </Link>
          <Link to="/horarios" className="sm:hidden">
            <Button variant="ghost" size="icon" aria-label="Vir até você" className="border border-primary">
              <Truck className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1 border border-primary">
              <Map className="h-4 w-4" /> Mapa
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-1 border border-primary">
                <Shield className="h-4 w-4" /> Admin
              </Button>
            </Link>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut} className="gap-1">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
