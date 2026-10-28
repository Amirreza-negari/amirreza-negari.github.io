# Website CV

`main.tex` is the editable source for the expanded English CV shown at `/cv/`.
The website embeds `static/files/Amir-Reza_Negari_CV.pdf`; its Open PDF and
Download links use the same document.

The layout follows the supplied CV template: 10-point Source Sans Pro,
blue name and section headings, thin rules, and compact entries. The expanded
content and links are retained; spacing and page breaks can be adjusted in
the commands at the top of `main.tex`.

To rebuild after editing, run from the website repository:

```sh
sh cv/build.sh
```

This uses Tectonic, checks for layout overflow, and replaces the website PDF
only after compilation succeeds. Preview every page before publishing.
The built-in LaTeX editor can also open this folder for source editing and a
live PDF preview; the build script copies the result to the website.

`archive/academic-cv-2026-10-11.tex` preserves the older source exactly as
supplied. `sources.yaml` records verification links, source distinctions and
details that still need confirmation. The two-page job CV supplied earlier
remains separate from this expanded academic version.

The CV was researched and updated on 28 October 2026. Dates are explicit so
future edits do not silently claim the publication list has been rechecked.
