<template>
<q-dialog ref="dialogRef" @hide="onDialogHide">
<q-card class="q-dialog-plugin ace-preferences-dialog">
    <q-bar>
        <q-icon name="download"></q-icon>
        <h6 :style="{'margin':'10px'}">Export {{ props.id }}</h6>
    </q-bar>
    <q-card-section>
        <div class="q-gutter-y-lg">
            <q-input class="col-md-4 col-lg-3"
                 v-model="file_name"
                 type="string"
                 stack-label
                 :label="`File name`"
        />
        <q-input class="col-md-4 col-lg-3"
                 v-model="resolution"
                 type="number"
                 stack-label
                 :label="`PNG Resolution`"
                 v-if="props.id == 'png'"
        />
        </div>
    </q-card-section>

   
    <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" @click="onDialogCancel" />
        <q-btn flat color="primary" label="OK" @click="onOKClick" />
      </q-card-actions>
</q-card>
</q-dialog>
</template>

<script setup>
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { computed, defineProps,ref } from 'vue';
import { useFilesStore } from '../store/files';
import localforage from "localforage";
import { saveJson, savePng, saveSvg, saveDBSQL } from '../utils/exportUtil'
import { PresignedPost } from 'aws-sdk/clients/s3';
import { useChartStore } from '../store/chart';

const $q = useQuasar();

const chart = useChartStore();

const props = defineProps({
    id: {
      type: String,
      required: true
    },
    file_name:{
        type: String,
        required: true
    },
    
  })

  const file_name = ref(props.file_name)
  const resolution = ref(300)


  defineEmits([
    ...useDialogPluginComponent.emits
  ]);


  const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

  function onOKClick () {

    $q.notify({
      caption:"Export",
      message:`Saving file...`,
      multiLine:true,
      timeout:2000,
      color: 'indigo-7',
      spinner:true,
      position: "center"})
  
      saveFile();
    
      onDialogOK()
}

function saveFile(){
  const fstore = useFilesStore();
    const filesfs = localforage.createInstance({
    name: "dbdiagram-oss",
    storeName: "files"
  });
  
    if (props.id == 'json'){
       saveJson(props.file_name)       
    }
    if (props.id == 'svg'){
     saveSvg(props.file_name)
    }
    if (props.id == 'pg'){
      saveDBSQL(props.file_name,'postgres')       
    }
    if (props.id == 'mssql'){
      saveDBSQL(props.file_name,'mssql')
    }
    if (props.id == 'mysql'){
      saveDBSQL(props.file_name,'mysql')
    }
    if (props.id == 'dbml'){
      saveDBSQL(props.file_name,'dbml')
    }
  
    if (props.id == 'png'){
      savePng(props.file_name,resolution)        
    }  
      $q.notify({
                caption:"Export",
                message:`File ${file_name.value} successfully exported`,
                color: 'green',
                icon: 'task',
                position: 'bottom-right'
            })
}

</script>
