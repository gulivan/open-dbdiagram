<template>
  <svg v-if="panel.show"
       :x="panel.x"
       :y="panel.y"
       class="db-tooltip db-tooltip_panel"
  >
    <foreignObject x="0" y="0" width="100%" height="100%" class="db-tooltip__content">
      <q-card  class="db-tooltip__content-card" >
        <component :is="panel.component" v-bind="panel.binds"  @click:color-block="onClick"/>
      </q-card>
    </foreignObject>
  </svg>
</template>

<script setup>
  import { useChartStore } from '../../store/chart'
  import { computed } from 'vue'

  const store = useChartStore()
  const emit = defineEmits([
    'click:color',
  ])

  function onClick(e, ...args){
    
    emit("click:color",e, ...args)
  }
  const panel = computed(() => store.panel)
</script>
