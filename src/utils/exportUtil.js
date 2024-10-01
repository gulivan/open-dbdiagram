import { useQuasar } from 'quasar';
import { useFilesStore } from '../store/files';
import localforage from "localforage";
import { useChartStore } from '../store/chart';


const $q = useQuasar();
const { exporter } = require('@dbml/core');
const fstore = useFilesStore();
    const filesfs = localforage.createInstance({
    name: "dbdiagram-oss",
    storeName: "files"
});
const chart = useChartStore();

export function saveJson(filename){
    filesfs.getItem(fstore.getCurrentFile).then(
        (file) => {
            saveAs(new Blob([JSON.stringify(file)], {type:"application/json"}),filename);
        }
    )
}

export function saveDBSQL(filename,format){
    filesfs.getItem(fstore.getCurrentFile).then(
        (file) => {
            const pgfl = exporter.export(file.source.text, format);
            if (format == 'dbml'){
                saveAs(new Blob([pgfl], {type:"text/plain"}),filename);
            } else {
                saveAs(new Blob([pgfl], {type:"text/plain"}),format+'_'+filename);
            }
            
        }
    )
}

export function saveSvg(filename) {
    let svg = saveFakeSvg();
       saveAs(new Blob([svg.svg.outerHTML.trim()]),filename);
}

export function savePng(filename,resolution) {
    let fake_svg = saveFakeSvg();
   
      var image = new Image();
      image.height = fake_svg.size.height;
      image.width = fake_svg.size.width;
      image.src = 'data:image/svg+xml;base64,'+ window.btoa(new XMLSerializer().serializeToString(fake_svg.svg));
      let scaleFactor = resolution.value/96;
      image.onload = function() {
        console.log('load image');
        var canvas = document.createElement('canvas');
        canvas.width = image.width * scaleFactor;
        canvas.height = image.height *scaleFactor;
        var context = canvas.getContext('2d');
        context.drawImage(image, 0,0);
        context.setTransform(scaleFactor,0,0,scaleFactor,0,0);
        var a = document.createElement('a');
        a.download = filename;
        a.href = canvas.toDataURL('image/png',1.0);
        document.body.appendChild(a);
        
         a.click();

        
      }
}

function saveAs(data,filename){
    const a = document.createElement("a");
  const file = data;
  const url = window.URL.createObjectURL(file);
  a.setAttribute('href',url);
  a.setAttribute('download',filename);
  a.click();
  URL.revokeObjectURL(url);
  setTimeout(()=>{
    document.removeChild(a);
  },1000)

}

function saveFakeSvg(){
    let container = document.createElement('div');
    let fake_svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      fake_svg.setAttribute('class',"db-chart db-chart__bg");
      fake_svg.setAttribute("version", "1.1");
      
      fake_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      fake_svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    
      //not good solution, but i'm lazy
      let bounds = getBounds({l:0, r:0, t:0, b:0},chart.getTables);
      bounds = getBounds(bounds, chart.getTableGroups);
      let chartRefs = chart.getRefs;
      console.log(chartRefs);
      for (let rf in chartRefs){
        
        if (chartRefs[rf].vertices.length > 0){
          bounds = getBounds(bounds, chartRefs[rf].vertices,true);
        }
      }
      let size = {
        width: Math.abs(bounds.l)+bounds.r+40,
        height:Math.abs(bounds.t)+bounds.b+40
      }
      fake_svg.setAttribute('viewBox',`${bounds.l-20} ${bounds.t-20} ${size.width}  ${size.height}`);
  
      var tablegroups = document.getElementById('tablegroups-layer');
      fake_svg.appendChild(tablegroups.cloneNode(true));
      var tables = document.getElementById('tables-layer');
      fake_svg.appendChild(tables.cloneNode(true));
      let color_icons = fake_svg.getElementById('tables-layer').getElementsByClassName('db-table-header__color-icon');
      while (color_icons.length > 0) {
        color_icons[0].parentNode.removeChild(color_icons[0]);
      }
      let note_icons = fake_svg.getElementById('tables-layer').getElementsByClassName('db-field__note-icon');
      while (note_icons.length > 0) {
        note_icons[0].parentNode.removeChild(note_icons[0]);
      }
      var refs = document.getElementById('refs-layer');
      fake_svg.appendChild(refs.cloneNode(true));
      let fake_refs = fake_svg.getElementById('refs-layer').children;
      for (let ref of fake_refs){
        ref.removeChild(ref.getElementsByClassName("db-ref__control-points")[0]);
      }
      
  
      container.appendChild(fake_svg);
      applyCSS(container, 
      ["fill", "font-family", "font-size","stroke","stroke-width",
      "stroke-linejoin", "stroke-opacity","stroke-linecap",
      "transform","text-anchor","font-weight","vertical-align"],
      ["background-color"])
  
    return { svg: fake_svg, size:size} ;
  }
  
  function getBounds(bounds, objects,isRef = false){
      for (let item in objects){
          if (objects[item].x < bounds.l) {
             bounds.l = objects[item].x
          }
          if (objects[item].y < bounds.t) {
            bounds.t = objects[item].y
          }
          if (!isRef){
            if (objects[item].x+objects[item].width > bounds.r) {
            bounds.r = objects[item].x+objects[item].width 
            }
            if (objects[item].y+objects[item].height > bounds.b) {
              bounds.b = objects[item].y+objects[item].height 
            }
          }
         
      }
      return bounds;
  }
  
  function applyCSS(root, copyProperties, inStylesProperties){
      let bodyStyles = window.getComputedStyle(document.body);
      let styleSheets = document.styleSheets;
      for (let s = 0; s < styleSheets.length; s++){
        let rules = styleSheets[s].cssRules;
        for (let r = 0; r < rules.length; r++){
            let rule = rules[r];
            if (typeof(rule.style) != "undefined"){
              let objects = root.querySelectorAll(rule.selectorText);
              
              if (objects.length > 0){
                  for (let item of objects){
                    if (rule.style.length > 0){
                        for (let rs = 0; rs < rule.style.length; rs++){
                            if (copyProperties.some((x)=> x === rule.style[rs])){
                                let value = getCSSVariable(rule.style[rule.style[rs]],bodyStyles);
                                if (value == null){
                                   value = rule.style[rule.style[rs]];
                                }
                                if (rule.style[rs] == "transform"){
                                  value = transformCSStoSVG(value);
                                }
                                                              
                                item.setAttribute(rule.style[rs],value);
                            }
                            if (inStylesProperties.some((x)=> x === rule.style[rs])){
                                let value = getCSSVariable(rule.style[rule.style[rs]],bodyStyles);
                                if (value == null){
                                   value = rule.style[rule.style[rs]];
                                }
                                let stl = item.getAttribute('style')
                                if (stl != null){
                                  item.setAttribute('style',`${stl} ${rule.style[rs]}:${value};`);
                                } else {
                                  item.setAttribute('style',`${rule.style[rs]}:${value};`);
                                }
                               
                            }
                        }
                    } 
                  }
                 
              } 
            }
        }
      }
  }
  
  function transformCSStoSVG(value){
    const variable_regex = RegExp(/translateX\(([+-]?\d+\.?\d*)(.*?)\) translateY\(([+-]?\d+\.?\d*)(.*?)\)/,"iu");
    if (variable_regex.test(value)){
      let matches = variable_regex.exec(value);    
      return `translate(${convertPxnEm(matches[1],matches[2])} ${convertPxnEm(matches[3],matches[4])})`;
     } else {
      return value;
     }
  }
  
  function convertPxnEm(value,dimension){
      if (dimension == 'px') {
          return value;
      } 
      if (dimension == 'em'){
        return Number(value)*16;
      }
      return value+dimension;
  }
  
  function getCSSVariable(variable, bodyStyles){
     const variable_regex = RegExp(/var\((--.*?)\)/,"iu");
     if (variable_regex.test(variable)){
      let matches = variable_regex.exec(variable);
      return bodyStyles.getPropertyValue(matches[1]);
     } else {
      return null;
     }
  }

export default {saveJson, saveSvg, savePng, saveDBSQL}