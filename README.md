# TurnoDental

Sistema de turnos y recordatorios por WhatsApp para consultorios odontológicos.

## Stack Técnico

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Framework**: [TanStack Start](https://tanstack.com/start) / [Router](https://tanstack.com/router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [TailwindCSS](https://tailwindcss.com/)
- **Componentes**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Backend/Base de Datos**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Edge Functions)
- **Validación de Datos**: [Zod](https://zod.dev/)

## Cómo correr en local

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd agenda-pro
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o si usas bun
   bun install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## Variables de Entorno Necesarias

| Nombre | Descripción |
| :--- | :--- |
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase. |

## Comandos Útiles

- `npm run dev`: Inicia el servidor de desarrollo en `localhost:3000` (o el puerto configurado).
- `npm run build`: Genera el bundle de producción en la carpeta `dist`.
- `npm run lint`: Ejecuta ESLint para encontrar y reportar problemas de estilo y código.
- `npm run format`: Formatea el código fuente utilizando Prettier.
- `npm run preview`: Ejecuta una vista previa local de la aplicación compilada para producción.
