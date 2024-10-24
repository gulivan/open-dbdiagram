<template>
  <svg
    ref="root"
    :id="`table-${id}`"
    :class="{
      'db-table':true,
      'db-table__highlight': highlight,
      'db-table__dragging': dragging
    }"
    :x="state.x"
    :y="state.y"
    :width="state.width"
    :height="state.height"
    @mouseenter.passive="onMouseEnter"
    @mouseleave.passive="onMouseLeave"
  >
    <rect class="db-table__background"
          :width="state.width"
          :height="state.height"
    />
    <g class="db-table-header"
       @mousedown.passive="startDrag"
       v-touch-hold="showTooltip"
       v-on:touchend="hideTooltip"
       @mouseenter.passive="showTooltip"
       @mouseleave.passive="hideTooltip"
     
    >
      <rect
        height="35"
        :width="state.width"
        :fill="headerColor == '' ? customColor : headerColor"
        
      />
      <text class="db-table-header__name" y="16">
       {{ useSchema ? schema.name+'.' : "" }}{{ name }}
      </text>
      <g class="db-table-header__color-icon" v-show="palette_icon" @click.passive="onHeaderClick" @touchend.passive="onHeaderClick">
      <rect class="db-table-header__icon-bg" :fill="headerColor == '' ? customColor : headerColor" :x="state.width-25" y="0" height="35" width="20" />
      <svg class="db-table-header__icon" xmlns="http://www.w3.org/2000/svg" :x="state.width-25" y="8" height="20" viewBox="0 -960 960 960" width="20">
        <path  d="m247-904 57-56 343 343q23 23 23 57t-23 57L457-313q-23 23-57 23t-57-23L153-503q-23-23-23-57t23-57l190-191-96-96Zm153 153L209-560h382L400-751Zm360 471q-33 0-56.5-23.5T680-360q0-21 12.5-45t27.5-45q9-12 19-25t21-25q11 12 21 25t19 25q15 21 27.5 45t12.5 45q0 33-23.5 56.5T760-280ZM80 0v-160h800V0H80Z"/>
      </svg>
      </g>
    </g>
    <g class="db-table-fields">
      <v-db-field v-for="field of fields"
                  v-bind="field"
                  :indexPk="checkIndexPK(field)"
                  :key="field.id"
                  :width="state.width"
                  @click.passive="onFieldClick($event, field)"
      />
    </g>
  </svg>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import VDbField from './VDbField'
  import VDbTableTooltip from './VDbTableTooltip'
  import { useChartStore } from '../../store/chart'
  import { snap } from '../../utils/MathUtil'
  import { useEditorStore } from '../../store/editor'
  import VDbHeadColorTip from './VDbHeadColorTip.vue'
  import { debounce } from 'quasar'

  const props = defineProps({
    id: Number,
    selection: String,
    token: Object,
    group: Object,
    name: String,
    alias: String,
    note: String,
    indexes: Array,
    schema: Object,
    headerColor: {
      type: String,
      default: () => ('')
    },
    dbState: Object,
    fields: {
      type: Array,
      default: () => ([])
    },
    containerRef: Object,
    useSchema:{
      type:Boolean,
      default: ()=>{false}
    }
  })

  const editor = useEditorStore()
  const store = useChartStore()

  const state = computed(() => store.getTable(props.id))
  const customColor = computed(() => store.getTableColor(props.name, props.id,props.schema.name).color)

  const root = ref(null)

  const updateWidth = () => {
    if(!root.value) return;
    const fieldEls = [...root.value.querySelectorAll('.db-field')];
    const maxFieldWidth = fieldEls.map(f => [...f.querySelectorAll('text')].map(ft => ft.getComputedTextLength())
      .reduce((prev,curr) => prev + curr, 3*16))
      .reduce((prev,curr) => Math.max(prev, curr), 0);
    const tableNameWidth = root.value.querySelectorAll('.db-table-header__name')[0].getComputedTextLength()*(0.08*16);
    const maxWidth = Math.max(maxFieldWidth, tableNameWidth);
    state.value.width = snap(Math.max(200, maxWidth), gridSnap)+20;
    
  }

  const updateHeight = () => {
    state.value.height = 35 + (30 * props.fields.length);
    
  }

  const checkIndexPK = (field) => {
    return props.indexes.filter((x)=> x.columns.filter((y)=> y.type == 'column' && y.value == field.name).length > 0 && x.pk).length > 0
  }

  watch(() => props.useSchema, value => {
    updateWidth();
    store.updateTable(props.id,state.value)
  });
  
  watch(() => props.name, value => {
    updateWidth();
    store.updateTable(props.id,state.value)
  });

  watch(() => props.fields, value => {
    updateHeight();
    updateWidth();
    store.updateTable(props.id,state.value)
  });

  onMounted(() => {
    updateHeight();
    updateWidth();
    store.updateTable(props.id,state.value)
  })

  const emit = defineEmits([
    'update:position',
    'click:header',
    'click:field'
  ])


  const tooltipSize = computed(() => ({
    width: 200,
    height: 35 + (30 * props.fields.length)
  }))

  const highlight = ref(false)
  const palette_icon = ref(false)
  const tooltip = ref(false)
  const dragging = ref(false)
  const dragOffsetX = ref(null)
  const dragOffsetY = ref(null)
  const dragOffset = ref(null)
  const gridSize = store.subGridSize;
  const gridSnap = store.grid.snap;

  const onMouseEnter = (e) => {
    highlight.value = true
  }
  const onMouseLeave = (e) => {
    highlight.value = false
    dragging.value = false
  }

  const drag = ({
    offsetX,
    offsetY
  }) => {
    const p = store.inverseCtm.transformPoint({
      x: offsetX,
      y: offsetY
    })
    state.value.x = snap(p.x - dragOffsetX.value, gridSnap)
    state.value.y = snap(p.y - dragOffsetY.value, gridSnap)
    emit('update:position', state.value)
    
  }
  const drop = (e) => {
    dragging.value = false
    highlight.value = false

    dragOffsetX.value = null
    dragOffsetY.value = null
    props.containerRef.removeEventListener('mousemove', drag, { passive: true })
    props.containerRef.removeEventListener('mouseup', drop, { passive: true })
    props.containerRef.removeEventListener('mouseleave', onMouseLeave, { passive: true })
  }
  const startDrag = ({
    offsetX,
    offsetY
  }) => {
    dragging.value = true

    const p = store.inverseCtm.transformPoint({
      x: offsetX,
      y: offsetY
    })
    dragOffsetX.value = p.x - state.value.x
    dragOffsetY.value = p.y - state.value.y

    dragOffset.value = props.containerRef.createSVGPoint()
    props.containerRef.addEventListener('mousemove', drag, { passive: true })
    props.containerRef.addEventListener('mouseup', drop, { passive: true })
    props.containerRef.addEventListener('mouseleave', onMouseLeave, { passive: true })
  }

  const showTooltip = () => {
    palette_icon.value = true;
    const tooltipPosition = {
      x: state.value.x + state.value.width,
      y: state.value.y,
    }
    store.showTooltip(tooltipPosition, VDbTableTooltip, {
      table: props
    })
  }

  const showColorPanel = () => {
    
    const tooltipPosition = {
      x: state.value.x + state.value.width,
      y: state.value.y,
    }
    
    store.showPanel(tooltipPosition, VDbHeadColorTip, {
      table: props
    })
  }

  const hideTooltip = () => {
    palette_icon.value = false;
    store.hideTooltip();
  }
  function onHeaderClick (e) {
    showColorPanel();
    console.log('show panel', `header color >${props.headerColor}<`);
    emit('click:header', e, editor.findTable(props.id));
   
  }
  function onFieldClick (e, field) {
    emit('click:field', e, field);
  }

  const updatePosition = debounce((x, y) => {
    state.x = x
    state.y = y
  }, 16) // ~60fps

  watch(() => props.x, (newX) => {
    updatePosition(newX, state.y)
  })

  watch(() => props.y, (newY) => {
    updatePosition(state.x, newY)
  })
</script>

<style scoped>

</style>
