<template>
  <q-card-section style="padding: 8px 8px;">
    <div class="text-subtitle2">{{ table.name }}</div>
  </q-card-section>
  <q-separator />
  <q-card-section v-if="table.note || table.alias">
    <div v-if="table.note">Note: {{ table.note }}</div>
    <div v-if="table.alias">Alias: {{ table.alias }}</div>
  </q-card-section>
  <q-card-section v-if="table.indexes.length > 0">
    <div class="text-caption"><b>Indexes</b></div>
    <q-list>
      <div v-for="index of table.indexes" class="db-tip-highlights">
        <div v-if="index.name || index.type">
          <span v-if="index.name">{{index.name}} </span>
          <span v-if="index.type" class="enum-value_name">:[{{index.type}}]</span>
        </div>
        
        
        <div v-if="index.pk || index.unique" class="db-tip-highlights">
          <span class="enum-class">ID: </span>
          <span v-if="index.id">{{ index.id }}</span>
          <span class="enum-class"> spec: </span>
          <span v-if="index.pk">PK</span>
          <span v-if="index.pk && index.unique">|</span>
          <span v-if="index.unique">UNIQUE</span>
        </div>
        <div class="db-tip-highlights">
          <span class="enum-class">columns: </span>
          <span v-for="col in index.columns">
            <span :class="{
              'enum-type':col.type == 'expression',
              'general-type':col.type == 'column',
            }">{{ col.value }}</span>{{ col == index.columns[index.columns.length-1] ? "" : ', ' }}
          </span>
        </div>
        
        <div v-if="index.note" class="db-tip-highlights">
          <span class="enum-class">note: </span>
          <span>{{ index.note }}</span>
        </div>
    </div>
    
    </q-list>
  </q-card-section>
  
</template>

<script setup>

  const props = defineProps({
    table: Object,
  });

</script>

