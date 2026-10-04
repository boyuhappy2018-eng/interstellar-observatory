"""Compile the actual stellar fragment and render mass/zoom limits with standalone EGL."""
import re,json,math
from pathlib import Path
import moderngl,numpy as np
from PIL import Image
ctx=moderngl.create_standalone_context(backend='egl')
s=Path('lib/observatory/shaders.ts').read_text();base=re.search(r'export const fragment=`(.*?)`;',s,re.S).group(1)
star=Path('lib/observatory/star-shader.ts').read_text().split('+`',1)[1].rsplit('`;',1)[0]
f=base.split('vec3 emission')[0]+star
v=re.search(r'export const vertex=`(.*?)`;',s,re.S).group(1)
convert=lambda x:x.replace('#version 300 es','#version 330').replace('precision highp float;','')
p=ctx.program(vertex_shader=convert(v),fragment_shader=convert(f));w,h=1360,900;fbo=ctx.simple_framebuffer((w,h));fbo.use();vao=ctx.simple_vertex_array(p,ctx.buffer(np.array([-1,-1,3,-1,-1,3],dtype='f4').tobytes()),'position')
for key,val in dict(resolution=(w,h),pan=(0,0),time=20,exposure=1.15,stars=1,fov=44,fade=1,activity=.65,rotation=1,limb=.6,corona=.4,granulation=1).items():p[key].value=val
out=Path('/workspace/scratch/181e94992846/qa');out.mkdir(exist_ok=True)
for st in json.loads(Path('/workspace/scratch/181e94992846/star-values.json').read_text()):
 for distance,name in [(5,'full'),(1.3,'surface')]:
  r=st['radius']*distance;p['eye'].value=(r*.3,r*.1,r*math.sqrt(.9));p['stellarRadius'].value=st['radius'];p['stellarTemperature'].value=st['temperature'];p['stellarColor'].value=st['color'];vao.render();ctx.finish();data=fbo.read(components=3);assert max(data)>0
  Image.frombytes('RGB',(w,h),data).transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(out/f"star-{st['mass']}-{name}.png")
  print(st['mass'],name,'PASS',flush=True)
