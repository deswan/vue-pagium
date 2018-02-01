<template>
      <components :is="com.COM" :cols="com.props.cols" class="pg-com" :active="$store.state.activeCOM === com" :data-pgId="com._id">
          <template v-if="com.subCOM && com.subCOM.length">
            <com-wrapper :com="subCOM" v-for="(subCOM,idx) in com.subCOM" :key="idx"></com-wrapper>
          </template>
      </components>
</template>

<script>
export default {
    name:'comWrapper',
    props:['com'],
  created(){
      console.log(this.com)
  },
  data(){
    return {
    }
  }
}
</script>