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
            pkgs.bun
            pkgs.just
            pkgs.oxlint
            pkgs.oxfmt
            pkgs.typescript
          ];

          shellHook = ''
            export LANG=en_US.UTF-8

            if [ ! -d node_modules ]; then
              echo "Run 'just install' (bun install) to fetch dependencies."
            fi
          '';
        };
      }
    );
}
