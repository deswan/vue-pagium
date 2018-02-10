<template>
      <components :is="comObj.com" v-bind="comObj.props" class="pg-com" :active="$store.state.activeComponent === comObj" :id="comObj.id">
          <template v-if="comObj.subCom && comObj.subCom.length">
            <com-wrapper :com-obj="subCom" v-for="subCom in com.subCOM" :key="subCom.id"></com-wrapper>
          </template>
      </components>
</template>

<script>
export default {
    name:'comWrapper',
    props:{
        comObj:{
            required:true
        }
    },
  created(){
      console.log(this.comObj)
  },
  data(){
    return {
    }
  }
}
</script>