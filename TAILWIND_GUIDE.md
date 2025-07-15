# Guía de Tailwind CSS en el Proyecto

## Configuración

Tailwind CSS está configurado en el proyecto con las siguientes características:

### Archivos de configuración:
- `tailwind.config.js` - Configuración principal de Tailwind
- `.postcssrc.json` - Configuración de PostCSS
- `src/styles.css` - Importación de Tailwind CSS

### Colores personalizados:
- `primary` - Paleta de azules para elementos principales
- `game` - Colores específicos para el juego naval:
  - `water` - Color del agua
  - `ship` - Color de los barcos
  - `hit` - Color de impacto
  - `miss` - Color de fallo

### Fuentes personalizadas:
- `game` - Fuente Orbitron para elementos del juego

## Uso básico

### Clases de utilidad comunes:

```html
<!-- Contenedores -->
<div class="container mx-auto px-4">
<div class="max-w-md mx-auto">
<div class="w-full h-screen">

<!-- Flexbox -->
<div class="flex items-center justify-center">
<div class="flex flex-col space-y-4">

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- Espaciado -->
<div class="p-4 m-2">
<div class="px-6 py-4">
<div class="space-y-4">

<!-- Colores -->
<div class="bg-blue-500 text-white">
<div class="text-gray-700 bg-gray-100">

<!-- Bordes y sombras -->
<div class="border border-gray-300 rounded-lg shadow-md">
<div class="border-2 border-blue-500 rounded-full">

<!-- Estados -->
<button class="hover:bg-blue-600 focus:ring-2 focus:ring-blue-500">
<input class="focus:ring-2 focus:ring-blue-500 focus:border-transparent">
```

### Componentes de ejemplo:

#### Botón primario:
```html
<button class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
  Botón Primario
</button>
```

#### Input con estilo:
```html
<input 
  type="email" 
  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
  placeholder="tu@email.com">
```

#### Card con sombra:
```html
<div class="bg-white rounded-2xl shadow-xl overflow-hidden">
  <div class="p-6">
    <!-- Contenido -->
  </div>
</div>
```

#### Alert personalizado:
```html
<div class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center space-x-3">
  <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
    <!-- Icono -->
  </svg>
  <p class="text-sm font-medium">Mensaje de éxito</p>
</div>
```

## Responsive Design

```html
<!-- Mobile first -->
<div class="w-full md:w-1/2 lg:w-1/3">
<div class="text-sm md:text-base lg:text-lg">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## Animaciones

```html
<!-- Fade in -->
<div class="animate-fade-in">

<!-- Hover effects -->
<div class="hover:scale-105 transition-transform duration-200">

<!-- Loading spinner -->
<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600">
```

## Mejores prácticas

1. **Usar clases de utilidad** en lugar de CSS personalizado
2. **Mobile first** - Diseñar para móvil primero
3. **Consistencia** - Usar la paleta de colores definida
4. **Accesibilidad** - Incluir estados focus y hover
5. **Performance** - Tailwind purga automáticamente las clases no utilizadas

## Personalización

Para agregar nuevos colores o estilos, edita `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'mi-color': '#ff0000',
      },
      fontFamily: {
        'mi-fuente': ['Arial', 'sans-serif'],
      },
    },
  },
}
``` 