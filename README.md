# Portfolio

Portfolio personal construido con [Astro](https://astro.build/) y React. El sitio incluye una presentación principal, experiencia, proyectos, educación, habilidades, galería y formulario de contacto, con una interfaz tipo terminal y animaciones personalizadas.

## Tecnologías

- Astro
- React
- Tailwind CSS
- GSAP
- Nodemailer

## Requisitos

- Node.js 22.12 o superior
- pnpm 10.33 o superior

## Instalación

```sh
pnpm install
```

## Desarrollo

```sh
pnpm dev
```

Abre el proyecto en `http://localhost:4321`.

## Producción

```sh
pnpm build
pnpm preview
```

## Estructura básica

```text
/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── pages/
│   ├── scripts/
│   ├── services/
│   └── styles/
└── package.json
```

## Notas

- El contenido principal del sitio se configura desde `src/data/portfolio.json`.
- Las rutas principales están en `src/pages/`.
- Los estilos globales viven en `src/styles/globals.css`.
