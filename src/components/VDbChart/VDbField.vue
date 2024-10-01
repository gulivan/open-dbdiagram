<template>
  <svg
    ref="root"
    :id="`field-${id}`"
    :class="{
      'db-field':true,
      'db-field__highlight': highlight,
      'db-field__dragging': dragging,
      'db-field__pk': pk || props.indexPk,
      'db-field__unique': unique,
      'db-field__not_null': not_null,
      'db-field__increment': increment,
      'db-field__ref': endpoints.length > 0
    }"
    :x="position.x"
    :y="position.y"
    :width="size.width"
    :height="size.height"
    @mousedown.passive="onMouseDown"
    @mouseup.passive="onMouseUp"
    @mouseenter.passive="onMouseEnter"
    @mouseleave.passive="onMouseLeave"
  >
    <rect
      :height="size.height"
      :width="size.width"
    />
    <text class="db-field__name"
          :y="size.height/2">
      {{ name }}
    </text>
    <svg v-if="pk || props.indexPk" class="db-field__pk-icon" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16"
    :x="state.name_width+8"
          :y="size.height/4" >
      <path d="M280-400q-33 0-56.5-23.5T200-480q0-33 23.5-56.5T280-560q33 0 56.5 23.5T360-480q0 33-23.5 56.5T280-400Zm0 160q-100 0-170-70T40-480q0-100 70-170t170-70q67 0 121.5 33t86.5 87h352l120 120-180 180-80-60-80 60-85-60h-47q-32 54-86.5 87T280-240Zm0-80q56 0 98.5-34t56.5-86h125l58 41 82-61 71 55 75-75-40-40H435q-14-52-56.5-86T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Z"/>
    </svg>
    <svg v-if="_enum || note || dbdefault" xmlns="http://www.w3.org/2000/svg" class="db-field__note-icon" height="16" viewBox="0 -960 960 960" width="16" 
          :x="pk || props.indexPk ? state.name_width + 24 : state.name_width+8"
          :y="size.height/4">
	      <path d="M200-200h360v-200h200v-360H200v560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v400L600-120H200Zm80-280v-80h200v80H280Zm0-160v-80h400v80H280Zm-80 360v-560 560Z"/>
  </svg>
    <text class="db-field__type"
          :x="size.width - type_shift.main_shift"
          :y="size.height/2">
      {{ type.type_name }}
    </text>
    <rect v-if="_enum" class="db-field__type-ads-rect" 
            :x="size.width-type_shift.enum_rect_shift"
            y="2"
           height="18" width="9" rx="2"/>
    <text v-if="_enum" class="db-field__type-ads"
          :x="not_null ? size.width-22 : size.width"
          :y="size.height/2">E</text>
    <rect v-if="not_null" class="db-field__type-ads-rect" 
            :x="size.width-type_shift.nn_rect_shift"
            y="2"
           height="18" width="20" rx="2"/>
    <text v-if="not_null" class="db-field__type-ads"
          :x="size.width"
          :y="size.height/2">NN</text>
    <title>{{name}} ({{type.type_name}} {{_enum ? "is Enum" : null}})</title>
  </svg>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
import VDbFieldTooltip from './VDbFieldTooltip.vue';
import { useChartStore } from '../../store/chart';

  const props = defineProps({
    id: Number,
    selection: String,
    token: Object,
    name: String,
    type: Object,
    unique: Boolean,
    pk: Boolean,
    dbState: Object,
    not_null: Boolean,
    note: String,
    dbdefault: Object,
    increment: Boolean,
    width: Number,
    table: Object,
    endpoints: Array,
    _enum: Object,
    indexPk:Boolean
  })
  const root = ref(null)

  const store = useChartStore()

  const size = computed(() => ({
    width: props.width,
    height: 30
  }))

  const state = computed(()=>({
    name_width:(props.name.length*6)+16,
  }))

 const updateNameWidth = (value)=>{
    if (!root.value) return;
    state.value.name_width = value.length * 7
    state.value.name_width = state.value.name_width + 4
  };

  watch(() => props.name, value =>{
      updateNameWidth(value);
  });

  const type_shift = computed(()=>{
    let shift = 0;  
    let shift_rect_enum = 0;
    let shift_rect_nn = 0;
    if (props._enum){
      shift += 13;
      shift_rect_enum += 8;
    } 
    if (props.not_null){
      shift += 23;
      shift_rect_enum +=30;
      shift_rect_nn += 18;
    } 
    return {
      main_shift:shift,
      enum_rect_shift: shift_rect_enum,
      nn_rect_shift: shift_rect_nn
    } 
  });

  const position = computed(() => ({
    x: 0,
    y: 35 + (props.table.fields.findIndex(f => f.id === props.id) * 30)
  }))

  const showTooltip = () => {
    const table_pos = store.getTable(props.table.id);
    const tooltipPosition = {
      x: position.value.x + size.value.width+table_pos.x,
      y: position.value.y + table_pos.y,
    }
    
    store.showTooltip(tooltipPosition, VDbFieldTooltip, {
      field: props
    })
  }

  const mounted = onMounted(() => {
    // nothing so far
  })

  const highlight = ref(false)
  const dragging = ref(false)
  const onMouseEnter = (e) => {
    highlight.value = true
    if (props.note || props._enum || props.dbdefault) showTooltip();
  }
  const onMouseLeave = (e) => {
    highlight.value = false
    dragging.value = false
    store.hideTooltip();
  }
  const onMouseUp = (e) => {
    dragging.value = false
  }
  const onMouseDown = (e) => {
    dragging.value = true
  }

</script>
