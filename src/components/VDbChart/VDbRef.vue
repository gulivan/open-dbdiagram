<template>
  <g
    ref="root"
    :id="`ref-${id}`"
    :class="{
      'db-ref':true,
      'db-ref__highlight': highlight
    }"
    @mouseenter.passive="onMouseEnter"
    @mouseleave.passive="onMouseLeave"
  >
    <path
      class="db-ref__hitbox"
      :d="path"
    />
    <path
      class="db-ref__path"
      :d="path"
    />

    <text :class="{
      'db-field__type':true,
      'db-ref__many-ref':labels.start.ismany,
    }"
          :x="labels.start.pos.x"
          :y="labels.start.pos.y">
      {{ labels.start.rel }}
    </text>

    <text :class="{
      'db-field__type':true,
      'db-ref__many-ref':labels.end.ismany,
    }"
          :x="labels.end.pos.x"
          :y="labels.end.pos.y">
      {{ labels.end.rel }}
    </text>

    <g class="db-ref__control-points">
      <circle v-for="(v,i) of controlPoints"
              :key="i"
              :cx="v.x"
              :cy="v.y"
              :class="{
                'db-ref__control-point': true,
                'db-ref__control-point__highlight': i === controlPoint_highlighted,
                'db-ref__control-point__dragging': i === controlPoint_dragging,
              }"
              :data-id="i"
              @dblclick.passive="controlPoint_onDblClick"
              @mousedown.passive="controlPoint_startDrag"
              @mouseenter.passive="controlPoint_onMouseEnter"
              @mouseleave.passive="controlPoint_onMouseLeave"
              @contextmenu.prevent="showTooltip"
      />
    </g>

  </g>
</template>

<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, reactive, ref, watch, watchEffect } from 'vue'
  import { useChartStore } from '../../store/chart'
  import { snap } from '../../utils/MathUtil'
  import VDbRefActions from './VDbRefActions.vue'

  const props = defineProps({
    id: Number,
    name: String,
    endpoints: Array,
    onUpdate: [String, Object, undefined],
    onDelete: [String, Object, undefined],
    schema: Object,
    dbState: Object,
    database: Object,
    token: Object,
    containerRef: Object
  })

  const emit = defineEmits([
    'click:ref',
  ])
  const store = useChartStore()
  let s = store.getRef(props.id)

  const gridSize = store.subGridSize
  const gridSnap = store.grid.snap

  const highlight = ref(false)
  const affectedTables = ref([])
  const d = ref('')

  const getPositionAnchors = (endpoint) => {
    const s = store.getTable(endpoint.fields[0].table.id)
    const fieldIndex = endpoint.fields[0].table.fields.findIndex(f => f.id === endpoint.fields[0].id)

    return [
      {
        x: s.x,
        y: s.y + 35 + (30 * fieldIndex) + (30 / 2.0)
      },
      {
        x: s.x + s.width,
        y: s.y + 35 + (30 * fieldIndex) + (30 / 2.0)
      }
    ]
  }

  const getClosestAnchor = (point, anchors) => {
    const withDistances = anchors.map(a => ({
        distanceXY: {
          x: (a.x - point.x),
          y: (a.y - point.y)
        },
        distance: Math.sqrt(
          ((a.x - point.x) * (a.x - point.x))
          + ((a.y - point.y) * (a.y - point.y))
        ),
        anchor: a
      })
    )

    let smallest = withDistances[0]
    for (const withDistance of withDistances) {
      if (withDistance.distance < smallest.distance) {
        smallest = withDistance
      }
    }

    return smallest.anchor
  }

  const getClosest = (anchorsA, anchorsB) => {
    const withDistances = anchorsA.flatMap(a => anchorsB.map(b => ({
        distanceXY: {
          x: (a.x - b.x),
          y: (a.y - b.y)
        },
        distance: Math.sqrt(
          ((a.x - b.x) * (a.x - b.x))
          + ((a.y - b.y) * (a.y - b.y))
        ),
        a: a,
        b: b
      })
    ))
    let smallest = withDistances[0]
    for (const withDistance of withDistances) {
      if (withDistance.distance < smallest.distance) {
        smallest = withDistance
      }
    }

    return [smallest.a, smallest.b]
  }

  const startAnchors = computed(() => {
    console.log("start anchor",props.endpoints[0])
    return getPositionAnchors(props.endpoints[0])
  })
  const endAnchors = computed(() => {
 
    return getPositionAnchors(props.endpoints[1])
  })

  const controlPoints = computed(() => {
    if (!s.vertices.length || s.vertices.some(v => Number.isNaN(v.x) || Number.isNaN(v.y))) {
      updateControlPoints()
    }
    if (!s.vertices.length || s.vertices.some(v => Number.isNaN(v.x) || Number.isNaN(v.y))) {
      return []
    }
    return s.vertices
  })



  const getDirection = (start, end) => {
      let directions = {
    l: false,
    r:false,
  };
      let middleStart = {};
      let middleEnd = {};
      if (start.length){
        middleStart = {x: (start[0].x + start[1].x)/2, y: (start[0].y + start[1].y)/2};
      } else {
        middleStart = start;
      }
      if (end.length){
        middleEnd = {x: (end[0].x + end[1].x)/2, y: (end[0].y + end[1].y)/2};
      } else {
        middleEnd = end;
      }
         
      let degree = Math.atan2(middleStart.y -middleEnd.y,middleStart.x - middleEnd.x)*57.2958;
      
      directions.l = Math.abs(degree) < 10 || Math.abs(degree) < 45;
      directions.r = Math.abs(degree) > 170 || Math.abs(degree) > 135;
      directions.t = degree > 0 && Math.abs(degree) > 45 && Math.abs(degree) < 135;
      directions.b = degree < 0 && Math.abs(degree) > 45 && Math.abs(degree) < 135;
    return directions;
  }


  const labels = computed(()=>{
  
    let pos = getClosest(startAnchors.value,endAnchors.value);
    const directions = getDirection(startAnchors.value,endAnchors.value);
    const cpstart_direction = getDirection(startAnchors.value,controlPoints.value[0]);
    const cpend_direction = getDirection(endAnchors.value,controlPoints.value[1]);
    //console.log('direction',directions);
    let corelations = {
      x0: 0, 
      y0: 0,
      x1: 0, 
      y1: 0,
    }
    if (cpstart_direction.l){
      corelations.x0 = -5;
      corelations.y0 = -10;
      pos[0] = startAnchors.value[0];
    }
    if (cpstart_direction.r){
      corelations.x0 = 30;
      corelations.y0 = -10;
      pos[0] = startAnchors.value[1];
    }
    if (cpend_direction.l){
      corelations.x1 = -5;
      corelations.y1 = -10;
      pos[1] = endAnchors.value[0];
    }
    if (cpend_direction.r){
      corelations.x1 = 30;
      corelations.y1 = -10;
      pos[1] = endAnchors.value[1];
    }

    return {
      start: {
        pos: {x: pos[0].x+corelations.x0, y: pos[0].y+corelations.y0},
        rel: props.endpoints[0].relation,
        ismany: props.endpoints[0].relation == '*'
      },
      end: {
        pos: {x: pos[1].x+corelations.x1, y: pos[1].y+corelations.y1},
        rel: props.endpoints[1].relation,
        ismany: props.endpoints[1].relation == '*'
      }
    }
  })


  const updateControlPoints = () => {
    const startElAnchors = startAnchors.value
    const endElAnchors = endAnchors.value

    if (!s.vertices.length || s.vertices.some(v => Number.isNaN(v.x) || Number.isNaN(v.y))) {
      s.auto = true
    } else if (!s.auto) {
      return
    }

    const [start, end] = getClosest(startElAnchors, endElAnchors)
    console.log('updateControlPoints', start, end, startElAnchors, endElAnchors)

    const minX = Math.min(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxX = Math.max(start.x, end.x)
    const maxY = Math.max(start.y, end.y)
    const midX = (minX + (((maxX - minX) || 2) / 2))
    const midY = (minY + (((maxY - minY) || 2) / 2))
    const mid = {
      x: midX,
      y: midY
    }

    s.vertices = [
      {
        x: mid.x,
        y: start.y
      },
      {
        x: mid.x,
        y: end.y
      }
    ]
  }

  const path = computed(() => {
    const startElAnchors = startAnchors.value
    const endElAnchors = endAnchors.value

    const points = s.vertices
    if (points.length == 0 || points.some(p => Number.isNaN(p.x) || Number.isNaN(p.y))) return ``
    const start = getClosestAnchor(points[0], startElAnchors)
    const end = getClosestAnchor(points[points.length - 1], endElAnchors)

    return `M ${start.x},${start.y} L ${points.map(p => (`${p.x},${p.y}`)).join(' ')} L ${end.x} ${end.y}`
  })

  const onMouseEnter = (e) => {
    highlight.value = true
  }
  const onMouseLeave = (e) => {
    highlight.value = false
  }

  const controlPoint_highlighted = ref(null)
  const controlPoint_dragging = ref(null)
  const controlPoint_dragOffset = reactive({
    x: 0,
    y: 0
  })

  const controlPoint_onMouseEnter = ({ target }) => {
    const controlPointId = Number(target.getAttribute('data-id'))
    controlPoint_highlighted.value = controlPointId
  }
  const controlPoint_onMouseLeave = ({ target }) => {
    controlPoint_highlighted.value = null
    controlPoint_highlighted.value = null
  }
  const controlPoint_startDrag = ({
    target,
    offsetX,
    offsetY
  }) => {
    const controlPointId = Number(target.getAttribute('data-id'))
    const v = s.vertices[controlPointId]

    controlPoint_dragging.value = controlPointId

    const p = store.inverseCtm.transformPoint({
      x: offsetX,
      y: offsetY
    })

    controlPoint_dragOffset.x = p.x - v.x
    controlPoint_dragOffset.y = p.y - v.y
    props.containerRef.addEventListener('mousemove', controlPoint_drag, { passive: true })
    props.containerRef.addEventListener('mouseup', controlPoint_drop, { passive: true })
    props.containerRef.addEventListener('mouseleave', controlPoint_onMouseLeave, { passive: true })
  }
  const controlPoint_drag = ({
    target,
    offsetX,
    offsetY
  }) => {
    const p = store.inverseCtm.transformPoint({
      x: offsetX,
      y: offsetY
    })
    const controlPointId = controlPoint_dragging.value
    if (s.auto) {
      s.auto = false
    }

    const v = s.vertices[controlPointId]
    v.x = snap((p.x - controlPoint_dragOffset.x), gridSnap)
    v.y = snap((p.y - controlPoint_dragOffset.y), gridSnap)

  }

  const showTooltip = (e) => {
    const p = store.inverseCtm.transformPoint({
      x: e.offsetX,
      y: e.offsetY
    })
    const tooltipPosition = {
      x: p.x + 10,
      y: p.y,
    }
   // console.log(e.target)
   store.showRefPanel(tooltipPosition, VDbRefActions, {click:p, wpid:e.target.dataset.id, data:props})
   emit('click:ref', e, s);
    
  }

  const controlPoint_drop = (e) => {
    controlPoint_dragOffset.x = 0
    controlPoint_dragOffset.y = 0
    controlPoint_dragging.value = null
    controlPoint_highlighted.value = null

    props.containerRef.removeEventListener('mousemove', controlPoint_drag, { passive: true })
    props.containerRef.removeEventListener('mouseup', controlPoint_drop, { passive: true })
    props.containerRef.removeEventListener('mouseleave', controlPoint_onMouseLeave, { passive: true })
  }

  const controlPoint_onDblClick = ({target}) => {
    s.auto = true;
    updateControlPoints()
  }

  onMounted(() => {
    affectedTables.value = props.endpoints.map(e => store.getTable(e.fields[0].table.id))
    nextTick(() => {
      updateControlPoints()
    })
  })

  watch(() => props.id, (newId) => {
    s = store.getRef(newId)
  })

  watch(props.endpoints, () => {
    affectedTables.value = props.endpoints.map(e => store.getTable(e.fields[0].table.id))
  }, {
    deep: true
  })

  watch(affectedTables, () => {
    updateControlPoints()
  }, {
    deep: true
  })
</script>
