<template>
    <div>
        <v-dialog
            @click:outside="closeModal"
            @keydown.esc="closeModal"
            v-model="dialog"
            width="513"
            scrollable
        >
            <v-card>
                <v-card-title class="secondary">{{ $t('location-beacons') }}</v-card-title>
                <div class="modal-close" @click="closeModal">X</div>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <v-btn
                                id="add-offsite-lb"
                                height="32"
                                :depressed="true"
                                @click="createLocation"
                                class="primary--text font-weight-bold float-right"
                                color="primaryLight"
                            >{{$t('add-offsite-lb')}}</v-btn>
                        </v-col>
                    </v-row>
                    <v-row v-for="(loc, i) in locations" :key="i">
                        <v-col col="10">
                            <h3>{{loc.name}}</h3>
                            <h4>{{loc.macAddress}}</h4>
                        </v-col>
                        <v-col col="2">
                            <v-icon class="float-right" @click="editLocation(loc.id)">mdi-pencil</v-icon>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-dialog>
        <OffsiteLocationNewEdit ref="offsiteLocation" :modalMode="modalMode" :siteId="site ? site.id : ''" @changeOnOffsiteLocations="handleLocationHasChanges"/>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import OffsiteLocationNewEdit from '../../components/locations/offsite-location-new-edit';

    export default {
        components: {
            OffsiteLocationNewEdit
        },
        data() {
            return {
                dialog: false,
                site: null,
                locations: null,
                modalMode: ''
            }
        },
        methods: {
            ...mapActions('location', ['getLocationsBySite', 'getLocationById']),
            async openModal(site) {
                this.site = site;
                this.locations = await this.getLocationsBySite({siteId: this.site.id});
                this.dialog = true;
            },
            closeModal() {
                this.dialog = false;
            },
            async editLocation(locId){
                let location = await this.getLocationById(locId);
                this.modalMode = 'edit';
                this.$refs.offsiteLocation.openModal(location);
            },
            async createLocation(){
                this.modalMode = 'create';
                this.$refs.offsiteLocation.openModal();
            },
            async handleLocationHasChanges(){
                this.locations = await this.getLocationsBySite({siteId: this.site.id});
            }
        }
    }
</script>
<style scoped>
    .modal-close {
        position: absolute;
        right: 20px;
        font-weight: bold;
        top: 15px;
        color: #fff;
        cursor: pointer;
    }
</style>