<template>
  <div id="dashboard" class="dashboard frame">
    <v-row>
      <!-- <iframe src="https://ffa14da2564145efb87cecf8f85b8abd.us-east-1.aws.found.io:9243/app/dashboards#/view/5e173990-a4f3-11ea-8679-cffec56eb2f2?embed=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-30d,to:now))&_a=(description:'',filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:a9cfc5d0-a1da-11ea-8679-cffec56eb2f2,key:siteName,negate:!f,params:(query:Hurley),type:phrase),query:(match_phrase:(siteName:Hurley))),('$state':(store:appState),exists:(field:siteName),meta:(alias:!n,disabled:!f,index:a9cfc5d0-a1da-11ea-8679-cffec56eb2f2,key:siteName,negate:!f,type:exists,value:exists))),fullScreenMode:!f,options:(hidePanelTitles:!f,useMargins:!t),query:(language:kuery,query:''),timeRestore:!f,title:DashDevices,viewMode:view)" height="600" width="800"></iframe> -->
      <!-- <iframe src="https://ffa14da2564145efb87cecf8f85b8abd.us-east-1.aws.found.io:9243/goto/08bdda0afd378a6fa4ce66f9e51ea660" height="600" width="800"></iframe> -->
      <iframe
        src="https://ffa14da2564145efb87cecf8f85b8abd.us-east-1.aws.found.io:9243/app/dashboards#/view/5e173990-a4f3-11ea-8679-cffec56eb2f2?embed=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-30d,to:now))&_a=(description:'',filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:a9cfc5d0-a1da-11ea-8679-cffec56eb2f2,key:siteName,negate:!f,params:(query:Hurley),type:phrase),query:(match_phrase:(siteName:Hurley))),('$state':(store:appState),exists:(field:siteName),meta:(alias:!n,disabled:!f,index:a9cfc5d0-a1da-11ea-8679-cffec56eb2f2,key:siteName,negate:!f,type:exists,value:exists))),fullScreenMode:!f,options:(hidePanelTitles:!f,useMargins:!t),query:(language:kuery,query:''),timeRestore:!f,title:DashDevices,viewMode:view)"
        height="600"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </v-row>
  </div>
</template>
<script>
export default {};
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 0 30px;
  height: calc(100vh - 96px);
  overflow: auto;
}

.frame iframe {
  width: 100%;
}
</style>
