# Final Finder

Aplicación web creada con Vue 3 y Vite.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Instalación

Clona el repositorio, entra en la carpeta del proyecto e instala las dependencias:

```sh
npm install
```

## Ejecución en desarrollo

Inicia el servidor local:

```sh
npm run dev
```

Abre en el navegador la URL que muestra la terminal (normalmente `http://localhost:5173`).

## Compilación de producción

Genera los archivos optimizados para producción en `dist/`:

```sh
npm run build
```

Para probar localmente esa compilación:

```sh
npm run preview
```

## Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` compila y publica el sitio automáticamente al hacer
push a `main`. También se puede iniciar manualmente desde la pestaña **Actions**.

En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como origen del despliegue.
El workflow configura la ruta base del proyecto y publica el contenido de `dist/`.
