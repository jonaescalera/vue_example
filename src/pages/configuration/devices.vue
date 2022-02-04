<template>
  	<div id="devices">
    	<v-row>
      		<v-col class="custom-card px-0 pa-0">
      			<DataTable :settings="settings" :columns="columns" :rows="rows" :totalRows="10" @onFilter="getRows"></DataTable>
      		</v-col>
	  	</v-row>
	</div>
</template>
<script>
  import dummy from "../../assets/data/dummy"
  import BatteryLevelComponent from "../../components/shared/data-table/custom-cells/battery-level"
  import AvailabiltyComponent from "../../components/shared/data-table/custom-cells/availability-preview"
  import StatusComponent from "../../components/shared/data-table/custom-cells/status"
  import OrganizationPreview from "../../components/organizations/organization-preview"
  import DataTable from "../../components/shared/data-table/data-table"

  export default {
    name: "Devices",
  	components: {
      BatteryLevelComponent,
      AvailabiltyComponent,
      StatusComponent,
  		DataTable
  	},
  	data () {
        return {
          rows: dummy.tableData,
        	settings: {
            actionsPanel: true,
            rowPreview: OrganizationPreview,
            moreActions: [
              {
                name: this.$i18n.t('table-edit'),
                fn: this.edit,
                icon: 'pen'
              },
              {
                name: this.$i18n.t('table-delete'),
                fn: this.delete,
                icon: 'delete'
              }
            ],
          },
          columns: [
            {
              name: this.$i18n.t('assets-column-name'),
              field: "name",
              type: "render",
              width: "22%",
              sortable: true,
              resizable: true,
              lockPosition: true,
              suppressNavigable: true,
              cellRenderer: AvailabiltyComponent
            },
            { 
              name: this.$i18n.t('assets-column-site'), 
              field: "site", 
              type: "data",
              sortable: true, 
              resizable: true ,
            },
            { 
              name: this.$i18n.t('assets-column-area'), 
              field: "area", 
              type: "data",
              sortable: true, 
              resizable: true 
            }, 
            { 
              name: this.$i18n.t('assets-column-zone'), 
              field: "zone",
              type: "data",
              sortable: true, 
              resizable: true 
            },
            {
              name: this.$i18n.t('assets-column-battery'),
              field: "batteryStatus",
              type: "render",
              cellRenderer: BatteryLevelComponent,
              width: 90,
              minWidth: 50,
              maxWidth: 150,
              sortable: true,
              resizable: false
            },
            {
              name: this.$i18n.t('assets-column-last-seen'),
              field: "lastEventTime",
              type: "date",
              format: 'MM/DD/YY hh:mm',
              sortable: true,
              resizable: true
            },
            {
              name: 'Status',
              field: "statusActive",
              type: "render",
              cellRenderer: StatusComponent,
              renderParams: { 'isTrue': this.$t('data-table-active'), 'isFalse': this.$t('data-table-inactive')}
            }
          ]
        }
    },
    methods: {
      edit(row) {
        console.log('edit device');
      },
      delete(row) {
        console.log('delete device');
      },
      getRows(filter){
        console.log('call service to get filter data');
      }
    }
  }
</script>