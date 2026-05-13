<template>
  <div class="ai-shell-upsell">
    <div class="bg-glow" aria-hidden="true"></div>

    <div class="compact-card">
      <div class="head-row">
        <div class="mark">
          <i class="material-icons">auto_awesome</i>
        </div>
        <h1>Chat with your database</h1>
      </div>
      <p class="lede">
        A SQL wingman that figures out your schema on its own, writes
        and runs queries, and uses the LLM you already pay for.
      </p>

      <ai-shell-preview />

      <div class="pills">
        <div class="pill-row">
          <div class="ico"><i class="material-icons">vpn_key</i></div>
          <div>
            <strong>Bring your own model.</strong>
            <span class="sub">Claude, OpenAI, Gemini, or any local agent on the OpenAI API spec.</span>
          </div>
        </div>
        <div class="pill-row">
          <div class="ico"><i class="material-icons">paid</i></div>
          <div>
            <strong>No usage fees, ever.</strong>
            <span class="sub">Beekeeper talks straight to your agent. No proxy, no logs, no upcharge.</span>
          </div>
        </div>
        <div class="pill-row">
          <div class="ico"><i class="material-icons">verified_user</i></div>
          <div>
            <strong>Asks before it runs SQL.</strong>
            <span class="sub">Read-only by default. Source and prompts are on GitHub.</span>
          </div>
        </div>
      </div>

      <div class="testimonial">
        <span class="stars" aria-label="5 out of 5">★★★★★</span>
        <span class="quote">"The AI feature is highly beneficial."</span>
        <span class="attr">— Mehmet Özdaş, Nuvo Code</span>
      </div>

      <upsell-buttons class="ai-shell-upsell-buttons" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import UpsellButtons from "./common/UpsellButtons.vue";
import AiShellPreview from "./AiShellPreview.vue";

export default Vue.extend({
  components: { UpsellButtons, AiShellPreview },
});
</script>
