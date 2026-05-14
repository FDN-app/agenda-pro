import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoTurnoDentalProps {
  /** Tamaño total del contenedor en px. Default 48. */
  size?: number;
  className?: string;
}

/**
 * Logo de TurnoDental: CalendarDays de Lucide con un diente molar SVG
 * superpuesto en la esquina superior derecha.
 */
export function LogoTurnoDental({ size = 48, className = '' }: LogoTurnoDentalProps) {
  const toothSize = size * 0.45;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Calendario base */}
      <CalendarDays
        className="text-indigo-400"
        style={{ width: '100%', height: '100%' }}
        strokeWidth={1.8}
      />

      {/* Diente molar en esquina superior derecha */}
      <svg
        viewBox="0 0 24 24"
        className="absolute"
        style={{
          width: toothSize,
          height: toothSize,
          top: -size * 0.06,
          right: -size * 0.08,
          filter: 'drop-shadow(0 0 2px rgba(99, 102, 241, 0.6))',
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Molar con corona redondeada y dos raíces */}
        <path
          d="M12 2c-1.8 0-3.4.6-4.6 1.6C6.2 4.6 5.5 6.2 5.5 8c0 1.6.6 3 1.2 4.3l.6 1.2c.4.9.8 2 1.2 3.2.3 1 .7 1.8 1.2 2.3.4.4.8.5 1.1.3.3-.2.5-.7.5-1.5 0-.6.1-1.2.3-1.8.2-.5.5-.8.9-.8s.7.3.9.8c.2.6.3 1.2.3 1.8 0 .8.2 1.3.5 1.5.3.2.7.1 1.1-.3.5-.5.9-1.3 1.2-2.3.4-1.2.8-2.3 1.2-3.2l.6-1.2c.6-1.3 1.2-2.7 1.2-4.3 0-1.8-.7-3.4-1.9-4.4C15.4 2.6 13.8 2 12 2z"
          fill="currentColor"
          className="text-white"
        />
        <path
          d="M12 2c-1.8 0-3.4.6-4.6 1.6C6.2 4.6 5.5 6.2 5.5 8c0 1.6.6 3 1.2 4.3l.6 1.2c.4.9.8 2 1.2 3.2.3 1 .7 1.8 1.2 2.3.4.4.8.5 1.1.3.3-.2.5-.7.5-1.5 0-.6.1-1.2.3-1.8.2-.5.5-.8.9-.8s.7.3.9.8c.2.6.3 1.2.3 1.8 0 .8.2 1.3.5 1.5.3.2.7.1 1.1-.3.5-.5.9-1.3 1.2-2.3.4-1.2.8-2.3 1.2-3.2l.6-1.2c.6-1.3 1.2-2.7 1.2-4.3 0-1.8-.7-3.4-1.9-4.4C15.4 2.6 13.8 2 12 2z"
          stroke="currentColor"
          className="text-indigo-400"
          strokeWidth="1.2"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
