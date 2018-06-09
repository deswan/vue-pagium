<template>
  <preview-output></preview-output>
</template>
<script>
export default {
  errorCaptured(err){
    return false
  },
  components:{
      'preview-output':window.httpVueLoader(`preview.vue`)
  }
};
</script>

