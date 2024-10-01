<template>
  <div class="dbml-graph-wrapper">
    <v-db-chart v-if="schema && chart.loaded"
                v-bind="schema"
                :startpan="startPan"
                @click="locateInEditor"
                @dblclick:table-group="locateInEditor"
                @dblclick:table="locateInEditor"
                @dblclick:field="locateInEditor"
                @dblclick:ref="locateInEditor"
     />

    <div class="dbml-structure-wrapper" v-if="false">
      <q-card class="shadow-6">
        <v-db-structure v-if="editor.database.schemas"
                        :database="editor.database"
        />
      </q-card>
    </div>

    <div class="dbml-toolbar-wrapper">
      <q-card class="shadow-6">
        <q-toolbar class="rounded-borders">
          <q-btn
            class="q-mr-xs q-px-md"
            color="secondary"
            dense
            @click="applyAutoLayout"
          >
            Auto-Layout
          </q-btn>
          <q-btn
            class="q-mx-xs q-px-md"
            color="secondary"
            dense
            @click="applyScaleToFit">
            fit
          </q-btn>
          <q-space/>

          <q-slider
            class="q-mx-sm"
            style="width: 25%; min-width: 100px; max-width: 200px;"
            v-model="scale"
            :min="minScale"
            :max="maxScale"
          />
          <div
            class="q-mx-sm non-selectable"
            style="width: 2.5rem; flex: 0 0 auto;">{{ Math.round(scale) }} %
          </div>

        </q-toolbar>
      </q-card>
    </div>
  </div>
</template>

<script setup>
  import { useEditorStore } from '../store/editor'
  import { computed, onMounted, ref, watch } from 'vue'
  import VDbChart from './VDbChart/VDbChart'
  import { useChartStore } from '../store/chart'
  import VDbStructure from './VDbStructure'
import { store } from 'quasar/wrappers'

  const props = defineProps({
    schema: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits([
    'update:positions',
  ])
  const editor = useEditorStore()
  const chart = useChartStore()
  const startPan = ref({
    pan: {
      x:0,
      y:0
    },
    diagram:{
      width:0,
      height:0
    }
  })

  const locateInEditor = (e, thing) => {
    console.log("locateInEditor", e, thing);
    if (thing) {
      const token = thing.token
      editor.updateSelectionMarker(token.start, token.end)
    }
    console.log
    chart.hideTooltip();
    if ((Date.now() - chart.panel.datetime) > 500) chart.hidePanel();
    if ((Date.now() - chart.panel.datetime) > 500) chart.hideRefPanel();
  }

  const scale = computed({
    get () {
      return (chart.zoom || 1) * 100.0
    },
    set (value) {
      chart.updateZoom(value / 100.0)
    }
  })

  const minScale = ref(10)
  const maxScale = ref(200)

  const applyAutoLayout = () => {
    const tbls = chart.getTables;
    //var cntr = tbls.lenght % 2;
    var elements = Object.keys(tbls);
    var layout = [];
    let update = false;
    for (let el of elements){
      layout.push(Object.values(tbls[el]));
    }
    for (let index =0 ; index < layout.length; index++){
      var cross_vector = []
    if (update) {
      const tbls = chart.getTables;
    //var cntr = tbls.lenght % 2;
    var elements = Object.keys(tbls);
    layout = [];
      for (let el of elements){
        layout.push(Object.values(tbls[el]));
      }
    }
    let current_points = getObjectPoints(layout[index]);
    for (let i =0 ; i < layout.length; i++){
      if (i !== index){
     
        cross_vector = checkCrossPoints(current_points,getObjectPoints(layout[i]));
          if (cross_vector[0] || cross_vector[1] || cross_vector[2] || cross_vector[3]){
          break;
        }
      } 
    }
    if (cross_vector[0]) {
      layout[index][0] = layout[index][0]+layout[index][2]*2;
    }
    if (cross_vector[1]) {
      layout[index][0] = layout[index][0]-layout[index][2]*2;
      layout[index][1] = layout[index][1]+layout[index][3]*0.8;
    }
    if (cross_vector[2]) {
      layout[index][0] = layout[index][0]-layout[index][2]*2;
      layout[index][1] = layout[index][1]-layout[index][3]*0.8;
    }
    if (cross_vector[3]) {
      layout[index][0] = layout[index][0]+layout[index][2]*2;
      layout[index][1] =layout[index][1]- layout[index][3]*0.8;
    }
    if (cross_vector[0] || cross_vector[1] || cross_vector[2] || cross_vector[3]){
         update = true;
         chart.updateTable(index+1,{x:layout[index][0], y:layout[index][1], width:layout[index][2], height:layout[index][3]})
        }
    }
    
    // do nothing
  }


  const getObjectPoints = (object) =>{
    return [
      [object[0],object[1]],
      [object[0]+object[2],object[1]],
      [object[0]+object[2],object[1]+object[3]],
      [object[0],object[1]+object[3]]];
  }

  const checkCrossPoints = (sp, dp) => {
      let cross_vector = [false,false,false,false];
      let cross_vector_state = [false,false,false,false];
      for (let i = 0; i < sp.length; i++) {
        cross_vector_state = [false,false,false,false];
        for (let j = 0; j < dp.length; j++) {
          if (j == 0){
              if(dp[j][0] <= sp[i][0] && dp[j][1] <= sp[i][1]){
                cross_vector_state[0] = true;
              } else {
                cross_vector_state[0] = false;
              }
          }
          if (j == 1){
              if(dp[j][0] >= sp[i][0] && dp[j][1] <= sp[i][1]){
                cross_vector_state[1] = true;
              }else {
                cross_vector_state[1] = false;
              }
          }
          if (j == 2){
              if(dp[j][0] >= sp[i][0] && dp[j][1] >= sp[i][1]){
                cross_vector_state[2] = true;
              } else {
                cross_vector_state[2] = false;
              }
          }
          if (j == 3){
              if(dp[j][0] <= sp[i][0] && dp[j][1] >= sp[i][1] ){
                cross_vector_state[3] = true;
              } else {
                cross_vector_state[3] = false;
              }
          }
        }
        
        cross_vector[i] = cross_vector_state[0] && cross_vector_state[1] && cross_vector_state[2] && cross_vector_state[3];
      }
      return cross_vector;
  }

  function getBounds(bounds, objects,isRef = false){
    for (let item in objects){
        if (objects[item].x < bounds.l) {
           bounds.l = objects[item].x
        }
        if (objects[item].y < bounds.t) {
          bounds.t = objects[item].y
        }
        if (!isRef){
          if (objects[item].x+objects[item].width > bounds.r) {
          bounds.r = objects[item].x+objects[item].width 
          }
          if (objects[item].y+objects[item].height > bounds.b) {
            bounds.b = objects[item].y+objects[item].height 
          }
        }
       
    }
    return bounds;
}

  const applyScaleToFit = () => {
    let bounds = getBounds({l:0, r:0, t:0, b:0},chart.getTables);
    let zoom = chart.getZoom;
    startPan.value = {
      pan: {
        x: zoom*((bounds.r+bounds.l)/2),
        y: zoom*((bounds.t+bounds.b)/2)
      },
      diagram:{
        width:0,
        height:0
      }
    }
    startPan.value = {
      pan:{
        x:startPan.value.pan.x,
        y:startPan.value.pan.y
      },
      diagram:{
        width:Math.abs(bounds.r)+Math.abs(bounds.l),
        height:Math.abs(bounds.t)+Math.abs(bounds.b)
      }
    
    }
    chart.updatePan(startPan.value)
    // do nothing
  }


</script>

<style scoped lang="scss">
  .dbml-graph, .db-chart {
    height: 100% !important;
    width: 100% !important;
  }

  .dbml-graph-wrapper {
    height: 100% !important;
    width: 100% !important;
    position: relative;
  }

  .dbml-toolbar-wrapper {
    width: 600px;
    align-self: center;
    position: absolute;
    bottom: 1rem;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
  }

  .dbml-structure-wrapper {
    width: 400px;
    max-height: 300px;
    height: 300px;
    align-self: start;
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    margin-right: auto;

    > .q-card {
      max-height: 300px;
      overflow: auto;
    }
  }
</style>
