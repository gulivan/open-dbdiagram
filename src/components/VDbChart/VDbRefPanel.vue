<template>
  <svg v-if="refspanel.show"
       :x="refspanel.x"
       :y="refspanel.y"
       class="db-tooltip db-tooltip_panel"
  >
    <foreignObject x="0" y="0" width="100%" height="100%" class="db-tooltip__content">
      <q-card  class="db-tooltip__content-card" >
        <component :is="refspanel.component" v-bind="refspanel.binds" @click:ref-cp="onClickRefCp"/>
      </q-card>
    </foreignObject>
  </svg>
</template>

<script setup>
  import { useChartStore } from '../../store/chart'
  import { computed } from 'vue'

  const store = useChartStore()
  const emit = defineEmits([
    'click:cp'
  ])

  function onClickRefCp(e, ...args){
    
    emit("click:cp",e, ...args)
  }

  
  const refspanel = computed(() => store.refspanel)
</script>
