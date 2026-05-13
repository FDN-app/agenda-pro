import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { listarPacientes, type Paciente } from '@/lib/api/pacientes';

interface BuscadorPacienteProps {
  /** ID del paciente seleccionado */
  value: string | null;
  /** Callback al seleccionar un paciente */
  onChange: (pacienteId: string, paciente: Paciente) => void;
  /** Paciente precargado (para modo editar, evita un fetch extra) */
  pacienteInicial?: Pick<Paciente, 'id' | 'nombre' | 'apellido' | 'telefono'> | null;
  /** Deshabilitar el selector */
  disabled?: boolean;
}

export function BuscadorPaciente({
  value,
  onChange,
  pacienteInicial,
  disabled = false,
}: BuscadorPacienteProps) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [resultados, setResultados] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [labelSeleccionado, setLabelSeleccionado] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mostrar label del paciente inicial
  useEffect(() => {
    if (pacienteInicial && value === pacienteInicial.id) {
      setLabelSeleccionado(
        `${pacienteInicial.nombre} ${pacienteInicial.apellido}`
      );
    }
  }, [pacienteInicial, value]);

  // Debounce de búsqueda (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busqueda]);

  // Fetch de pacientes cuando cambia la búsqueda debounced
  useEffect(() => {
    if (!open) return;

    // Cargar resultados iniciales o por búsqueda
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const result = await listarPacientes({
          busqueda: busquedaDebounced || undefined,
          porPagina: 10,
          pagina: 0,
        });
        setResultados(result.pacientes);
      } catch (err) {
        console.error('Error buscando pacientes:', err);
        setResultados([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, [busquedaDebounced, open]);

  const handleSelect = (paciente: Paciente) => {
    onChange(paciente.id, paciente);
    setLabelSeleccionado(`${paciente.nombre} ${paciente.apellido}`);
    setOpen(false);
    setBusqueda('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Buscar paciente"
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          {value ? labelSeleccionado : 'Buscar paciente...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Nombre, apellido o teléfono..."
            value={busqueda}
            onValueChange={setBusqueda}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
              </div>
            )}

            {!loading && resultados.length === 0 && busquedaDebounced.length > 0 && (
              <CommandEmpty>
                <div className="text-center space-y-2">
                  <p>Sin resultados para &quot;{busquedaDebounced}&quot;</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => {
                      setOpen(false);
                      window.location.href = '/pacientes';
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear nuevo paciente
                  </Button>
                </div>
              </CommandEmpty>
            )}

            {!loading && resultados.length === 0 && busquedaDebounced.length === 0 && (
              <CommandEmpty>Escribí al menos 1 carácter para buscar.</CommandEmpty>
            )}

            {!loading && resultados.length > 0 && (
              <CommandGroup>
                {resultados.map(paciente => (
                  <CommandItem
                    key={paciente.id}
                    value={paciente.id}
                    onSelect={() => handleSelect(paciente)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === paciente.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {paciente.nombre} {paciente.apellido}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {paciente.telefono}
                        {paciente.obra_social && ` · ${paciente.obra_social}`}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!loading && resultados.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      window.location.href = '/pacientes';
                    }}
                    className="text-primary"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear nuevo paciente
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
