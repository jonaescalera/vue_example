<template>
  <v-card id="organization-preview">
      <v-row>
        <v-col class="text-right">
          <v-btn id="edit-organization-btn" color="primaryLight" class="primary--text font-weight-bold mr-3" depressed>
            <v-icon small class="mr-1">mdi-pencil</v-icon>Edit
          </v-btn>
          <v-img class="mx-auto preview-organization-img" :src="$attrs.icon" height="80" width="80"></v-img>
        </v-col>
      </v-row>
      <v-row>
        <v-col sm=12>
          <div class="preview-organization-title">{{item.name}}</div>
          <div class="preview-organization-subtitle">{{item.website || 'No website'}}</div>
        </v-col>
      </v-row>
    <v-expansion-panels>
    <v-expansion-panel :key="1">
      <v-expansion-panel-header><div class="expansion-panel-title"> About this organization </div></v-expansion-panel-header>
      <v-expansion-panel-content class="ml-5">
        <div class="mb-5">
          <div class="about-title">Name</div>
          <div class="about-subtitle">{{item.name}}</div>
        </div>
        <div class="mb-5">
          <div class="about-title">Organization Type</div>
          <div class="about-subtitle">{{item.type}}</div>
        </div>
        <div class="mb-5">
          <div class="about-title">Status</div>
          <div class="about-subtitle" v-if="item.enabled">Active <img src="../../assets/img/icons/green-check.svg" /></div>
          <div class="about-subtitle" v-else>Inactive <img src="../../assets/img/icons/grey-x.svg" /></div>
        </div>
        <div class="mb-5">
          <div class="about-title">Address</div>
          <div class="about-subtitle">{{item.address}}</div>
          <!-- <div class="about-subtitle">Nashville, TN 10101</div>
          <div class="about-subtitle">USA</div> -->
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel :key="2">
      <v-expansion-panel-header><div class="expansion-panel-title"> Contact person </div></v-expansion-panel-header>
      <v-expansion-panel-content>
        <div class="contact-box">
          <v-row>
            <v-col sm=3>
              <img src="../../../src/assets/img/dummy/face.jpg" alt=""/>
              <div class="role-text">{{orgContact.role || 'Admin'}}</div>
            </v-col>
            <v-col sm=9 class="px-0">
              <div class="contact-info">
                <div class="contact-name">{{orgContact.name}}</div>
                <div class="contact-position">{{orgContact.title}} | {{orgContact.department}}</div>
                <div class="contact-contact">{{orgContact.email}} | {{orgContact.phone}}</div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
  </v-card>
</template>

<script>

import { mapActions } from 'vuex';


export default {
  data() {
    return {
      item: this.$attrs,
      orgContact:{}
    }
  },
  mounted() {
   this.getOrganizationContact(this.item.id).then((res)=>{
     this.orgContact = res.data;
   });
  },
  methods: {
    ...mapActions('organization', ['getOrganizationContact']),
  },
  watch:{
    item() {
      this.orgContact={};
       this.getOrganizationContact(this.item.id).then((res)=>{
        this.orgContact = res.data;
       });
    }
  },
  updated() {
    this.item = this.$attrs;
  }
}
</script>

<style lang="scss" scoped>
.preview-organization-img{
  margin-top: -25px;
}
.preview-organization-title {
  text-align: center;
  font-size: 1.5rem;
  color: var(--v-primary-darken2);
}
.preview-organization-subtitle {
  text-align: center;
  font-size: 0.7rem;
  color: var(--v-secondary-base);
}
.about-title {
  font-size: 0.75rem;
}
.about-subtitle {
  font-size: 0.88rem;
  color: var(--v-primary-darken2);
}
.expansion-panel-title {
  font-size: 1rem;
  margin-left: 20px;
  font-weight: 600;
  color: var(--v-primary-darken2);
}
.contact-box {
  border: solid 1px #5d667b38;
  border-radius: 3px;
  padding: 0px 15px 0px 15px;
  .col 
  img {
    height: 64px;
    width: 64px;
  }
  .role-text {
    text-align: center;
    font-size: 0.65rem;
    width: 64px;
    margin-top: 3px;
  }
  .contact-info {
    text-align: left;
    display:table-cell;
    vertical-align:middle;
    padding-top: 15px;
    .contact-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--v-primary-darken2);
    }
    .contact-position {
      font-size: 12px;
      font-weight: normal;
      color: #5d667b;
    }
    .contact-contact {
      font-size: 11px;
      font-weight: 500;
      color: var(--v-secondary-base);
    }
  }
}

	// IE styles
@media all and (-ms-high-contrast:none) {
  .edit-btn {
    width: 25%;    
  }
}
</style>