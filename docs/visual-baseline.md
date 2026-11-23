# Approved Agent visual baseline

Source: [developed desktop Agent screens](https://www.figma.com/design/uO08O8ANzzskvuyAiElbuE?node-id=149-715).
Components: [current local library](https://www.figma.com/design/uO08O8ANzzskvuyAiElbuE?node-id=910-5582).

## Protected product surfaces

Preserve the existing home screen, conversation/result layout, model comparison, model menu and login screens. The baseline uses whitespace and neutral fills for grouping. Input containers, model comparison cards, selectors and floating menus retain meaningful boundaries. Screenshot examples inspected: `79:714`, `79:1801`, `79:2148`, `82:2734`.

## Extension decisions

| Surface | Decision | Reason |
| --- | --- | --- |
| Asset Card, Tool Card, Task Execution Status | Hide only outer stroke | Open grouping follows the approved Agent language; controls remain distinct |
| Preset card | Neutral hover and selected fills | Express interaction without another surrounding outline |
| Form fields, textarea, number input, select | Retain boundary and focus indicator | Identify input and keyboard focus |
| Upload dropzone | Retain boundary | Indicates the drop target |
| Attachment | Retain boundary | Delimits a separately actionable file |
| Menus, calendars, dialogs, drawers | Retain relevant boundary | Separate floating content from the underlying surface |
| Tables and permission matrices | Retain structural separators | Preserve row, column and control relationships |
| Charts | Retain current master boundary | No blanket de-bordering of established chart components |

No size, typography or spacing adjustment is implied by these decisions. Shared masters must be checked against references from `149:715` before modification.

## Documentation controls

All live native select controls in the documentation receive an existing Select / Base trigger and menu. Their original select remains hidden but functional for values, change events, names and form reset. Escape returns focus; arrows, Home/End and Enter select options. Menus dismiss on outside interaction, scroll or resize. Transaction selects continue using their existing implementation.

## Priority and future additions

1. Protect developed screens and approved component reuse.
2. Remove redundant extension outlines; unify neutral interaction states.
3. Reuse product controls in documentation demonstrations.
4. For future additions, compare against the closest approved component. Density and layout alternatives require a separate comparison; they are not changes to the developed baseline.
