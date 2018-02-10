<template>
      <components :is="comObj.com" v-bind="comObj.props" class="pg-com" :active="$store.state.activedComponent === comObj">
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
  },
  data(){
    return {
    }
  }
}
</script>