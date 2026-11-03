<script lang="ts">
  // LocalPanel — mocked methods until the owner adds live details
  import { LOCAL_METHODS, LOCAL_STATUS } from "@/lib/support/myanmar";
  import { support } from "@/lib/support/geo.svelte";
</script>

<div class="local" data-testid="local-panel">
  <p class="local-hello">
    <span lang="my" class="mm-text">မင်္ဂလာပါ</span>
    <span>— local ways to send support, from Myanmar.</span>
    <span class="soon">{LOCAL_STATUS}</span>
  </p>
  <div class="local-grid">
    {#each LOCAL_METHODS as m (m.id)}
      <div class="card local-card">
        <span class="local-tile" aria-hidden="true">{m.initials}</span>
        <div class="local-id">
          <b>{m.name}</b>
          <small>{m.hint}</small>
        </div>
        <div class="local-mock" aria-hidden="true">
          {m.kind === "wallet" ? "09 ••• ••• •••" : "Account •••• •••• ••"}
        </div>
      </div>
    {/each}
  </div>
  <p class="local-note">
    Live details land here soon. Until then,
    <button type="button" class="linkish" onclick={() => support.choose("crypto")}
      >crypto reaches us from anywhere</button
    >.
  </p>
  <p class="local-thanks mm-text" lang="my">ကျေးဇူးတင်ပါတယ်။</p>
</div>
