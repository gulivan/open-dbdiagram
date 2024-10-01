import { defineStore } from "pinia";
import { markRaw } from "vue";
import * as S3 from 'aws-sdk/clients/s3';

import localforage from "localforage";
import { useFilesStore } from "./files";
import { Notify, colors } from "quasar";

const fs = localforage.createInstance({
  name: "dbdiagram-oss",
  storeName: "repo"
});
const filesfs = localforage.createInstance({
    name: "dbdiagram-oss",
    storeName: "files"
  });


export const useRepoStore = defineStore("repo", {
  state: () => ({
    host : "",
    bucket: "",
    path: "",
    region:"",
    access_key: "",
    secret_key: "",
    files : []
    
    }
  ),
  getters: {
    getHost(state){
        return state.host;
    },
    getBucket(state){
        return state.bucket;
    },
    getPath(state){
        return state.path;
    },
    getFolders(state){
        let flds = state.path.split(',');
        flds.map(v=>v.trim())
        return flds;
    },
    getAccessKey(state){
        return state.access_key;
    },
    getSecretKey(state){
        return state.secret_key;
    },
    getFiles(state){
        return state.files;
    },
    
    save(state) {
      return {
        host: state.host,
        bucket: state.bucket,
        region:state.region,
        path:state.path,
        access_key: state.access_key,
        secret_key: state.secret_key,
      };
    }
  },
  actions: {
    loadRepoConfig(){
        
        fs.getItem("cfg").then((val) => {
            if (val){
                this.load(JSON.parse(val));
            }
        }
        );
       
    },
    load(data) {
        this.$patch({
            host : data.host,
            bucket : data.bucket,
            region: data.region,
            path : data.path,
            access_key : data.access_key,
            secret_key : data.secret_key,
        })
          
        
      },
      saveLoadedFiles(err,data){
        console.log(data);
        if (err) {
            Notify.create({
                caption:"Repository",
                message:err.code+': '+err.message,
                color: 'red',
                icon: 'warning',
                position: 'bottom-right'
            })
        } else {
            var files = data.Contents;
            if (files.length > 0) {
                var all_files = [];
                var folders = this.path.split(',');
                folders.forEach(v=>v.trim())
                files.forEach((val)=>{
                    const k = String(val.Key).substring(0,String(val.Key).indexOf('/'));
                    if (folders.includes(k) && String(val.Key).endsWith(".json")){
                        all_files.push(val.Key);
                    }
                });
                if (all_files.length > 0){
                    this.$patch({
                        files: all_files
                    });
                } else {
                    Notify.create({
                        caption:"Repository",
                        message:"Path is empty. Files not found",
                        color: 'red',
                        icon: 'warning',
                        position: 'bottom-right'
                    })
                }
                
            } else {
                Notify.create({
                    caption:"Repository",
                    message:"Files not found",
                    color: 'red',
                    icon: 'warning',
                    position: 'bottom-right'
                })
            }
            
        }
       
      },

      loadRepoFiles(){
        this.getClient().listObjects({
            Bucket:this.bucket, 
        },this.saveLoadedFiles)

      },
     getRepoFiles(){
        if (!this.checkSettings(false)) {
            return;
        }
       this.loadRepoFiles();
    
        
    },
    saveRepoConfig(){
        fs.setItem("cfg",JSON.stringify(this.save)).then(()=>{
            console.log('repo config saved')
        });
    },
    
    async loadFromRepo(file){
        const fstore = useFilesStore();
        console.log(file);
        if (!this.checkSettings()) {
            return;
        }
        await this.getClient().getObject({
            Key:file,
            Bucket:this.bucket,
        }).promise().then((result)=> {
            console.log(result)
            var data = result.Body.toString('utf-8')
            filesfs.setItem(file,JSON.parse(data)).then(
                ()=>{
                    fstore.loadFile(file);
                    Notify.create({
                        caption:"Repository",
                        message:"File successfully downloaded",
                        color: 'green',
                        icon: 'cloud_download',
                        position: "bottom-right"
                    })
                }
            );
            
        });
       
        
    },

    sendInRepo(folder){
        if (folder == undefined) {
            folder = this.getFolders()[0]
        }
        const fstore = useFilesStore();
        var key = fstore.getCurrentFile;
        
        
        if (!key.startsWith(folder)){
            if (key.indexOf('/') > -1) {
                key = folder + key.substring(key.indexOf('/'),key.length)
            } else {
                key = folder +'/'+key+'.json';
            }
            
        } 
        console.log(key);
        var parts = [];
        fstore.saveFile(fstore.getCurrentFile);
        parts.push(JSON.stringify(filesfs.getItem(fstore.getCurrentFile)));
      
        filesfs.getItem(fstore.getCurrentFile).then(
            (file) => {
               var data = new Blob([JSON.stringify(file)]);
               this.getClient().putObject({
                Bucket:this.bucket,
                Key:key,
                Body: data,
            },this.sendInRepoCallback);
            }
        )
        
        fstore.renameFile(key);
       
        
    },
    sendInRepoCallback(err,data){
        console.log(err,data);
        if (err) {
            Notify.create({
                caption:"Repository",
                message:err.code+': '+err.message,
                multiLine:true,
                color: 'red',
                icon: 'warning',
                position: "bottom-right"
            })

        } else {
        Notify.create({
            caption:"Repository",
            message:"File successfully uploaded",
            color: 'green',
            icon: 'cloud_upload',
            position: "bottom-right"
        })
    }
    },

    checkSettings(showNotication = true){
        let settingsFlags = [true, true, true, true, true];
        let errors = [];
        let settings = ["host", "bucket", "region","access_key", "secret_key"]
        
        for (let i = 0; i < settings.length; i++){
            if (this[settings[i]] == ''){
                errors.push(`${settings[i]} is empty`);
                settingsFlags[i] = false;
            }
        }
        if (settingsFlags.every((flag)=>flag)){
            if (showNotication){
                Notify.create({
                    caption:"Repository",
                    multiLine: true,
                    message:'All repository settings are set',
                    color: 'green',
                    icon: 'done_all',
                    position:"bottom-right"
                })
            }
            
            return true;
        } else {
            if (showNotication){
                Notify.create({
                    caption:"Repository",
                    multiLine: true,
                    message:'Some repository parameters are not set: '+ errors.join(","),
                    color: 'red',
                    icon: 'warning',
                    position:"bottom-right"
                })
            }
            
            return false;
        }
        
    },
    

    getClient(){ 
        var s3client = new S3({
            apiVersion: 'latest',
            region:this.region,
            endpoint: `${this.host}`,
            
            credentials: {
                accessKeyId: this.access_key,
                secretAccessKey: this.secret_key,
            },
        });
        return s3client;
        
    }
  }
});
