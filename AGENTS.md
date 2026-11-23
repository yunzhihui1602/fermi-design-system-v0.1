# Visual baseline

- The developed Agent screens in Figma `149:715` are the approved product baseline. Preserve their geometry, typography, icons, colors, hierarchy and content unless the user's current request explicitly targets them.
- Figma library `910:5582` supplies the current local component masters. Inspect their actual variants; a documentation title alone does not prove coverage.
- Inspect developed-screen instance references before editing a shared master. Changes to extension components must not leak into developed screens.
- Do not globally remove borders. Inputs, selectors, uploads, menus, dialogs, table structure and model-comparison boundaries serve specific purposes.
- Extension asset, tool and task cards use open surfaces. Their controls and keyboard-focus indicators keep their own boundaries. Preserve box metrics when hiding an outline.
- Use existing neutral hover/selected tokens. Keep approved status and brand colors. Do not add alternate icon libraries or replace product assets.
- Documentation selects reuse Select / Base while retaining their native select as the data source and dispatching existing change handlers. Preserve keyboard navigation, dismissal, form reset and accessible naming.
- New component work must identify the nearest approved component, justify differences, and provide a comparison before proposing density or layout changes to established screens. Do not add speculative variants or alter existing dimensions preemptively.
- Validate visual changes in a browser, related interactions, and Figma protected-screen fingerprints when Figma masters change. See `docs/visual-baseline.md`.
