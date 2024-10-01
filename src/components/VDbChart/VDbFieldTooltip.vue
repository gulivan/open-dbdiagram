<template>
  <q-card-section style="padding: 8px 8px;">
    <div class="text-subtitle2 db-tip-highlights">{{ field.name }} 
    <span :class="{
      'enum-type':field._enum,
      'general-type':!field._enum,
      
    }">{{ field.type.type_name }}
    </span>
  </div>
  </q-card-section>
  <q-separator />
  <q-card-section>
    <div v-if="field.note">Note: {{ field.note }}</div>
    <div v-if="field._enum"  class="db-tip-highlights">
      <span class="enum-class">ENUM </span> 
      <span class="enum-type">{{ field._enum.name }}:</span> 
    </div>
    <div v-if="field._enum" class="db-tip-highlights">
      <div v-for="index of field._enum.values">
        <div class="enum-value"> 
          <span class="enum-value_tab">* </span>
          <span class="enum-value_name">{{ index.name }}</span>
          <span v-if="index.note" class="enum-value_note"> [<i>{{ index.note }}</i>]</span>
        </div>
      </div>
    </div>
    <div v-if="field.dbdefault"  class="db-tip-highlights">
      <span class="enum-class">DEFAULT </span> 
      <span class="enum-type">{{ field.dbdefault.value }}</span> 
    </div>
    <div v-if="field.increment"  class="db-tip-highlights">
      <span class="enum-class">INCREMENT</span> 
    </div>
  </q-card-section>
  
</template>

<script setup>
  
  const props = defineProps({
    field: Object,
  });

</script>

