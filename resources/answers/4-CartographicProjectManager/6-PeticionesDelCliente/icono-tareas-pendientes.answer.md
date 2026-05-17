# Respuesta

## Icono de tareas pendientes - Respuesta

**Respuesta:**
			```json
I'll add a new stat card to display pending tasks in the dashboard. Let me first examine the current dashboard stats structure. 

Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/views/DashboardView.vue#46-46), lines 46 to 140

Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/views/DashboardView.vue#250-250), lines 250 to 350

Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/views/DashboardView.vue#400-400), lines 400 to 500

Searched for text `fetchTasks` (`**/DashboardView.vue`), no results

Searched for text `userTasks.value` (`**/DashboardView.vue`), 3 results

Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/views/DashboardView.vue#30-30), lines 30 to 80

Replacing 30 lines with 39 lines in [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/views/DashboardView.vue)


```

```


Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/views/DashboardView.vue#580-580), lines 580 to 650

Searched for text `.stat-card {` (`**/DashboardView.vue`), 2 results

Read [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/views/DashboardView.vue#690-690), lines 690 to 750

Replacing 5 lines with 22 lines in [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/views/DashboardView.vue)


```

```


Checked [](file:///home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/presentation/views/DashboardView.vue), no problems found

Perfect! I've added a new "My Tasks" stat card to the dashboard that highlights when you have tasks assigned to you. Here's what I implemented:

## Changes Made:

1. **New Stat Card**: Added a "📋 My Tasks" card between "Pending Tasks" and "Unread Messages" that shows the count of tasks assigned to you (excluding completed tasks)

2. **Visual Highlight**: When you have tasks assigned, the card displays with:
   - A subtle gradient background (primary color to white)
   - An animated pulsing border that draws attention
   - Enhanced shadow effect

3. **Smart Counting**: The "My Tasks" counter only includes tasks assigned to you that aren't completed, so you can quickly see what needs your attention

The card will automatically highlight whenever you have active tasks, making it easy to spot when new tasks are created and assigned to you. The pulsing animation helps draw your eye to it without being distracting.

Made changes.
			```
		</details>