<script lang="ts">
  // Film — sticky stage with scrolling beats
  import { Download } from "@lucide/svelte";
  import { CAPTIONS, SCENES } from "@/lib/scenes";
  import MockWindow from "./Mock/MockWindow.svelte";
  import { RELEASES, REPO } from "@/lib/constants";

  let { dark }: { dark: boolean } = $props();

  const PER_BEAT = 0.6;
  const capKeys = Object.keys(CAPTIONS);

  let wrapRef: HTMLDivElement | undefined = $state();
  let stageRef: HTMLDivElement | undefined = $state();
  let camRef: HTMLDivElement | undefined = $state();
  let capRefs: Record<string, HTMLDivElement | null> = $state({});

  let beat = $state(0);
  let compact = $state(false);
  let capH = $state(200);
  let ready = $state(false);

  let W = $derived(compact ? 820 : 1280);
  let H = $derived(compact ? 1000 : 800);
  let scene = $derived(SCENES[beat]);
  let order = $derived(capKeys.indexOf(scene.caption));
  let zoneH = $derived(capH);

  function capAction(node: HTMLElement, key: string) {
    capRefs[key] = node as HTMLDivElement;
    return { destroy() { capRefs[key] = null; } };
  }

  function smoothDamp(cur: number, target: number, vel: { v: number }, smoothTime: number, dt: number) {
    const omega = 2 / smoothTime;
    const x = omega * dt;
    const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = cur - target;
    const temp = (vel.v + omega * change) * dt;
    vel.v = (vel.v - omega * temp) * e;
    return target + (change + temp) * e;
  }

  $effect(() => {
    const stage = stageRef;
    if (!stage) return;
    const measure = () => { compact = stage.clientWidth < 760 || stage.clientWidth / stage.clientHeight < 0.95; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  });

  $effect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const wrap = wrapRef;
      const stage = stageRef;
      if (!wrap || !stage) return;
      const top = -wrap.getBoundingClientRect().top;
      const span = Math.max(1, wrap.offsetHeight - stage.offsetHeight);
      const p = Math.min(0.9999, Math.max(0, top / span));
      beat = Math.floor(p * SCENES.length);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  });

  $effect(() => {
    void scene.caption; void compact;
    const measure = () => { const el = capRefs[scene.caption]; if (el) capH = el.offsetHeight; };
    measure();
    document.fonts?.ready.then(measure);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  $effect(() => {
    const stage = stageRef;
    const camEl = camRef;
    if (!stage || !camEl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cam = { cx: 0, cy: 0, ls: 0, x: { v: 0 }, y: { v: 0 }, s: { v: 0 }, init: false };
    let visible = true;
    let last = performance.now();
    let raf = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(stage);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const el = camRef;
      if (!el || !visible) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = { beat, W, H, capH, compact };
      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      const padX = st.compact ? 14 : 48;
      const top = st.compact ? 58 : 70;
      const bottom = st.capH + (st.compact ? 40 : 52);
      const safeW = sw - 2 * padX;
      const safeH = Math.max(140, sh - top - bottom);
      const fit = Math.min(safeW / st.W, safeH / st.H);
      const sc = SCENES[st.beat];
      let rect = { x: 0, y: 0, w: st.W, h: st.H };
      let whole = true;
      const names = st.compact && sc.focusCompact ? sc.focusCompact : sc.focus;
      if (!(names.length === 1 && names[0] === "window")) {
        const root = el.firstElementChild as HTMLElement | null;
        const wr = root?.getBoundingClientRect();
        const k0 = wr ? wr.width / st.W : 1;
        const found = names.map((n) => {
          const t = root?.querySelector(`[data-focus="${n}"]`) as HTMLElement | null;
          if (!t || !wr) return null;
          const r = t.getBoundingClientRect();
          return { x: (r.left - wr.left) / k0, y: (r.top - wr.top) / k0, w: r.width / k0, h: r.height / k0 };
        }).filter((r) => r && r.w > 0) as { x: number; y: number; w: number; h: number }[];
        if (found.length) {
          const x0 = Math.min(...found.map((r) => r.x));
          const y0 = Math.min(...found.map((r) => r.y));
          const x1 = Math.max(...found.map((r) => r.x + r.w));
          const y1 = Math.max(...found.map((r) => r.y + r.h));
          const pad = 30;
          rect = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
          whole = false;
        }
      }
      let s = whole ? fit : Math.min(safeW / rect.w, safeH / rect.h);
      s = Math.max(fit, Math.min(s, Math.max(fit, sc.zoomMax ?? 2)));
      const tcx = whole ? st.W / 2 : rect.x + rect.w / 2;
      const tcy = whole ? st.H / 2 : rect.y + rect.h / 2;
      const tls = Math.log(s);
      if (!cam.init || reduce) {
        cam.cx = tcx; cam.cy = tcy; cam.ls = tls;
        if (!cam.init) { cam.init = true; ready = true; }
      } else {
        const T = 0.82;
        cam.cx = smoothDamp(cam.cx, tcx, cam.x, T, dt);
        cam.cy = smoothDamp(cam.cy, tcy, cam.y, T, dt);
        cam.ls = smoothDamp(cam.ls, tls, cam.s, T, dt);
      }
      const k = Math.exp(cam.ls);
      const tx = sw / 2 - k * cam.cx;
      const ty = top + safeH / 2 - k * cam.cy;
      el.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${k.toFixed(4)})`;
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  });
</script>

<div bind:this={wrapRef} style="height: calc(100svh * {1 + (SCENES.length - 1) * PER_BEAT + 0.35})">
  <div bind:this={stageRef} class="film-stage">
    <div bind:this={camRef} class="film-cam {ready ? 'ready' : ''}" style="width: {W}px; height: {H}px">
      <MockWindow {scene} siteDark={dark} W={W} H={H} />
    </div>
    <div class="film-wash-bottom" style="height: {zoneH + 54}px; --zone: {zoneH}px"></div>
    <div class="absolute inset-x-0 bottom-0" style="height: {zoneH}px">
      <div class="relative mx-auto h-full w-full max-w-[1240px]">
        {#each capKeys as k, i}
          {@const c = CAPTIONS[k]}
          {@const on = k === scene.caption}
          <div
            use:capAction={k}
            class="cap px-5 sm:px-10 {on ? 'on' : ''} {(!on && i < order) ? 'gone' : ''}"
            style="padding-bottom: {compact ? 30 : 44}px"
            aria-hidden={!on}
          >
            <div class="px-0 {compact ? 'text-center' : ''}">
              <h2
                class="font-serif font-medium tracking-[-0.015em] text-[var(--fg)] {c.hero ? 'text-[34px] leading-[1.05] sm:text-[56px]' : 'text-[26px] leading-[1.12] sm:text-[42px]'} {compact ? 'mx-auto' : ''}"
                style="max-width: {c.hero ? 760 : 680}px; text-wrap: balance"
              >
                {c.title}
              </h2>
              <p
                class="mt-2.5 text-[14.5px] leading-[1.55] text-[var(--fg2)] sm:mt-3.5 sm:text-[17px] {compact ? 'mx-auto' : ''}"
                style="max-width: 540px; text-wrap: pretty"
              >
                {c.body}
              </p>
              {#if c.hero}
                <div class="mt-5 flex flex-wrap gap-3 sm:mt-7 {compact ? 'justify-center' : ''}">
                  <a href={RELEASES} class="btn-primary" tabindex={on ? 0 : -1}>
                    <Download size={17} strokeWidth={2} /> Download free
                  </a>
                  <a href={REPO} class="btn-ghost" tabindex={on ? 0 : -1}>View on GitHub</a>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
