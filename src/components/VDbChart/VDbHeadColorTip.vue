<template>
  
  <q-card-section style="padding: 8px 8px;">
    <div class="text-subtitle2">Colors</div>
    <div class="row">
      <div class="col-md-2">
        <div class="text-subtitle4">Default:</div>
      </div>
      <div class="col-md-2 offset-md-2">
        <rect class="db-tooltip__colorblock">
              <rect class="db-tooltip__colorblock db-tooltip__colorblock-default" :style="{'background': cl, 'height':'1.4em', width: '1.4em'}" @click.passive="setColor($event, null)" @touchend.passive="setColor($event, null)"></rect>
            </rect>
      </div>
      
    </div>
    <div class="q-pa-xs col">
     
      <div class="row" v-for="row of palette" ref="cp" style="padding: 4px 6px;">
        <div v-for="cl of row" :key="cl" style="padding: 4px 6px;">
        
            <rect class="db-tooltip__colorblock">
              <rect class="db-tooltip__colorblock" :style="{'background': cl, 'height':'1.4em', width: '1.4em'}" @click.passive="setColor($event, cl)" @touchend.passive="setColor($event, cl)"></rect>
            </rect>
 
          </div>
    
    </div>      
  
    </div>
  </q-card-section>
</template>

<script setup>

import {ref} from 'vue'
  
  const props = defineProps({
    table: Object, 
  });

  const cp = ref(null);

  const emit = defineEmits([
    'click:color-block'
  ])

  const palette = [['#1E69FD','#4B82B0','#121212','#24BAB1','#126E7A'],
              ['#2D6512','#79AD51','#E4A62E','#EB801B','#8F8DD8'],
              ['#990D0D','#CA4242','#DE65C3','#6724BB','#A15CF5']];
  
  const setColor = (e,color) => { 
    emit('click:color-block',e,props.table.id, props.table.name, color,props.table.schema.name)
  };
  
</script>

