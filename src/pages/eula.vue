<template>
  <v-app>
    <div>
      <app-header></app-header>
      <div class="eula-container">
        <div class="eula-header">
          <p>
            <strong>{{ $t('link-labs') }}</strong>
          </p>
          <p>
            <strong>
              <u>{{ $t('end-user-license-agreement') }}</u>
            </strong>
          </p>
        </div>
        <div class="eula-body">
          <ol class="nested-list bold-list">
            <li>
              <strong>{{ $t('eula-body-text-1') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-1-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-2') }}</strong>
              <ol class="nested-list">
                <i18n path="eula-body-text-2-1" tag="li">
                  <a
                    href="https://www.link-labs.com/3rd-party-terms"
                    target="_blank"
                  >
                    https://www.link-labs.com/3rd-party-terms
                  </a>
                </i18n>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-3') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-3-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-4') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-4-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-5') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-5-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-6') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-6-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-7') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-7-1') }}
                  <ol type="a">
                    <li>
                      {{ $t('eula-body-text-7-1-1') }}
                    </li>
                    <li>
                      {{ $t('eula-body-text-7-1-2') }}
                    </li>
                    <li>
                      {{ $t('eula-body-text-7-1-3') }}
                    </li>
                    <li>
                      {{ $t('eula-body-text-7-1-4') }}
                    </li>
                    <li>
                      {{ $t('eula-body-text-7-1-5') }}
                    </li>
                    <li>
                      {{ $t('eula-body-text-7-1-6') }}
                    </li>
                    <li>
                      {{ $t('eula-body-text-7-1-7') }}
                    </li>
                  </ol>
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-8') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-8-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-9') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-9-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-10') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-10-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-11') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-11-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-12') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-12-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-13') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-13-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-14') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-14-1') }}
                </li>
              </ol>
            </li>
            <li>
              <strong>{{ $t('eula-body-text-15') }}</strong>
              <ol class="nested-list">
                <li>
                  {{ $t('eula-body-text-15-1') }}
                </li>
                <li>
                  {{ $t('eula-body-text-15-2') }}
                </li>
                <li>
                  {{ $t('eula-body-text-15-3') }}
                </li>
                <i18n path="eula-body-text-15-4" tag="li">
                  <a
                    href="https://www.link-labs.com/open-source-software"
                    target="_blank"
                  >
                    https://www.link-labs.com/open-source-software
                  </a>
                </i18n>
                <li>
                  {{ $t('eula-body-text-15-5') }}
                </li>
                <li>
                  {{ $t('eula-body-text-15-6') }}
                </li>
                <li>
                  {{ $t('eula-body-text-15-7') }}
                </li>
              </ol>
            </li>
          </ol>
        </div>
        <v-container class="eula-options">
          <v-row align="center" justify="center">
            <p class="text-center">
              <strong>
                {{ $t('eula-notice-text-1') }}
                <br />
                {{ $t('eula-notice-text-2') }}
              </strong>
            </p>
          </v-row>
          <v-row align="center" justify="space-around">
            <v-btn depressed color="primary" @click="accept">
              {{ $t('i-agree') }}
            </v-btn>
            <v-btn depressed @click="reject">
              {{ $t('i-do-not-agree') }}
            </v-btn>
          </v-row>
        </v-container>
      </div>
    </div>
  </v-app>
</template>

<script type="text/javascript">
import { mapActions } from 'vuex';
import Header from '../layouts/shared/header.vue';

export default {
  name: "EULA",
  components: {
    'app-header': Header,
  },
  methods: {
    ...mapActions(['acceptEula', 'processLogin', 'logout']),
    async accept() {
      try {
        await this.acceptEula();
        await this.processLogin();
      } catch (e) {
        e;
      }
    },
    async reject() {
      try {
        await this.logout({vuetify: this.$vuetify});
      } catch (e) {
        e;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.eula-container {
  margin-top: 80px;
  padding: 10px 30px 30px;
}
.eula-header {
  text-align: center;
  text-transform: uppercase;
  line-height: 1;
}
.eula-body {
  max-height: calc(100vh - 320px);
  overflow: auto;
}
.eula-options {
  margin-top: 10px;
  max-width: 500px;
}

// Following is a modified version of a solution posted in https://stackoverflow.com/a/26245056
ol.nested-list {
  list-style-type: none;
  counter-reset: item;
  margin: 0;
  padding: 0;
  > li {
    display: table;
    counter-increment: item;
    margin-bottom: 0.6em;
    &:before {
      content: counters(item, '.') '. ';
      display: table-cell;
      padding-right: 0.6em;
    }
    > ol.nested-list > li {
      margin: 0;
      &:before {
        content: counters(item, '.') ' ';
      }
    }
  }
  &.bold-list > li:before {
    font-weight: bold;
  }
}
</style>
