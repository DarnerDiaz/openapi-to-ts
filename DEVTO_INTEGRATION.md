# Dev.to Integration Guide

Automatiza la publicación de artículos en Dev.to usando este sistema.

## Setup Inicial (Una sola vez)

### 1. Obtener API Key de Dev.to

Vé a: https://dev.to/settings/account

Copia tu **Personal API Key** (mantén esto secreto)

### 2. Agregar Secret en GitHub

En tu repositorio:
1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `DEVTO_API_KEY`
4. Value: Tu API key (pégala aquí)
5. Click **Add secret**

### 3. Local Setup (Opcional para testing)

```bash
# Configurar tu API key localmente
export DEVTO_API_KEY="tu_api_key_aqui"

# O crea un archivo .env (NO lo comitees)
echo "DEVTO_API_KEY=tu_api_key_aqui" > .env
```

---

## Uso Regular

### Opción A: Automático (Recomendado)

1. Crea un archivo `DEVTO_ARTICLE.md` en la raíz de tu proyecto
2. Completa el contenido del artículo
3. Haz `git push` a master
4. ✅ GitHub Actions lo publica automáticamente a Dev.to

### Opción B: Manual desde Terminal

```bash
# Publicar artículo nuevo
npm run publish-devto -- --file=./DEVTO_ARTICLE.md --tags=typescript,devtools

# Actualizar artículo existente (requiere ID)
npm run publish-devto -- --file=./DEVTO_ARTICLE.md --id=12345

# Publicar como borrador (no aparecer en feed)
npm run publish-devto -- --file=./DEVTO_ARTICLE.md --draft=true
```

### Opción C: GitHub Manual Dispatch

En GitHub, ve a **Actions** → **Publish to Dev.to** → **Run workflow**

Rellena los campos:
- **Article file path**: `./DEVTO_ARTICLE.md`
- **Tags**: `typescript,openapi,devtools`

Click **Run workflow**

---

## Formato de Artículo

El archivo `DEVTO_ARTICLE.md` puede tener front matter opcional:

```markdown
---
title: Mi Artículo Personalizado
description: Una descripción especial
cover_image: https://ejemplo.com/imagen.jpg
canonical_url: https://miwebsite.com/articulo
---

# Mi Artículo

Contenido aquí...
```

O simplemente:

```markdown
# Mi Artículo

Contenido aquí...
```

---

## Configuración Global (devto.config.json)

Edita `devto.config.json` para definir múltiples artículos:

```json
{
  "articles": [
    {
      "file": "./blog/openapi.md",
      "title": "OpenAPI to TypeScript",
      "tags": ["typescript", "openapi"],
      "published": true
    },
    {
      "file": "./blog/react-hooks.md",
      "title": "Advanced React Hooks",
      "tags": ["react", "javascript"],
      "published": false
    }
  ]
}
```

---

## Troubleshooting

### ❌ "DEVTO_API_KEY not found"
Verifica que el secret esté configurado en GitHub Settings → Secrets

### ❌ "Invalid API key"
Copia la API key correctamente de Dev.to. No debe tener espacios.

### ✅ Artículo publicado pero sin contenido
Asegúrate que el markdown esté correctamente formateado (con saltos de línea).

---

## Próximos Pasos

Para futuros proyectos:

1. Copia `src/devto-publisher.ts`
2. Copia `.github/workflows/publish-devto.yml`
3. Copia `devto.config.json`
4. Configura el secret `DEVTO_API_KEY` en GitHub
5. Crea tu `DEVTO_ARTICLE.md` y haz push

¡Listo! Publicación automatizada en Dev.to 🚀
