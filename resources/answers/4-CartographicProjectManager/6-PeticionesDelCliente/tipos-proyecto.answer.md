# Respuesta

## Añadir más tipos de proyectos - Respuesta

**Respuesta:**
			```json
Searched for regex `enum ProjectType|ProjectType\s*=|export.*ProjectType` (`**/projects/4-CartographicProjectManager/src/**/*.ts`), 4 results

Searched for regex `enum ProjectType|ProjectType` (`**/projects/4-CartographicProjectManager/backend/src/**/*.ts`), 4 results

Searched for files matching `**/schema.prisma`, 1 match

Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/domain/enumerations/project-type.ts)

Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/mappings/domain-enum-ui.ts#1-1), lines 1 to 80

Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/backend/prisma/schema.prisma#1-1), lines 1 to 200

Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/components/project/ProjectForm.vue#330-330), lines 330 to 360

Replacing 31 lines with 71 lines in [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/backend/prisma/schema.prisma), [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/domain/enumerations/project-type.ts), [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/mappings/domain-enum-ui.ts), [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/components/project/ProjectForm.vue)


```

```

```

```

```

```

```

```


Checked [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/domain/enumerations/project-type.ts), [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/mappings/domain-enum-ui.ts), [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/components/project/ProjectForm.vue), no problems found

Perfect! I've updated the project types list as requested. The changes include:

## Updated Project Types

The new list now includes:
1. **Topography**
2. **Cadastre**
3. **GIS**
4. **Hydrology**
5. **Civil Engineering**
6. **Environmental Document**
7. **Study of Alternatives**
8. **Geological Study**
9. **Hydrogeological Study**
10. **Risk Study**
11. **Construction Management**
12. **Miscellaneous**

## Files Updated

1. **Backend Prisma Schema** - schema.prisma
2. **Frontend Enum** - project-type.ts
3. **Display Names** - domain-enum-ui.ts
4. **Project Form** - ProjectForm.vue

## Database Migration Required

You need to run a database migration to apply these changes:

```bash
cd projects/4-CartographicProjectManager/backend
npx prisma migrate dev --name update-project-types
```

This will create and apply a migration to update the `ProjectType` enum in your PostgreSQL database.

## Note on "OTHERS" Option

I've included **Miscellaneous** as the catch-all option. Adding a fully custom "OTHERS" field with manual text input would require a different database schema (storing the type as a string instead of an enum), which would break existing project type queries and filtering. The "Miscellaneous" option serves as the flexible category for projects that don't fit the other types.

Made changes.
			```
		</details>