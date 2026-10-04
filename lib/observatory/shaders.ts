export const vertex=`#version 300 es
in vec2 position;out vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0,1);}`;
export const fragment=`#version 300 es
precision highp float;
in vec2 uv;out vec4 frag;
uniform vec2 resolution,pan;uniform vec3 eye;uniform float time,spin,innerRadius,intensity,turbulence,exposure,stars,fov,fade,bloom,whiteMix,source,outflow,outflowSpeed,jetPower,jetSpeed;uniform int steps;uniform bool jets,lensing,doppler,redshift,disk,enhanced,temperature;
uniform float tilt,roll;
vec3 toWorld(vec3 p){float a=radians(tilt),b=radians(roll);vec3 q=vec3(p.x,cos(a)*p.y-sin(a)*p.z,sin(a)*p.y+cos(a)*p.z);return vec3(cos(b)*q.x-sin(b)*q.y,sin(b)*q.x+cos(b)*q.y,q.z);}
vec3 toLocal(vec3 p){float a=radians(tilt),b=radians(roll);vec3 q=vec3(cos(b)*p.x+sin(b)*p.y,-sin(b)*p.x+cos(b)*p.y,p.z);return vec3(q.x,cos(a)*q.y+sin(a)*q.z,-sin(a)*q.y+cos(a)*q.z);}
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec3 blackbody(float t){float x=clamp((t-1500.)/11000.,0.,1.);return mix(vec3(1.,.22,.035),vec3(1.,.76,.43),smoothstep(0.,.35,x))*(1.-smoothstep(.55,1.,x))+mix(vec3(1.,.76,.43),vec3(.78,.88,1.),smoothstep(.55,1.,x))*smoothstep(.55,1.,x);}
vec3 sky(vec3 d){vec3 col=vec3(0);for(int j=0;j<3;j++){float scale=160.+float(j)*190.;vec3 p=d*scale;vec3 cell=floor(p);vec3 f=fract(p)-.5;float h=hash(cell+float(j)*31.);float size=mix(.025,.095,pow(h,18.));float star=exp(-dot(f,f)/(size*size));float select=step(j==0?.978:.992,h);col+=star*select*mix(vec3(.66,.76,1.),vec3(1.,.83,.62),hash(cell+72.))*mix(.5,2.,h);}return col*stars;}
vec3 emission(vec3 p,vec3 ray){float r=length(p.xz);float phi=atan(p.z,p.x);float omega=1./(pow(r,1.5)+spin*.354);float a=phi-time*omega*2.5*(1.-whiteMix);float flowRadius=r-whiteMix*time*outflowSpeed;vec3 flow=vec3(cos(a)*r,sin(a)*r,flowRadius*.45);float n=noise(flow*2.2);float n2=noise(flow*7.5+vec3(n*2.));float n3=noise(flow*26.);float bands=.5+.5*sin(flowRadius*32.+n*6.+sin(a*7.+r)*turbulence*3.);float density=mix(.8,.25+1.1*n+.45*n2+.28*n3+.28*bands,turbulence);float edge=smoothstep(innerRadius,innerRadius+.45,r)*(1.-smoothstep(11.,16.,r));float flux=pow(innerRadius/r,2.3)*edge;float beta=sqrt(1./max(2.*(r-1.),2.05));vec3 velocity=normalize(mix(vec3(-p.z,0.,p.x),vec3(p.x,0.,p.z),whiteMix));beta=mix(beta,.35,whiteMix);float g=1.;if(redshift)g*=sqrt(max(.02,1.-1./r)/max(.001,1.-1./length(eye)));if(doppler)g*=sqrt(1.-beta*beta)/(1.+beta*dot(velocity,normalize(ray)));if(enhanced)g=pow(g,1.65);float t=mix(10000.,24000.,whiteMix)*pow(innerRadius/r,mix(.72,.3,whiteMix))*g;vec3 color=blackbody(t);color=mix(color,mix(vec3(.48,.64,.8),vec3(1.,.96,.86),clamp(t/18000.,0.,1.)),whiteMix);if(temperature)color=mix(vec3(.45,.08,.025),vec3(.75,.85,1.),clamp(t/12000.,0.,1.));return color*flux*density*pow(g,3.)*intensity*mix(6.,9.,whiteMix);}

// Prescribed, optically thin outgoing radiation, NOT a prediction of white-hole matter dynamics.
vec3 outflowEmission(vec3 p,float r){
 vec3 n=p/r;float phase=r-time*outflowSpeed*2.;
 float angular=.5+.5*sin(dot(n,vec3(31.,47.,23.))+sin(dot(n,vec3(57.,13.,41.)))*2.);
 float filament=pow(angular,8.);float pulse=.45+.55*pow(.5+.5*sin(phase*3.4+angular*4.),3.);
 float sheet=exp(-abs(n.y)*5.);float density=filament*pulse*(.22+sheet)*exp(-r*.16)*smoothstep(1.05,1.5,r)*(1.-smoothstep(16.,22.,r));
 return vec3(.64,.79,.92)*density*.012*outflow*whiteMix;
}
vec3 boundaryRadiance(vec3 p){return vec3(.94,.97,1.)*source*2.2*whiteMix;}

// Prescribed optically thin, bipolar synchrotron-like emissivity in an exterior funnel.
// A collimated parabolic sheath + knots, with SR Doppler boosting. Not a GRMHD solve.
vec3 jetEmission(vec3 p,vec3 ray){
 float z=abs(p.y),rho=length(p.xz);float width=.26+.065*pow(z,.78);
 float sheath=exp(-pow((rho/width-.68)*5.,2.));float spine=exp(-pow(rho/(width*.38),2.));
 float launch=smoothstep(2.4,3.8,z),end=1.-smoothstep(38.,55.,z);
 float phase=z-time*jetSpeed*4.;float knot=.35+.9*pow(noise(vec3(phase*.32,2.,4.)),2.);
 float winding=.7+.3*cos(atan(p.z,p.x)*2.-z*.5+time*.22);
 float beta=jetSpeed,gamma=inversesqrt(1.-beta*beta);
 vec3 velocity=vec3(0.,sign(p.y),0.);float delta=1./(gamma*(1.+beta*dot(velocity,normalize(ray))));
 // Continuous optically thin jet boost ~ delta^(2+alpha), illustrative alpha=.7.
 float beaming=doppler?pow(delta,2.7):1.;float g=redshift?sqrt(max(.01,1.-1./length(p))/max(.001,1.-1./length(eye))):1.;
 float density=(sheath*winding+spine*.85)*knot*launch*end*pow(3./max(3.,z),1.25);
 return mix(vec3(.62,.76,1.),vec3(1.,.88,.67),spine)*density*jetPower*4.5*min(beaming,35.)*pow(g,3.);
}

// Spatial Schwarzschild null orbit equation in affine parameter, r_s=1:
// d²x/dλ² = -(3/2)|x × dx/dλ|² x / r^5. Midpoint integration.
vec3 accel(vec3 p,float h2){float r2=dot(p,p);return -1.5*h2*p/(r2*r2*sqrt(r2));}
void main(){vec3 forward=normalize(-eye),right=normalize(cross(forward,vec3(0,1,0))),up=cross(right,forward);vec2 q=(uv*2.-1.);q.x*=resolution.x/resolution.y;q+=pan;vec3 v=normalize(forward+(q.x*right+q.y*up)*tan(fov*.008726646));v=toLocal(v);vec3 localEye=toLocal(eye);vec3 radial=normalize(localEye);if(lensing)v+=radial*dot(v,radial)*(sqrt(1.-1./length(eye))-1.);vec3 p=localEye;float h2=dot(cross(p,v),cross(p,v));vec3 color=vec3(0);float trans=1.;bool captured=false;float r=length(p);for(int i=0;i<320;i++){if(i>=steps)break;float ds=clamp(r*.07,.018,4.);if(steps<180)ds*=1.5;if(jets&&abs(p.y)>2.&&abs(p.y)<60.&&length(p.xz)<(.26+.065*pow(abs(p.y),.78))+ds*1.5)ds=min(ds,.07+.012*abs(p.y));vec3 old=p;vec3 av=lensing?accel(p,h2):vec3(0);vec3 mid=p+v*ds*.5;vec3 vm=v+av*ds*.5;p+=vm*ds;v+=(lensing?accel(mid,h2):vec3(0))*ds;r=length(p);if(jets&&abs(p.y)>2.4&&abs(p.y)<55.)color+=trans*jetEmission(p,v)*ds;if(whiteMix>.001&&r>1.05&&r<22.)color+=trans*outflowEmission(p,r)*ds;if(disk&&old.y*p.y<=0.){float f=old.y/(old.y-p.y);vec3 hit=mix(old,p,f);float hr=length(hit.xz);if(hr>innerRadius&&hr<16.){color+=trans*emission(hit,v);trans*=1.-mix(.84,.55,whiteMix)*smoothstep(innerRadius,innerRadius+.45,hr)*(1.-smoothstep(11.,16.,hr));}}
if(r<1.001){color+=trans*boundaryRadiance(p);captured=true;break;}if(r>max(70.,length(eye)*1.3)&&dot(p,v)>0.)break;if(trans<.018)break;}
if(!captured)color+=sky(normalize(toWorld(v)))*trans;
// Restrained local shoulder, no outline is drawn on the captured-ray boundary.
color*=exposure;color+=color*color/(1.+color)*bloom*.2;vec3 mapped=1.-exp(-color);mapped=pow(mapped,vec3(.4545));frag=vec4(mapped*fade,1.);}`;
