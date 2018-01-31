<template>
      <components :is="com.COM" v-bind="com.props" class="pg-com" :active="$store.state.activeCOM === com">
          <template v-if="com.subCOM && com.subCOM.length">
            <com-wrapper :com="subCOM" v-for="(subCOM,idx) in com.subCOM" :key="idx"></com-wrapper>
          </template>
      </components>
</template>

<script>
export default {
    name:'comWrapper',
    props:{
        com:{
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