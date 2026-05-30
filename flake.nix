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
