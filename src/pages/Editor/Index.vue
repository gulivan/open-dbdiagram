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
        
    };
  onMounted(()=>{
    
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
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
