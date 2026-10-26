# mindmap Project Rules

## Product
mindmap is a self-understanding tool, not a clinical diagnostic service.

## Psychology
- Do not diagnose mental disorders.
- Type cards are allowed only from published classification rules (see docs/instruments.md), always shown as current tendencies that can change, never as fixed types.
- Describe tendencies probabilistically.
- Scores must be produced by deterministic code.
- Use published, validated instruments with their original item keys and response formats.
- LLMs may explain scores but must not invent them.

## Engineering
- Use TypeScript.
- Keep scoring logic separate from UI.
- Keep question data separate from scoring logic.
- Prefer small reusable components.
- Avoid unnecessary dependencies.

## UX
- Avoid language that shames or pathologizes users.
- Show strengths together with possible difficulties.
- Always explain that psychological results are tendencies, not diagnoses.