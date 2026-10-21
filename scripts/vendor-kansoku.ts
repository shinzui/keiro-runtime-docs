// These ordered lifecycle, HTTP, or file-copy steps must complete before the next step.
/* oxlint-disable no-await-in-loop */
import { createHash } from "node:crypto"
import { cp, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const commit = process.argv[process.argv.indexOf("--commit") + 1]
if (!process.argv.includes("--commit") || !/^[a-f0-9]{40}$/.test(commit ?? "")) {
  throw new Error("Usage: bun scripts/vendor-kansoku.ts --commit FULL_SHA")
}
const destination = resolve("src/vendor/kansoku-js")
const temporary = await mkdtemp(join(tmpdir(), "keiro-kansoku-"))
const checkout = join(temporary, "source")
async function run(args: string[], cwd?: string) {
  const child = Bun.spawn(args, { cwd, stdout: "pipe", stderr: "inherit" })
  const output = await new Response(child.stdout).text()
  if ((await child.exited) !== 0) throw new Error(`Failed: ${args.join(" ")}`)
  return output.trim()
}
try {
  await run([
    "git",
    "clone",
    "--no-checkout",
    "https://github.com/shinzui/kansoku-ts.git",
    checkout,
  ])
  await run(["git", "checkout", "--detach", commit], checkout)
  if ((await run(["git", "rev-parse", "HEAD"], checkout)) !== commit)
    throw new Error("Revision mismatch")
  await run(["nix", "develop", "-c", "bun", "install", "--frozen-lockfile"], checkout)
  console.log(
    await run(["nix", "develop", "-c", "bun", "scripts/build.ts", "packages/kansoku-js"], checkout),
  )
  const versions = await run(
    ["nix", "develop", "-c", "sh", "-c", "bun --version; tsc --version"],
    checkout,
  )
  const staging = join(temporary, "snapshot")
  await mkdir(staging)
  const dist = join(checkout, "packages/kansoku-js/dist")
  const bundle = (await readFile(join(dist, "index.js"), "utf8")).replace(
    /^\/\/# sourceMappingURL=.*\n?/gm,
    "",
  )
  await writeFile(join(staging, "index.js"), bundle)
  async function declarations(dir: string, relative = "") {
    for (const entry of await readdir(join(dir, relative), { withFileTypes: true })) {
      const file = join(relative, entry.name)
      if (entry.isDirectory()) await declarations(dir, file)
      else if (entry.name.endsWith(".d.ts")) {
        await mkdir(join(staging, relative), { recursive: true })
        await cp(join(dir, file), join(staging, file))
      }
    }
  }
  await declarations(dist)
  const sdk = await import(join(staging, "index.js"))
  if (typeof sdk.createKansoku !== "function") throw new Error("Missing createKansoku export")
  const digest = createHash("sha256").update(bundle).digest("hex")
  const previous = await readFile(join(destination, "README.md"), "utf8").catch(() => "")
  if (previous.includes(commit) && !previous.includes(digest))
    throw new Error("Snapshot digest changed; investigate compiler differences")
  await writeFile(
    join(staging, "README.md"),
    `# Kansoku browser SDK snapshot\n\nSource: mori://shinzui/kansoku-ts/packages/kansoku-js\n\nCommit: \`${commit}\`\n\nBundle SHA-256: \`${digest}\`\n\nCompiler versions:\n\n\`\`\`text\n${versions}\n\`\`\`\n\nLicense notice: upstream package declares UNLICENSED; this snapshot is from the project owner's source and grants no additional rights.\n\nGenerated from a detached temporary checkout using the upstream frozen install, development shell, and scripts/build.ts (which verifies exports). All declaration dependencies are included. Only the source-map trailer is removed; no source maps or local paths are shipped. Normal builds never fetch SDK sources. npm still returns E404 and the upstream has no release tags as of 2026-10-21.\n\nRegenerate from this repository:\n\n\`\`\`bash\nnix develop -c bun scripts/vendor-kansoku.ts --commit ${commit}\n\`\`\`\n`,
  )
  // Stage on the destination filesystem before swapping; retain the good snapshot on failure.
  await mkdir(resolve("src/vendor"), { recursive: true })
  const next = `${destination}.next`
  const backup = `${destination}.previous`
  await cp(staging, next, { recursive: true })
  let saved = false
  try {
    await rename(destination, backup)
    saved = true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }
  try {
    await rename(next, destination)
  } catch (error) {
    if (saved) await rename(backup, destination)
    throw error
  }
  if (saved) await rm(backup, { recursive: true })
  console.log(`Vendored ${commit}; SHA-256 ${digest}`)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
