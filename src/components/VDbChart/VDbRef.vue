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
    
    // Calculate the direct path vector
    const dx = end.x - start.x
    const dy = end.y - start.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Create a single curve by offsetting control points perpendicular to the path
    const offset = Math.min(distance * 0.2, 50) // Limit maximum curve
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2

    s.vertices = [
      {
        x: midX,
        y: midY - offset
      },
      {
        x: midX,
        y: midY - offset
      }
    ]
  }

  const path = computed(() => {
    const startElAnchors = startAnchors.value
    const endElAnchors = endAnchors.value
    
    const [start, end] = getClosest(startElAnchors, endElAnchors)
    
    const controlPoint1 = { x: (start.x + end.x) / 2, y: start.y }
    const controlPoint2 = { x: (start.x + end.x) / 2, y: end.y }

    let pathData = `M ${start.x},${start.y} `
    pathData += `L ${start.x - 10},${start.y} `
    pathData += `M ${start.x},${start.y - 5} `
    pathData += `L ${start.x - 10},${start.y} `
    pathData += `M ${start.x},${start.y + 5} `
    pathData += `L ${start.x - 10},${start.y} `
    pathData += `C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${end.x},${end.y}`

    return pathData
  })

  const onMouseEnter = (e) => {
    highlight.value = true
  }
  const onMouseLeave = (e) => {
    highlight.value = false
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








