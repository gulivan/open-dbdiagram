<template>
  
    <q-card-section style="padding: 8px 8px;">
      <div class="text-subtitle2">Ref actions</div>
      <div class="row">
            <q-list dense class="db-tooltip_panel__list">
                <q-item clickable v-ripple @click.passive="act($event,'RESET')">
                    <q-item-section avatar>
                        <q-icon color="primary" name="refresh" />
                    </q-item-section>

                    <q-item-section>Reset waypoints</q-item-section>
                </q-item>
                <q-item clickable v-ripple @click.passive="act($event,'ADD')">
                    <q-item-section avatar>
                        <q-icon color="primary" name="add" />
                    </q-item-section>

                    <q-item-section>Add waypoint</q-item-section>
                </q-item>
                <q-item clickable v-ripple @click.passive="act($event,'DEL')">
                    <q-item-section avatar>
                        <q-icon color="primary" name="delete" />
                    </q-item-section>

                    <q-item-section>Remove waypoint</q-item-section>
                </q-item>
            </q-list>
      </div>      
    </q-card-section>
  </template>
  
  <script setup>
      
    const props = defineProps({
      data: Object,
      wpid: Number, 
      click:Object
    });
  
    function act(e,option) {
        console.log(e,option,props)
        emit('click:ref-cp',e,option,props.click,props.wpid,props.data.id)
    }

    const emit = defineEmits([
      'click:ref-cp'
    ])
     
  </script>
  
  