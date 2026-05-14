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

      <ul class="pills">
        <li class="pill-row">
          <i class="material-icons">vpn_key</i>
          <span>Bring your own model</span>
        </li>
        <li class="pill-row">
          <i class="material-icons">paid</i>
          <span>No usage fees, ever</span>
        </li>
        <li class="pill-row">
          <i class="material-icons">verified_user</i>
          <span>Asks before it runs SQL</span>
        </li>
      </ul>

      <div class="testimonial">
        <span class="stars" aria-label="5 out of 5">★★★★★</span>
        <span class="quote">"The AI feature is highly beneficial."</span>
        <span class="attr">— Mehmet Özdaş, Nuvo Code</span>
      </div>

      <upsell-buttons class="ai-shell-upsell-buttons" />
    </div>

    <status-bar :active="true" class="ai-shell-upsell-statusbar">
      <div class="lifetime-note">
        <i class="material-icons">all_inclusive</i>
        <span><strong>Lifetime license.</strong>&nbsp;Pay once, use forever — no subscription, no renewals.</span>
      </div>
    </status-bar>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import UpsellButtons from "./common/UpsellButtons.vue";
import AiShellPreview from "./AiShellPreview.vue";
import StatusBar from "@/components/common/StatusBar.vue";

export default Vue.extend({
  components: { UpsellButtons, AiShellPreview, StatusBar },
});
</script>
