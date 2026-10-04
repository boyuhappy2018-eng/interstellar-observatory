"""Compile actual GLSL and render both passes via EGL, without a browser."""
import json,math
from pathlib import Path
import moderngl,numpy as np
from PIL import Image
root=Path('/workspace/scratch/181e94992846/neutron-qa');data=json.loads((root/'render.json').read_text())
ctx=moderngl.create_standalone_context(backend='egl')
def convert(s):return s.replace('#version 300 es','#version 330').replace('precision highp float;','')
surf=ctx.program(vertex_shader=convert(data['vertex']),fragment_shader=convert(data['neutronFragment']))
field=ctx.program(vertex_shader=convert(data['fieldVertex']),fragment_shader=convert(data['fieldFragment']))
quad=ctx.simple_vertex_array(surf,ctx.buffer(np.array([-1,-1,3,-1,-1,3],dtype='f4').tobytes()),'position')
meshes={x:ctx.vertex_array(field,[(ctx.buffer((root/f'field-{x}.bin').read_bytes()),'3f 3f 4f','point','tangent','info')]) for x in ['magnetar','pulsar']}
w,h=1440,1000;fbo=ctx.simple_framebuffer((w,h));fbo.use()
def render(kind,phase=.5,view='wide',lines=True,beams=None,flare=0):
 s=data[kind];beams=s['beams'] if beams is None else beams;r=28 if view=='wide' else 1.35 if view=='extreme' else 5.8;az=.65;el=.26
 eye=(r*math.cos(el)*math.sin(az),r*math.sin(el),r*math.cos(el)*math.cos(az))
 common=dict(resolution=(w,h),pan=(0,0),eye=eye,time=1.7,phase=phase,magneticTwist=s['magneticTwist'],flare=flare,flareAge=.6,fade=1,fov=44,tilt=s['tilt'],roll=s['roll'],obliquity=s['obliquity'],fieldLog=s['fieldLog'],nsCompactness=.34456,beamAngle=s['beamAngle'],flowRate=1,fieldIntensity=s['fieldIntensity'],exposure=s['exposure'],stars=1,lineWidth=4.8 if kind=='magnetar' else 3.8,magnetar=kind=='magnetar',beams=beams,fieldLines=lines,flowParticles=True)
 for p in [surf,field]:
  for k,v in common.items():
   if k in p:p[k].value=v
 ctx.disable(moderngl.BLEND);quad.render()
 if lines:ctx.enable(moderngl.BLEND);ctx.blend_func=moderngl.ONE,moderngl.ONE;meshes[kind].render();ctx.disable(moderngl.BLEND)
 ctx.finish();a=np.frombuffer(fbo.read(components=3),dtype='u1').reshape(h,w,3).copy();assert a.max()>100
 name=f'{kind}-{view}-{w}x{h}'+('-no-field' if not lines else '')+('-flare' if flare else '')+('-rotated' if phase>1 else '')
 Image.fromarray(a).transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(root/f'{name}.png');print(name,'PASS',flush=True);return a
for kind in ['magnetar','pulsar']:
 a=render(kind);b=render(kind,phase=2);assert np.mean(np.abs(a.astype(float)-b))>1
 render(kind,view='close');c=render(kind,lines=False,beams=False);assert np.mean(np.abs(a.astype(float)-c))>1
render('magnetar',flare=.7)
w,h=768,1024;fbo=ctx.simple_framebuffer((w,h));fbo.use()
render('magnetar',view='extreme');render('pulsar')
print('PASS actual shaders compiled, surface + additive ribbon passes, rotation, close views, toggles, flare. Renderer:',ctx.info['GL_RENDERER'])
