export interface EntryTemplate {
  id: string
  label: string
  icon: string
  body: string
}

export const ENTRY_TEMPLATES: EntryTemplate[] = [
  {
    id: "gratitude",
    label: "Gratitude",
    icon: "🙏",
    body: `## Gratitude Journal

1. I'm grateful for…
2. I'm grateful for…
3. I'm grateful for…

### One thing that made me smile today

`,
  },
  {
    id: "daily-recap",
    label: "Daily Recap",
    icon: "📅",
    body: `## Daily Recap

### Morning
How did I start my day?

### Afternoon
What happened during the day?

### Evening
How did the day end? What am I taking away from today?

`,
  },
  {
    id: "reflection",
    label: "Reflection",
    icon: "🪞",
    body: `## Reflection

### What went well
What did I do well today?

### What could improve
What would I do differently?

### One lesson
What did I learn today?

`,
  },
]
