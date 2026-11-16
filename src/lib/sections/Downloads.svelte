<script lang="ts">
  import { ArrowDownToLine, ArrowUpRight, Check } from "@lucide/svelte";
  import PlatformMark from "@/lib/components/icons/PlatformMark.svelte";
  import { FIRST_LAUNCH, OS_LABEL } from "@/lib/downloads";
  import { platform } from "@/lib/platform.svelte";
  import { dateLabel, kindOf, sizeLabel, type AssetKind } from "@/lib/releases/assets";
  import { releases } from "@/lib/releases/refresh.svelte";
  import { href } from "@/lib/router.svelte";
  import type { OS } from "@/lib/platform";

  type DesktopOS = Exclude<OS, "other">;
  type FileOption = { kind: AssetKind; name: string; detail: string; format: string };
  type System = { id: DesktopOS; description: string; files: FileOption[] };

  const SYSTEMS: System[] = [
    {
      id: "mac",
      description: "macOS 11 or later",
      files: [
        { kind: "mac-arm", name: "Apple Silicon", detail: "M1 and later", format: "DMG" },
        { kind: "mac-intel", name: "Intel", detail: "Intel-based Mac", format: "DMG" }
      ]
    },
    {
      id: "windows",
      description: "Windows 10 or 11 · x64",
      files: [
        { kind: "win-exe", name: "Installer", detail: "For most Windows PCs", format: "EXE" },
        { kind: "win-msi", name: "MSI package", detail: "For managed installs", format: "MSI" }
      ]
    },
    {
      id: "linux",
      description: "Linux · x86_64",
      files: [
        {
          kind: "linux-deb",
          name: "Debian / Ubuntu",
          detail: "Also Mint, Pop!_OS and more",
          format: "DEB"
        },
        {
          kind: "linux-appimage",
          name: "AppImage",
          detail: "For most distributions",
          format: "APPIMAGE"
        },
        {
          kind: "linux-arch",
          name: "Arch package",
          detail: "Use with the PKGBUILD",
          format: "TAR.GZ"
        },
        {
          kind: "linux-pkgbuild",
          name: "PKGBUILD",
          detail: "Use with the Arch package",
          format: "BUILD FILE"
        }
      ]
    }
  ];

  let release = $derived(releases.latest);
  let detected = $derived(!platform.mobile && platform.os !== "other" ? platform.os : null);
  let uncertainArch = $derived(
    (detected === "windows" || detected === "linux") && platform.arch === "arm64"
  );
  let orderedSystems = $derived(
    detected
      ? [
          ...SYSTEMS.filter((system) => system.id === detected),
          ...SYSTEMS.filter((system) => system.id !== detected)
        ]
      : SYSTEMS
  );
  let systems = $derived(
    orderedSystems.map((system) => ({
      ...system,
      available: system.files.flatMap((option) =>
        release.assets
          .filter((asset) => kindOf(asset.name) === option.kind)
          .map((asset) => ({ ...option, asset }))
      )
    }))
  );
  let extraFiles = $derived(
    release.assets.filter((asset) => {
      const kind = kindOf(asset.name);
      return !SYSTEMS.some((system) => system.files.some((option) => option.kind === kind));
    })
  );
</script>

<div class="wrap page-pad downloads-page">
  <header class="downloads-intro">
    <div class="downloads-intro-copy">
      <h1 class="downloads-title">Download Mareader.</h1>
      <p class="downloads-lede">
        A calm place for your books, made for your desktop. Choose a version and settle in.
      </p>
    </div>
    <div class="downloads-release">
      <span class="downloads-release-label">Latest release</span>
      <div class="downloads-release-version">
        <strong>{release.tag}</strong>
        <span>{dateLabel(release.date)}</span>
      </div>
      <a href={href("releases")}>Release notes <ArrowUpRight size={14} /></a>
    </div>
  </header>

  <section class="downloads-choices" aria-labelledby="downloads-choices-title">
    <div class="downloads-choices-head">
      <h2 id="downloads-choices-title">Choose your system.</h2>
      <p class="downloads-detection" data-testid="download-detection" aria-live="polite">
        {#if detected}
          <Check size={16} strokeWidth={2} />
          {OS_LABEL[detected]} is highlighted for you. All systems are available below.
        {:else}
          Mareader is a desktop app. Choose the installer for your computer.
        {/if}
      </p>
    </div>
    {#if uncertainArch}
      <p class="downloads-arch-note">
        We couldn't choose an installer automatically. Check the processor requirements for each
        file.
      </p>
    {/if}

    <div class="downloads-grid">
      {#each systems as system, index (system.id)}
        <section
          class="downloads-system"
          class:detected={detected === system.id}
          data-os={system.id}
          aria-labelledby={`system-${system.id}`}
        >
          <div class="downloads-system-head">
            <div class="downloads-system-index" aria-hidden="true">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span class="downloads-index-rule"></span>
            </div>
            <div class="downloads-system-title">
              <span class="downloads-system-icon"><PlatformMark os={system.id} size={22} /></span>
              <div>
                <h3 id={`system-${system.id}`}>{OS_LABEL[system.id]}</h3>
                <p>{system.description}</p>
              </div>
            </div>
            {#if detected === system.id}
              <span class="downloads-badge"><Check size={12} /> Your system</span>
            {/if}
          </div>

          <div class="downloads-system-content">
            <div class="downloads-files">
              {#each system.available as file (file.asset.name)}
                <a
                  class="downloads-file"
                  href={file.asset.url}
                  title={file.asset.name}
                  data-kind={file.kind}
                >
                  <span class="downloads-file-copy">
                    <strong>{file.name}</strong>
                    <span>{file.detail}</span>
                    <span class="downloads-file-format">
                      {file.format} · {sizeLabel(file.asset.size)}
                    </span>
                  </span>
                  <span class="downloads-file-action" aria-hidden="true">
                    <ArrowDownToLine size={17} strokeWidth={1.7} />
                  </span>
                </a>
              {:else}
                <p class="downloads-empty">No files for this system in the latest release.</p>
              {/each}
            </div>
            <details class="downloads-first">
              <summary>First launch on {OS_LABEL[system.id]}</summary>
              <p>{FIRST_LAUNCH[system.id]}</p>
            </details>
          </div>
        </section>
      {/each}
    </div>
  </section>

  {#if extraFiles.length}
    <section class="downloads-extras" aria-labelledby="extra-files-title">
      <div>
        <h2 id="extra-files-title">More from this release</h2>
        <p>Checksums and any other files published with {release.tag}.</p>
      </div>
      <div class="downloads-extra-list">
        {#each extraFiles as asset (asset.name)}
          <a href={asset.url} class="downloads-extra" title={asset.name}>
            <span>{kindOf(asset.name) === "checksums" ? "SHA-256 checksums" : asset.name}</span>
            <span>{sizeLabel(asset.size)}</span>
            <span class="downloads-file-action" aria-hidden="true">
              <ArrowDownToLine size={17} strokeWidth={1.7} />
            </span>
          </a>
        {/each}
      </div>
    </section>
  {/if}
</div>
