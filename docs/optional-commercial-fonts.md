# Optional Commercial Fonts

Some repos use a commercial font for local development while keeping the public
repository buildable for everyone. The pattern is:

1. Never commit the font files.
2. Never commit personal filesystem paths to the font package.
3. Keep generated font outputs ignored.
4. Let licensed developers opt in with local configuration.
5. Make missing fonts a warning, not a build failure.

## Repository Setup

Keep the public repo free of font inputs:

- Do not add a `path:/Users/...` font input to `flake.nix`.
- Ignore copied static font files, for example `/public/fonts/`.
- Keep CSS fallbacks after the commercial family:

```css
font-family: "PragmataPro Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

The font-copy script should try sources in this order:

1. `PRAGMATAPRO_FONT_DIR`, pointing at a directory with OTF files or a package
   output containing `share/fonts/opentype`.
2. `PRAGMATAPRO_FLAKE`, pointing at a Nix flake such as `path:/absolute/path/to/fonts`.
3. A local Nix registry alias named `pragmatapro`.
4. No font; warn and continue.

## Developer Setup

For one machine, prefer the Nix registry alias because it works across many repos:

```bash
nix registry add pragmatapro path:/absolute/path/to/fonts
```

The script then builds:

```bash
nix build --no-link --print-out-paths pragmatapro#pragmataPro
```

If the package attribute differs, set:

```bash
export PRAGMATAPRO_ATTR="pragmataPro"
```

For a single repo, copy `.envrc.local.example` to `.envrc.local` and set one of:

```bash
export PRAGMATAPRO_FLAKE="path:/absolute/path/to/fonts"
export PRAGMATAPRO_FONT_DIR="/absolute/path/to/share/fonts/opentype"
```

`.envrc.local` must remain ignored by git.

## Audit Checklist

Before making a repo public, run:

```bash
git ls-files | xargs rg -n "path:/Users|/Users/.*/fonts|PragmataPro.*\\.otf"
git ls-files public/fonts
git check-ignore -v public/fonts/*
```

Expected result: no tracked OTF files, no committed personal font path, and
`public/fonts/*` ignored.
