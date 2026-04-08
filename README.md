# TFG - Análisis de Capacidades de la IA en la Generación Semiautomática de Aplicaciones Complejas
El propósito de este TFG es explorar las capacidades actuales de diferentes modelo IA de LLMs para generar con mínima intervención humana aplicaciones web interactivas.

## 🚀 Deployment

Este monorepo contiene múltiples proyectos web con backends desplegables en Render:

- **CartographicProjectManager** - Sistema de gestión de proyectos cartográficos
- **TennisTournamentManager** - Sistema de gestión de torneos de tenis

### Render Setup

El archivo **`render.yaml`** en la raíz define todos los servicios backend con Infrastructure as Code.

**Documentación completa**: [RENDER-MONOREPO.md](./RENDER-MONOREPO.md)

### Quick Deploy

```bash
# 1. Push a GitHub
git push origin main

# 2. En Render: New → Blueprint → Select repo
# 3. Render detectará render.yaml automáticamente
# 4. Configure environment variables en el dashboard
```

Ver guías específicas en cada proyecto:
- CartographicProjectManager: `projects/4-CartographicProjectManager/backend/RENDER.md`
- TennisTournamentManager: (próximamente)
