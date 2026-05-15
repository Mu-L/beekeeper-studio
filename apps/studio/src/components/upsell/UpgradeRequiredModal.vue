<template>
  <portal to="modals">
    <modal
      class="vue-dialog beekeeper-modal upgrade-modal"
      name="upgrade-modal"
      height="auto"
      :width="modalWidth"
    >
      <div
        class="dialog-content upgrade-modal-content"
        v-kbd-trap="true"
      >
        <button
          class="close-btn btn btn-fab"
          @click.prevent="close"
          aria-label="Close"
        >
          <i class="material-icons">clear</i>
        </button>

        <div class="upgrade-modal-scroll">
          <!-- Header -->
          <div class="upgrade-modal-header">
            <img class="bk-badge" :src="logoUrl" alt="Beekeeper Studio">
            <div class="title-block" :class="{ triggered }">
              <div v-if="triggered" class="eyebrow">
                <i class="material-icons">lock</i>
                <span>Upgrade required</span>
              </div>
              <h2 class="title">
                {{ triggered ? `Unlock ${featureName}` : 'Upgrade Beekeeper Studio' }}
              </h2>
            </div>
            <span class="indie-pill">
              <span class="dot"></span>
              Independent · Open source
            </span>
          </div>
          <p v-if="triggered" class="subtitle">
            … plus a bunch of other intuitive and useful features.
          </p>

          <!-- What you unlock -->
          <div class="unlock-section">
            <div class="section-label">What you unlock by upgrading</div>
            <ul class="unlock-list">
              <li
                v-for="item in unlockList"
                :key="item.id"
                class="unlock-item"
              >
                <i
                  class="material-icons unlock-icon"
                  :style="{ color: item.color }"
                >{{ item.icon }}</i>
                <div class="unlock-text">
                  <span class="unlock-title">{{ item.title }}</span>
                  <span v-if="item.blurb" class="unlock-blurb">{{ item.blurb }}</span>
                </div>
              </li>
              <li class="unlock-more">
                <a
                  href="#"
                  @click.prevent="learnMore"
                >
                  …and much, much more
                  <span class="link-emphasis">see the full list</span>
                  <i class="material-icons">arrow_forward</i>
                </a>
              </li>
            </ul>
          </div>

          <!-- Testimonial -->
          <figure class="testimonial">
            <div class="avatar">MK</div>
            <div class="testimonial-body">
              <blockquote>
                “By far the most user-friendly DB GUI out there. Our whole team bought a license.”
              </blockquote>
              <figcaption>
                <span class="author">Matt K</span>
                <span class="sep">·</span>
                <span class="role">Engineering Lead, MinnHealth</span>
              </figcaption>
            </div>
          </figure>

          <!-- CTAs -->
          <div class="cta-row">
            <UpsellButtons @started-trial="close" />
          </div>
        </div>

        <!-- Lifetime license footer band -->
        <div class="lifetime-footer" v-tooltip="'Subscribe for 12+ months and get lifetime access to any version released within your subscription period.'">
          <i class="material-icons">all_inclusive</i>
          <span>
            <strong>Lifetime license</strong>
            - included as part of every subscription.<span class="asterisk">*</span>
          </span>
        </div>
      </div>
    </modal>
  </portal>
</template>

<script lang="ts">
import { AppEvent } from '@/common/AppEvent'
import Vue from 'vue'
import UpsellButtons from './common/UpsellButtons.vue'
import logoUrl from '@/assets/logo.svg'

const UPGRADE_URL = 'https://www.beekeeperstudio.io/upgrade'

const FEATURES = [
  {
    id: 'ai',
    title: 'SQL AI Shell',
    blurb: 'Bring your own model — Claude, OpenAI, Gemini, or local.',
    icon: 'auto_awesome',
    color: 'var(--bks-brand-pink, #ff78f7)'
  },
  {
    id: 'json',
    title: 'JSON Sidebar',
    blurb: 'View any row as JSON and expand foreign keys inline.',
    icon: 'data_object',
    color: 'var(--bks-item-view, #4ad0ff)'
  },
  {
    id: 'organize',
    title: 'Folders',
    blurb: 'Folders, drag-and-drop reordering, color coding.',
    icon: 'folder',
    color: 'var(--bks-text, rgba(255,255,255,0.67))'
  },
  {
    id: 'workspaces',
    title: 'Cloud Workspaces',
    blurb: 'Sync connections across devices, share a Team folder.',
    icon: 'cloud',
    color: 'var(--bks-brand-secondary, #4ad0ff)'
  }
] as const

export default Vue.extend({
  components: { UpsellButtons },
  data() {
    return {
      featureName: null as string | null,
      logoUrl,
      modalWidth: 620
    }
  },
  computed: {
    triggered(): boolean {
      return !!this.featureName
    },
    unlockList(): Array<{ id: string, title: string, blurb: string, icon: string, color: string }> {
      const match = this.featureName
        ? FEATURES.find((f) => f.title.toLowerCase() === this.featureName!.toLowerCase())
        : null

      if (match) {
        // Move matched feature to the front of the list
        return [match, ...FEATURES.filter((f) => f.id !== match.id)]
      }

      if (this.featureName) {
        // Synthetic entry — feature isn't one of our 4 known ones
        const synthetic = {
          id: 'synthetic',
          title: this.featureName,
          blurb: '',
          icon: 'workspace_premium',
          color: 'var(--bks-theme-primary, #fad83b)'
        }
        return [synthetic, ...FEATURES]
      }

      return [...FEATURES]
    }
  },
  methods: {
    showModal(featureName?: string | null) {
      if (this.$store.getters.isCommunity) {
        this.featureName = featureName || null
        this.$modal.show('upgrade-modal')
      }
    },
    close() {
      this.$modal.hide('upgrade-modal')
    },
    learnMore() {
      this.$native.openLink(UPGRADE_URL)
    }
  },
  mounted() {
    this.$root.$on(AppEvent.upgradeModal, this.showModal)
  },
  beforeDestroy() {
    this.$root.$off(AppEvent.upgradeModal, this.showModal)
  }
})
</script>
