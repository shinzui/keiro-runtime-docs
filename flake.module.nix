# Project-owned tools; shared Bun/TypeScript/Oxc wiring stays module-managed.
{ ... }:
{
  perSystem = { pkgs, ... }: {
    bunProject.extraDevPackages = [ pkgs.nodejs_22 pkgs.pnpm_11 ];
  };
}
