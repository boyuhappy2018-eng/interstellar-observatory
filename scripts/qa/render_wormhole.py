import re,math
from pathlib import Path
import moderngl,numpy as np
from PIL import Image
ctx=moderngl.create_standalone_context(backend='egl');s=Path('lib/observatory/shaders.ts').read_text();base=re.search(r'export const fragment=`(.*?)`;',s,re.S).group(1);v=re.search(r'export const vertex=`(.*?)`;',s,re.S).group(1);f=base.split('vec3 emission')[0]+Path('lib/observatory/worm-shader.ts').read_text().split('+`',1)[1].rsplit('`;',1)[0];convert=lambda x:x.replace('#version 300 es','#version 330').replace('precision highp float;','');p=ctx.program(vertex_shader=convert(v),fragment_shader=convert(f));w,h=1100,760;fbo=ctx.simple_framebuffer((w,h));fbo.use();vao=ctx.simple_vertex_array(p,ctx.buffer(np.array([-1,-1,3,-1,-1,3],dtype='f4').tobytes()),'position')
for k,val in dict(resolution=(w,h),pan=(0,0),eye=(10,4,22),exposure=1.15,stars=1,fov=44,fade=1,steps=420,wormLookBack=False).items():p[k].value=val
for l in [12,3,1,.01,0,-.01,-1,-3,-12]:
 p['wormL'].value=l;vao.render();ctx.finish();data=fbo.read(components=3);assert max(data)>0;Image.frombytes('RGB',(w,h),data).transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(f'/workspace/scratch/181e94992846/qa/worm-{l}.png');print(l,'PASS',flush=True)
