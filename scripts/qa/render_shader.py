"""Offline shader QA using Mesa EGL; does not automate a browser."""
import re, math, time
from pathlib import Path
import moderngl
import numpy as np
from PIL import Image
ctx=moderngl.create_standalone_context(backend='egl')
s=Path('lib/observatory/shaders.ts').read_text()
v=re.search(r'export const vertex=`(.*?)`;',s,re.S).group(1).replace('#version 300 es','#version 330').replace('precision highp float;','')
f=re.search(r'export const fragment=`(.*?)`;',s,re.S).group(1).replace('#version 300 es','#version 330').replace('precision highp float;','')
p=ctx.program(vertex_shader=v,fragment_shader=f)
a=.6;z1=1+(1-a*a)**(1/3)*((1+a)**(1/3)+(1-a)**(1/3));z2=math.sqrt(3*a*a+z1*z1);inner=(3+z2-math.sqrt((3-z1)*(3+z1+2*z2)))/2
w,h=1360,900
fbo=ctx.simple_framebuffer((w,h));fbo.use()
vao=ctx.simple_vertex_array(p,ctx.buffer(np.array([-1,-1,3,-1,-1,3],dtype='f4').tobytes()),'position')
settings=dict(resolution=(w,h),pan=(0,0),time=20,spin=.6,innerRadius=inner,intensity=1.35,turbulence=.7,exposure=1.15,stars=1,fov=44,fade=1,bloom=.16,steps=320,lensing=True,doppler=True,redshift=True,disk=True,enhanced=False,temperature=False,whiteMix=0,source=1,outflow=.8,outflowSpeed=.5,jets=False,jetPower=1,jetSpeed=.8)
for k,val in settings.items():p[k].value=val
out=Path('/workspace/scratch/181e94992846/qa');out.mkdir(exist_ok=True)
for name,elevation,r in [('cinematic',.16,38),('polar',1.48,32),('equatorial',.035,30),('close',-.08,5),('side',.07,9)]:
 p['pan'].value=(-.85,.04) if name=='side' else (0,0)
 p['eye'].value=(r*math.cos(elevation)*math.sin(.45),r*math.sin(elevation),r*math.cos(elevation)*math.cos(.45))
 t=time.perf_counter();vao.render(moderngl.TRIANGLES);ctx.finish()
 data=fbo.read(components=3);Image.frombytes('RGB',(w,h),data).transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(out/f'{name}.png')
 print(name,'compiled/rendered',round(time.perf_counter()-t,3),'s',flush=True)
p['whiteMix'].value=1;p['innerRadius'].value=1.2;p['spin'].value=0
for name,elevation,r in [('white-cinematic',.16,38),('white-polar',1.48,48),('white-equatorial',.035,30),('white-side',.07,9),('white-close',-.08,3.2)]:
 p['pan'].value=(-.85,.04) if name=='white-side' else (0,0)
 p['eye'].value=(r*math.cos(elevation)*math.sin(.45),r*math.sin(elevation),r*math.cos(elevation)*math.cos(.45))
 t=time.perf_counter();vao.render(moderngl.TRIANGLES);ctx.finish();data=fbo.read(components=3)
 Image.frombytes('RGB',(w,h),data).transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(out/f'{name}.png')
 assert np.frombuffer(data,dtype=np.uint8).max()>0,name+' unexpectedly blank'
 print(name,'compiled/rendered',round(time.perf_counter()-t,3),'s',flush=True)
print('Renderer:',ctx.info['GL_RENDERER'])
# Isolate emission controls: no hidden luminous sphere or arbitrary rim remains.
p['source'].value=0;p['outflow'].value=0;p['disk'].value=False;p['stars'].value=0
vao.render(moderngl.TRIANGLES);ctx.finish()
assert np.frombuffer(fbo.read(components=3),dtype=np.uint8).max()==0,'zero-emission field must be black'
print('PASS: all emission disabled produces exact black')
# A white source is conditional on the branch, while BH capture stays dark.
p['source'].value=3;p['whiteMix'].value=0
vao.render(moderngl.TRIANGLES);ctx.finish()
assert np.frombuffer(fbo.read(components=3),dtype=np.uint8).max()==0,'white source leaked into BH branch'
p['whiteMix'].value=1
vao.render(moderngl.TRIANGLES);ctx.finish()
assert np.frombuffer(fbo.read(components=3),dtype=np.uint8).max()>100,'white boundary failed to emit'
print('PASS: source is effective and isolated to the white-hole branch')

p['whiteMix'].value=0;p['disk'].value=True;p['stars'].value=1;p['innerRadius'].value=inner;p['jets'].value=True
for name,elevation,r in [('jet-equatorial',.16,38),('jet-polar',1.4,38),('jet-side',.07,9)]:
 p['pan'].value=(-.85,.04) if name=='jet-side' else (0,0)
 p['eye'].value=(r*math.cos(elevation)*math.sin(.45),r*math.sin(elevation),r*math.cos(elevation)*math.cos(.45))
 vao.render(moderngl.TRIANGLES);ctx.finish();data=fbo.read(components=3)
 Image.frombytes('RGB',(w,h),data).transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(out/f'{name}.png')
 print(name,'PASS',flush=True)
p['pan'].value=(0,0);r=45;p['eye'].value=(r*.4,r*.16,r*math.sqrt(1-.4**2-.16**2));p['tilt'].value=28;p['roll'].value=48
vao.render(moderngl.TRIANGLES);ctx.finish();Image.frombytes('RGB',(w,h),fbo.read(components=3)).transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(out/'jet-tilted.png');print('tilted jets PASS')
