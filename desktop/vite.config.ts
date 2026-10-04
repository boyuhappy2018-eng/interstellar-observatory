import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 plugins:[react()],
 define:{__UPDATES_READY__:JSON.stringify(process.env.VITE_UPDATES_READY==='true')},
 resolve:{alias:{'@':fileURLToPath(new URL('../',import.meta.url))},dedupe:['react','react-dom']},
 publicDir:'../public',
 server:{port:1420,strictPort:true,host:'127.0.0.1'},
 build:{target:'es2022',outDir:'dist',emptyOutDir:true},
});
