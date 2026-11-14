# Learnings — frescopa replica (2026-11-13)

- **Source is EDS → convert the source's own `.plain.html`.** A plain → DA converter (section classes and `data-*` keys → section-metadata, images rehosted) gave `.plain.html` = source on every page; no per-sibling encoder work.
- **Coverage `source.migratedHtml` drives verify's URL.** Archetype rows rendered as `<path>/index.html` made verify request `<path>/` (404 on EDS). Point delivered rows at the DA doc.
- **Source-authored structure can trip davids-model D1** (a no-op `Text` block around prose). In a replica, keep it verbatim and document the override; unwrapping changes layout.
- **Dead links on the source** (404 there too) are scope extensions: repoint to the source host, record the list for the owner.
- **gate-all on preview host** needs a state file with deployed rows; `--eds-host` with scheme.
