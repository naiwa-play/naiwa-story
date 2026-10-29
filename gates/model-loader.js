import {MeshoptDecoder} from './vendor/meshopt_decoder.mjs';

export const MODEL_FILES={
  naiwa:{url:'./assets/models/compact/naiwa.glb',bytes:8170360,label:'奶蛙',fallback:'./assets/models/rodin-v4/naiwa-jelly.glb'},
  naigou:{url:'./assets/models/compact/naigou.glb',bytes:7465904,label:'奶狗',fallback:'./assets/models/rodin-naigou/naigou-jelly.glb'},
  naishu:{url:'./assets/models/compact/naishu.glb',bytes:6756936,label:'奶鼠',fallback:'./assets/models/rodin-naishu/naishu-jelly.glb'},
  'naiwa-crowd':{url:'./assets/models/compact/naiwa-crowd.glb',bytes:42324,label:'奶蛙伙伴',fallback:'./assets/models/rodin-v4/naiwa-crowd.glb'},
  naidan:{url:'./assets/models/naidan.glb',bytes:55012,label:'小奶蛋'},
};

export async function downloadModel(url,onProgress=()=>{},options={}){
  const timeout=options.timeout??20000,retries=options.retries??1;
  for(let attempt=0;attempt<=retries;attempt++){
    const controller=new AbortController();let timer;const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>controller.abort(),timeout);};
    try{
      arm();onProgress({loaded:0,total:0,attempt});
      const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error('下载失败（HTTP '+response.status+'）');
      const total=Number(response.headers.get('Content-Length'))||0;
      if(!response.body?.getReader){const buffer=await response.arrayBuffer();onProgress({loaded:buffer.byteLength,total:total||buffer.byteLength,attempt});return buffer;}
      const reader=response.body.getReader(),chunks=[];let loaded=0;
      while(true){const {done,value}=await reader.read();if(done)break;arm();chunks.push(value);loaded+=value.byteLength;onProgress({loaded,total,attempt});}
      const data=new Uint8Array(loaded);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength;}return data.buffer;
    }catch(error){controller.abort();if(attempt===retries)throw new Error(error.name==='AbortError'?'下载长时间没有进展，请检查网络后重试':error.message,{cause:error});}
    finally{clearTimeout(timer);}
  }
}

export async function loadGameModel(loader,name,onProgress=()=>{}){
  const spec=MODEL_FILES[name];loader.setMeshoptDecoder(MeshoptDecoder);
  const load=async url=>{
    const absolute=new URL(url,import.meta.url);absolute.search=new URL(import.meta.url).search;let buffer;
    try{buffer=await downloadModel(absolute,event=>onProgress({...event,phase:'download',label:spec.label,expected:spec.bytes}));}catch(error){error.assetDownload=true;throw error;}
    onProgress({phase:'decode',loaded:buffer.byteLength,total:buffer.byteLength,label:spec.label,expected:spec.bytes});
    let timer;try{return await Promise.race([loader.parseAsync(buffer,new URL('./',absolute).href),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(spec.label+'解析超时，请重新加载')),30000);})]);}finally{clearTimeout(timer);}
  };
  try{
    if(!MeshoptDecoder.supported&&spec.fallback)return await load(spec.fallback);
    try{return await load(spec.url);}catch(error){if(error.assetDownload||!spec.fallback)throw error;onProgress({phase:'fallback',loaded:0,total:0,label:spec.label,expected:spec.bytes});return await load(spec.fallback);}
  }catch(error){throw new Error(spec.label+'：'+error.message,{cause:error});}
}
