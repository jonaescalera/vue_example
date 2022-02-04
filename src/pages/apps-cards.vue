<template>
    <div>
        <v-row>
            <v-col class="custom-card card-no-footer-height">
                <v-container fill-height fluid>
			    <v-row align="center" justify="center">
                    <v-col v-for="(app, i) in appsList" :key="i"  md="2" sm="4" cols="12" class="primaryLight text-center primary--text py-16 apps-card mx-3 mb-3"  @click="$router.push(app.route)">
                        <v-icon color="primary" class="apps-icon mb-2">{{ app.icon }}</v-icon>
                        <h2>{{ $t(app.name) }}</h2>
                    </v-col>
                </v-row>
                </v-container>
            </v-col>
        </v-row>
    </div>
</template>
<script type="text/javascript">
	import deliveryData  from "../assets/data/deliveryData";

	export default {
       data() {	
			return {
				appsList: deliveryData.appsJson
			}
		}
    }
</script>
<style lang="scss" scoped>
    .apps-card{
        border-radius: 4px;
        cursor: pointer;
        &:hover{
            box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
        }
    }
	.apps-icon {
		font-size: 70px;
	}
</style>