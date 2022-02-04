<template>
  <v-row>
    <i18n path="password-policy-notice" tag="v-col" class="text-center">
      <a class="policy-link" @click.stop="policyDialog = true">
        {{ $t('password-policy-notice-link') }}
      </a>
    </i18n>
    <v-dialog v-model="policyDialog" width="500" scrollable>
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('password-policy') }}</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <p class="mt-4">
            {{ $t('password-policy-body-text1') }}
          </p>
          <ol>
            <li>
              <i18n path="password-policy-body-text2" tag="p">
                <strong>
                  {{ $t('password-policy-body-text2-strong') }}
                </strong>
              </i18n>
            </li>
            <li>
              <i18n path="password-policy-body-text3" tag="p">
                <strong>
                  {{ $t('special-character') }}
                </strong>
              </i18n>
            </li>
            <li>
              <i18n path="password-policy-body-text4" tag="p">
                <strong>
                  {{ $t('password-policy-body-text4-strong') }}
                </strong>
              </i18n>
              <ol class="alpha-list">
                <li><p>{{ $t('lowercase-characters') }} {a-z}</p></li>
                <li><p>{{ $t('uppercase-characters') }} {A-Z}</p></li>
                <li><p>{{ $t('numbers') }} {0-9}</p></li>
              </ol>
            </li>
            <li>
              <i18n path="password-policy-body-text5" tag="p">
                <strong>
                  {{ $t('special-character') }}
                </strong>
              </i18n>
            </li>
          </ol>

          <div class="d-flex justify-center">
            <table>
              <tr>
                <th>{{ $t('description') }}</th>
                <th>{{ $t('character') }}</th>
              </tr>
              <tbody>
                <tr>
                  <td>{{ $t('exclamation-mark-point') }}</td>
                  <td class="character-cell">!</td>
                </tr>
                <tr>
                  <td>{{ $t('open-parenthesis') }}</td>
                  <td class="character-cell">(</td>
                </tr>
                <tr>
                  <td>{{ $t('close-parenthesis') }}</td>
                  <td class="character-cell">)</td>
                </tr>
                <tr>
                  <td>{{ $t('dash') }}</td>
                  <td class="character-cell">-</td>
                </tr>
                <tr>
                  <td>{{ $t('period') }}</td>
                  <td class="character-cell">.</td>
                </tr>
                <tr>
                  <td>{{ $t('question-mark') }}</td>
                  <td class="character-cell">?</td>
                </tr>
                <tr>
                  <td>{{ $t('open-bracket') }}</td>
                  <td class="character-cell">[</td>
                </tr>
                <tr>
                  <td>{{ $t('close-bracket') }}</td>
                  <td class="character-cell">]</td>
                </tr>
                <tr>
                  <td>{{ $t('underscore') }}</td>
                  <td class="character-cell">_</td>
                </tr>
                <tr>
                  <td>{{ $t('grave-accent') }}</td>
                  <td class="character-cell">`</td>
                </tr>
                <tr>
                  <td>{{ $t('tilde') }}</td>
                  <td class="character-cell">~</td>
                </tr>
                <tr>
                  <td>{{ $t('semicolon') }}</td>
                  <td class="character-cell">;</td>
                </tr>
                <tr>
                  <td>{{ $t('colon') }}</td>
                  <td class="character-cell">:</td>
                </tr>
                <tr>
                  <td>{{ $t('commercial-at') }}</td>
                  <td class="character-cell">@</td>
                </tr>
                <tr>
                  <td>{{ $t('number-sign') }}</td>
                  <td class="character-cell">#</td>
                </tr>
                <tr>
                  <td>{{ $t('dollar-sign') }}</td>
                  <td class="character-cell">$</td>
                </tr>
                <tr>
                  <td>{{ $t('percent-sign') }}</td>
                  <td class="character-cell">%</td>
                </tr>
                <tr>
                  <td>{{ $t('circumflex-accent') }}</td>
                  <td class="character-cell">^</td>
                </tr>
                <tr>
                  <td>{{ $t('ampersand') }}</td>
                  <td class="character-cell">&amp;</td>
                </tr>
                <tr>
                  <td>{{ $t('asterisk') }}</td>
                  <td class="character-cell">*</td>
                </tr>
                <tr>
                  <td>{{ $t('plus-sign') }}</td>
                  <td class="character-cell">+</td>
                </tr>
                <tr>
                  <td>{{ $t('equals-sign') }}</td>
                  <td class="character-cell">=</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="policyDialog = false">
            {{ $t('close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      policyDialog: false,
    };
  },
};
</script>

<style type="text/css" scoped>
.policy-link {
  text-decoration: underline;
}
.alpha-list {
  list-style-type: lower-alpha;
}

table,
th,
td {
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-collapse: collapse;
}

th,
td {
  padding: 5px;
}
th {
  text-align: left;
}
.character-cell {
  text-align: center;
}
</style>
