<template>
  <preview-output></preview-output>
</template>
<script>
export default {
  components:{
      'preview-output':window.httpVueLoader(`preview.vue`)
  }
};
</script>

