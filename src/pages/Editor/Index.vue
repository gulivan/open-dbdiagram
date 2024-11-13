<template>
  <q-page>
    <q-splitter v-model="split"
                :limits="[10,75]"
                class="editor-wrapper">
      <template #before>
        <dbml-editor ref="editorRef"
                     class="db-code-editor"
                     v-model:source="sourceText"
        />
      </template>
      <template #after>
        <dbml-graph
          class="db-graph-view"
          :schema="schema"
        />
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import DbmlEditor from 'components/DbmlEditor'
  import DbmlGraph from 'components/DbmlGraph'
  import { useEditorStore } from 'src/store/editor'
  import { debounce, throttle, useQuasar } from 'quasar'

  const editorRef = ref(null)
  const editor = useEditorStore()
  const q = useQuasar()

  function touchHandler(event) {
    // Only handle single touch events
    if (event.touches.length === 1) {
      var touch = event.changedTouches[0];
      var simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
      }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);
      touch.target.dispatchEvent(simulatedEvent);
    }
  }

  // Add new handler for two-finger gestures
  function handleTwoFingerGesture(event) {
    if (event.touches.length === 2) {
      event.preventDefault();
      
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      // Calculate the midpoint between the two touches
      const midX = (touch1.clientX + touch2.clientX) / 2;
      const midY = (touch1.clientY + touch2.clientY) / 2;
      
      // Create a synthetic mouse event for panning
      const simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent(
        "mousemove", true, true, window, 0,
        0, 0, midX, midY,
        false, false, false, false, 0, null
      );
      
      // Dispatch the event for panning
      event.target.dispatchEvent(simulatedEvent);
    }
  }

  onMounted(() => {
    document.addEventListener("touchstart", touchHandler, { passive: false });
    document.addEventListener("touchmove", touchHandler, { passive: false });
    document.addEventListener("touchend", touchHandler, { passive: false });
    document.addEventListener("touchcancel", touchHandler, { passive: false });
    
    // Add listeners for two-finger gestures
    document.addEventListener("touchstart", handleTwoFingerGesture, { passive: false });
    document.addEventListener("touchmove", handleTwoFingerGesture, { passive: false });
  })

  const sourceText = computed({
    get: () => editor.getSourceText,
    set: (src) => editor.updateSourceText(src)
  })

  const preferences = computed({
    get: () => editor.getPreferences,
    set: (src) => editor.updatePreferences(src)
  })
  const split = computed({
    get: () => editor.getSplit,
    set: (src) => editor.updateSplit(src)
  })
  
  const schema = computed(() => {
    var single_schema = {
      tableGroups:[],
      tables:[],
      refs:[],
      schemes:[]
    }
    editor.getDatabase?.schemas?.forEach(x => {
      single_schema.schemes.push({
        id:x.id,
        name: x.name
      });
      single_schema.tableGroups = single_schema.tableGroups.concat(x.tableGroups);
      single_schema.tables = single_schema.tables.concat(x.tables);
      single_schema.refs = single_schema.refs.concat(x.refs);
    });

    return single_schema;
    })
</script>

<style scoped>
  .editor-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
