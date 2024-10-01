<template>
  <div class="q-gutter-y-lg">
    <div class="q-gutter-y-md">
      <div class="text-subtitle1">Grid</div>
      <div class="row q-col-gutter-x-sm">
        <q-input class="col-md-4 col-lg-3"
                 v-model.number="store.grid.size"
                 type="number"
                 stack-label
                 :label="`Grid Size`"
        />
        <q-input class="col-md-3 col-lg-2 col-xl-2"
                 v-model.number="store.grid.divisions"
                 type="number"
                 stack-label
                 :label="`Divisions`"
        />
      </div>
      <div class="row q-col-gutter-x-sm">
        <q-input class="col-md-3 col-lg-2 col-xl-2"
                 v-model.number="store.grid.snap"
                 type="number"
                 stack-label
                 :label="`Snap`"
        />
      </div>
    </div>

    <q-separator/>

    <div>
      <div class="text-subtitle1">Repository (S3)     <q-btn class="q-ma-sm" color="purple" label="save" @click="()=>save()"  /></div>
      <div class="row q-col-gutter-md">
        <q-input class="col-md-4 col-lg-3"
                 v-model.trim="repo.host"
                 type="string"
                 stack-label
                 :label="`Host`"
        />
        <q-input class="col-md-4 col-lg-3"
                 v-model.trim="repo.bucket"
                 type="string"
                 stack-label
                 :label="`Bucket`"
        />
        <q-input class="col-md-4 col-lg-3"
                 v-model.trim="repo.path"
                 type="string"
                 stack-label
                 :label="`Comma-separated folders`"
        />
      </div>
      <div class="row q-col-gutter-x-md">
        <q-input class="col-md-4 col-lg-3"
                 v-model.trim="repo.region"
                 type="string"
                 stack-label
                 :label="`Region`"
        />
        <q-input class="col-md-4 col-lg-3"
                 v-model.trim="repo.access_key"
                 type="string"
                 stack-label
                 :label="`Access_key`"
        />
        <q-input class="col-md-4 col-lg-3"
                 v-model.trim="repo.secret_key"
                 type="string"
                 stack-label
                 :label="`Secret_key`"
        />
        
      </div>
  
    </div>

    <q-space/>
  </div>
</template>

<script setup>

  import { useChartStore } from '../../store/chart'
  import { useRepoStore } from '../../store/repo';

  const store = useChartStore();
  const repo = useRepoStore();

  repo.loadRepoConfig();

  function save(){
    if (repo.checkSettings()){
      repo.saveRepoConfig();
    }
  }

</script>
