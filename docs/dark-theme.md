# Appearance binding

Approved Figma Semantic collection: `VariableCollectionId:496:316`; Light `496:1`, Dark `2313:0`. `figma-tokens.css` records 89 resolved semantic color variables from the current file. Do not change spacing, geometry or primitive palette swatches to implement a theme.

| Website role | Figma binding | Dark value |
| --- | --- | --- |
| Navigation | color/surface/card | #202023 |
| Main content | color/surface/sidebar | #141416 |
| Cards / floating surfaces | color/surface/card / elevated | #202023 |
| Hover | color/surface/hover | #2b2b30 |
| Selected | color/surface/selected | #343439 |
| Strong text | color/text/strong | #f4f4f5 |
| Primary text | color/text/primary | #e4e4e7 |
| Secondary text | color/text/secondary | #b4b4bd |
| Default border | color/border/default | #3b3b42 |

The navigation/content roles deliberately follow the approved usage above, rather than interpreting the older semantic variable names literally. Documentation boards use the main content surface; actual cards and floating surfaces use their own role.

State foregrounds remain the approved shared colors: green #20a66a, blue #2e90fa, orange #f5a623, red #d92d20, purple #692aec. Status soft backgrounds, hover/pressed colors, disabled colors, focus and data-series colors use their Figma dark values.

`theme-colors.css` binds older literal declarations to semantic roles. Their original values remain the Light fallbacks. `theme.css` maps contexts such as navigation, fields, popovers and mobile content. Primitive color samples intentionally show actual palette values.

The header appearance control offers Light, Dark and System. The choice is stored locally; System follows subsequent OS changes, while explicit Light/Dark overrides them. Initialization resolves before styles paint. The appearance component demonstration also applies the selected theme.

Dark wordmark assets use editable vector paths from the existing approved logo asset, with light ink and preserved purple. Light assets remain unchanged. No image inversion filter is used.

Validation covers both theme geometry, state colors, residual bright surfaces/dark text, desktop workbench, transaction modal, mobile conversation and login, custom selectors, refresh persistence, OS changes and explicit override. Developed Figma screens are unchanged by this website binding.

## Purple label foreground refinement

Figma `2313:18856` is the approved purple-label reference: dark purple soft background #30213f, foreground and accompanying dot #a887ff (VariableID:847:13515). Brand status badges, brand summary badges and Adjust/Allocate ledger labels share `--label-brand-foreground`. This exception applies to label content; primary buttons, ordinary product icons and chart series retain their separately approved purple roles. Light label colors and geometry remain unchanged.
