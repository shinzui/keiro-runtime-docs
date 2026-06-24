{
  description = "Docs for keiro runtime";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        checks = {
        };

        devShells.default = pkgs.mkShell {
          nativeBuildInputs = [
            pkgs.nodejs_22
            pkgs.pnpm
            pkgs.just
            pkgs.oxlint
            pkgs.oxfmt
            pkgs.typescript
            # The link-check gate (Plan F / #6) is provided by the `linkinator` npm
            # devDependency, on PATH after `pnpm install` — not a nixpkgs package — so
            # the dev shell needs no extra entry for it. Licensed PragmataPro users can
            # opt in locally; see docs/optional-commercial-fonts.md.
          ];

          shellHook = ''
            export LANG=en_US.UTF-8

            echo "keiro-runtime-docs dev shell"
            echo "node $(node --version)"
            echo "pnpm $(pnpm --version)"

            if [ ! -d node_modules ]; then
              echo "Run 'pnpm install' to fetch dependencies."
            fi
          '';
        };
      }
    );
}
