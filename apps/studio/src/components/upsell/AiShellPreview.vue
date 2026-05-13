<template>
  <div class="cc-preview" ref="root" :class="{ 'cc-reduced-motion': reducedMotion }">
    <div class="cc-preview-head">
      <i class="material-icons cc-preview-icon">auto_awesome</i>
      <span class="cc-preview-title">AI Shell</span>
      <span class="cc-preview-model">claude-opus-4-7</span>
    </div>
    <div class="cc-preview-body" :class="{ 'is-resetting': resetting }">
      <div
        class="cc-user cc-step cc-step-x"
        :class="{ 'cc-step-show': step >= 1 }"
      >
        How long does it take trial users to convert to paid?
      </div>

      <div class="cc-asst">
        <!-- Always rendered to reserve vertical space, so the caret showing
             doesn't cause a layout jump. -->
        <div class="cc-thinking" aria-hidden="true">
          <span class="cc-caret" v-show="step === 2"></span>
        </div>

        <p
          class="cc-step"
          :class="{ 'cc-step-show': step >= 3 }"
        >
          I'll join <code>trials</code> with <code>subscriptions</code> on email and measure the gap.
        </p>

        <div
          class="cc-tool cc-step"
          :class="{ 'cc-step-show': step >= 4 }"
        >
          <span class="cc-tool-bar"></span>
          <span class="cc-tool-name">Get Columns</span>
          <span class="cc-tool-sep">&mdash;</span>
          <span class="cc-tool-meta">12 columns</span>
        </div>

        <div
          class="cc-tool cc-step"
          :class="{ 'cc-step-show': step >= 5 }"
        >
          <span class="cc-tool-bar"></span>
          <span class="cc-tool-name">Get Columns</span>
          <span class="cc-tool-sep">&mdash;</span>
          <span class="cc-tool-meta">9 columns</span>
        </div>

        <div
          class="cc-runquery cc-step"
          :class="{ 'cc-step-show': step >= 6 }"
        >
          <div class="cc-rq-head">
            <span>Run Query</span>
            <span class="cc-rq-actions">
              <i class="material-icons">open_in_new</i>
              <span class="cc-rq-copy">Copy query</span>
            </span>
          </div>
          <div
            class="cc-sql cc-sql-reveal"
            :class="{ shown: step >= 7 }"
          ><span class="kw">SELECT</span> <span class="kw">AVG</span>(<span class="kw">EXTRACT</span>(<span class="str">'day'</span> <span class="kw">FROM</span> s.created_at &minus; t.started_at))
  <span class="kw">FROM</span> <span class="id">trials</span> t <span class="kw">JOIN</span> <span class="id">subscriptions</span> s
    <span class="kw">ON</span> s.email = t.email;</div>
        </div>

        <div
          class="cc-result cc-step"
          :class="{ 'cc-step-show': step >= 8 }"
        >
          <div class="cc-result-head">1 row &middot; 38ms</div>
          <table class="cc-result-table">
            <thead>
              <tr><th>avg_days_to_convert</th></tr>
            </thead>
            <tbody>
              <tr><td class="num">6.84</td></tr>
            </tbody>
          </table>
        </div>

        <p
          class="cc-final cc-step"
          :class="{ 'cc-step-show': step >= 9 }"
        >
          Trial users convert in <strong>~6.8 days</strong> on average. The fastest 25% convert in under 2 days.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

// Sequence of timestamps (ms) for each step transition. Index = target step.
// Step meaning:
//   0 = nothing visible
//   1 = user prompt visible
//   2 = "thinking" caret visible
//   3 = assistant intro paragraph visible
//   4 = first Get Columns row visible
//   5 = second Get Columns row visible
//   6 = Run Query header visible
//   7 = SQL block fully revealed (clip-path slide)
//   8 = result row visible (after SQL "runs")
//   9 = assistant final answer visible
const STEP_DELAYS = [400, 1000, 500, 600, 600, 700, 300, 900, 700];
const HOLD_MS = 5000;
const RESET_MS = 350;
const FINAL_STEP = STEP_DELAYS.length;

export default Vue.extend({
  data() {
    return {
      step: 0,
      resetting: false,
      reducedMotion: false,
      timers: [] as number[],
      observer: null as IntersectionObserver | null,
      visible: false,
    };
  },
  mounted() {
    this.reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (this.reducedMotion) {
      this.step = FINAL_STEP;
      return;
    }

    if (typeof IntersectionObserver !== "undefined") {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const wasVisible = this.visible;
          this.visible = entry.intersectionRatio >= 0.4;
          if (this.visible && !wasVisible) {
            this.startLoop();
          } else if (!this.visible && wasVisible) {
            this.stopLoop();
          }
        },
        { threshold: [0, 0.4, 1] }
      );
      this.observer.observe(this.$refs.root as Element);
    } else {
      this.visible = true;
      this.startLoop();
    }
  },
  beforeDestroy() {
    this.stopLoop();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },
  methods: {
    startLoop() {
      this.stopLoop();
      this.step = 0;
      this.resetting = false;
      this.scheduleNext(0);
    },
    stopLoop() {
      for (const t of this.timers) clearTimeout(t);
      this.timers = [];
    },
    scheduleNext(currentStep: number) {
      if (!this.visible) return;
      const next = currentStep + 1;
      if (next > STEP_DELAYS.length) {
        // Hold the final frame, then fade out and restart.
        const t1 = window.setTimeout(() => {
          this.resetting = true;
          const t2 = window.setTimeout(() => {
            this.step = 0;
            this.resetting = false;
            // Small breath before kicking off again.
            const t3 = window.setTimeout(() => this.scheduleNext(0), 250);
            this.timers.push(t3);
          }, RESET_MS);
          this.timers.push(t2);
        }, HOLD_MS);
        this.timers.push(t1);
        return;
      }
      const delay = STEP_DELAYS[currentStep];
      const t = window.setTimeout(() => {
        this.step = next;
        // Step 2 (thinking caret) is transient — it stays until step 3 fires,
        // which happens via the next scheduled timer.
        this.scheduleNext(next);
      }, delay);
      this.timers.push(t);
    },
  },
});
</script>
