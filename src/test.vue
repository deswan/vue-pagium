<template>
  <div class="toolbox">
    
  </div>
</template>

<script>

export default {
  data() {
    return {
    };
  },
  created() {
      
  },
  mounted(){
            this.$store.commit('addComponent',{
          node:{subCom:this.$store.getters.dialogs},
          comObj:{
              type:'Dialog',
              subCom:[]
          }
      })
      this.$store.commit('addComponent',{
          node:{subCom:this.$store.getters.components},
          comObj:{
              type:'Table',
              subCom:[]
          }
      })
              this.$store.commit('addComponent',{
            node:{subCom:this.$store.getters.components},
            comObj:{
                type:'Table',
                subCom:[]
            }
        })
      this.$store.commit('nodeChange',{
          drag:{
              p:{subCom:this.$store.getters.components},
              i:0
          },
          drop:{
              p:this.$store.getters.dialogs[0],
              i:0
          }
      })
    //   this.$store.commit('nodeChange',{
    //       drag:{
    //           p:this.$store.getters.dialogs[0],
    //           i:0
    //       },
    //       drop:{
    //           p:{subCom:this.$store.getters.components},
    //           i:0
    //       }
    //   })
    this.$store.commit('activateComponent',{
          comObj:this.$store.getters.dialogs[0].subCom[0]
      })
  }
};
</script>

