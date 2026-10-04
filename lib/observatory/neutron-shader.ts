import {fragment} from './shaders';
export const neutronCommon=`
uniform float phase,obliquity,fieldLog,nsCompactness,beamAngle,flowRate,fieldIntensity,flare,flareAge,magneticTwist;
uniform bool magnetar,beams,fieldLines,flowParticles;
vec3 magneticWorld(vec3 p){float a=radians(obliquity);p=vec3(p.x*cos(a)+p.y*sin(a),-p.x*sin(a)+p.y*cos(a),p.z);p=vec3(p.x*cos(phase)+p.z*sin(phase),p.y,-p.x*sin(phase)+p.z*cos(phase));return toWorld(p);}
vec3 magneticLocal(vec3 p){p=toLocal(p);p=vec3(p.x*cos(phase)-p.z*sin(phase),p.y,p.x*sin(phase)+p.z*cos(phase));float a=radians(obliquity);return vec3(p.x*cos(a)-p.y*sin(a),p.x*sin(a)+p.y*cos(a),p.z);}
`;
export const neutronFragment=fragment.slice(0,fragment.indexOf('vec3 emission'))+neutronCommon+`
void main(){
 vec3 f=normalize(-eye),right=normalize(cross(f,vec3(0,1,0))),up=cross(right,f);vec2 q=uv*2.-1.;q.x*=resolution.x/resolution.y;q+=pan;
 vec3 ray=normalize(f+(right*q.x+up*q.y)*tan(radians(fov*.5)));
 float b=dot(eye,ray),disc=b*b-dot(eye,eye)+1.;bool hit=disc>0.&&b<0.;float stop=hit?-b-sqrt(disc):1e4;
 vec3 col=sky(ray)*.55;
 vec3 warm=magnetar?vec3(1.,.51,.17):vec3(.3,.64,1.);
 if(hit){vec3 n=normalize(eye+ray*stop),m=magneticLocal(n);float mu=max(0.,dot(n,-ray));
  // Surface is a qualitative X-ray/thermal map, not visible-light photography.
  float warp=noise(m*7.);float cells=noise(m*26.+warp*3.);float grain=noise(m*145.);float fine=noise(m*370.);
  float fracture=pow(1.-abs(2.*noise(m*39.+warp*5.)-1.),20.);
  float secondary=pow(1.-abs(2.*noise(m*96.+cells*3.)-1.),24.);
  float hotspot=pow(max(0.,m.y),48.)+.65*pow(max(0.,-m.y),64.);
  float crust=.2+.46*cells+.15*grain+.07*fine;
  if(magnetar){
   col=vec3(.57,.39,.24)*crust*(.3+.7*pow(mu,.4));
   col+=warm*(fracture*.72+secondary*.15)*( .35+.65*cells);
   col+=vec3(1.,.84,.53)*hotspot*3.4+warm*flare*(fracture*3.+hotspot*4.);
  }else{
   col=vec3(.28,.44,.63)*crust*(.25+.75*pow(mu,.5));
   col+=vec3(.64,.84,1.)*hotspot*5.+vec3(.19,.4,.65)*secondary*.08;
  }
  // Static bolometric transfer I_o=g^4 I_e. Source normalization is illustrative;
  // observer lapse is included, but ray geometry here still omits surface lensing.
  float lapseRatio=(1.-nsCompactness)/max(.001,1.-nsCompactness/length(eye));
  col*=1.9*lapseRatio*lapseRatio;
 }else if(b<0.){float impact=length(cross(eye,ray)),rim=exp(-max(0.,impact-1.)*28.)*.48+exp(-max(0.,impact-1.)*3.8)*.023;col+=mix(vec3(.4,.68,1.),vec3(1.,.65,.3),float(magnetar))*rim;}
 // Optically thin emissivity cones, clipped by the stellar surface.
 float bound=25.,d=b*b-dot(eye,eye)+bound*bound;
 if(d>0.){float begin=max(0.,-b-sqrt(d)),end=min(stop,-b+sqrt(d)),ds=max(0.,end-begin)/96.;
  for(int i=0;i<96;i++){vec3 p=eye+ray*(begin+(float(i)+.5)*ds);vec3 m=magneticLocal(p);float z=abs(m.y),rho=length(m.xz),r=length(p);
   if(beams&&z>1.&&r<25.){float width=.04+z*tan(radians(beamAngle)),u=rho/width;
    float core=exp(-u*u*18.),sheath=exp(-pow((u-.72)*6.,2.))*.32;
    float streak=.65+.35*sin(z*7.-time*flowRate*16.+atan(m.z,m.x)*5.);
    float density=(core+sheath*streak)*smoothstep(1.,1.4,z)*(1.-smoothstep(19.,25.,z))/pow(1.+z*.1,1.25);
    // Beam radiance is steady in the rotating source frame. Sweeping geometry,
    // rather than a global brightness oscillation, produces the observer pulse.
    col+=(vec3(.72,.86,1.)*core+warm*sheath*streak)*density*ds*(magnetar?.2:3.5)*(1.+flare);
   }
   if(magnetar&&fieldLines&&r>1.02&&r<9.){
    // Emissivity along selected twisted closed bundles, not a gas sphere.
    float theta=acos(clamp(m.y/r,-1.,1.)),L=r/max(.015,1.-m.y*m.y/(r*r));
    float bundle=exp(-pow((L-4.8)/.34,2.))+.55*exp(-pow((L-6.6)/.28,2.));
    float phi=atan(m.z,m.x)-magneticTwist*cos(theta),az=.2+.8*pow(.5+.5*cos(phi*6.),6.);
    float flow=.22+.78*pow(.5+.5*cos(theta*13.-time*flowRate*5.+phi),12.);
    float edge=smoothstep(1.02,1.4,r)*(1.-smoothstep(7.5,9.,r));
    col+=warm*bundle*az*(flowParticles?flow:.25)*edge*ds*.12*fieldIntensity*(1.+flare*7.);
   }
   if(magnetar&&flare>0.){
    float front=exp(-pow((r-(1.2+flareAge*4.))/ .45,2.));
    float polar=pow(z/max(r,.01),6.);
    col+=vec3(1.,.78,.42)*front*polar*flare*ds*.65;
   }
  }
 }
 col*=exposure;col=vec3(1.)-exp(-col);frag=vec4(pow(col,vec3(.4545))*fade,1.);
}`;
export const fieldVertex=`#version 300 es
precision highp float;
layout(location=0) in vec3 point;layout(location=1) in vec3 tangent;layout(location=2) in vec4 info;
uniform vec3 eye;uniform vec2 resolution,pan;uniform float fov,tilt,roll,phase,obliquity,lineWidth;
out vec3 world;out float across;out float along;out float identity;out float shell;
vec3 toWorld(vec3 p){float a=radians(tilt),b=radians(roll);vec3 q=vec3(p.x,cos(a)*p.y-sin(a)*p.z,sin(a)*p.y+cos(a)*p.z);return vec3(cos(b)*q.x-sin(b)*q.y,sin(b)*q.x+cos(b)*q.y,q.z);}
vec3 transformPoint(vec3 p){float a=radians(obliquity);p=vec3(p.x*cos(a)+p.y*sin(a),-p.x*sin(a)+p.y*cos(a),p.z);p=vec3(p.x*cos(phase)+p.z*sin(phase),p.y,-p.x*sin(phase)+p.z*cos(phase));return toWorld(p);}
void main(){world=transformPoint(point);vec3 dir=normalize(transformPoint(tangent)),f=normalize(-eye),right=normalize(cross(f,vec3(0,1,0))),up=cross(right,f),v=world-eye;float z=dot(v,f),t=tan(radians(fov*.5)),aspect=resolution.x/resolution.y;
 vec2 side=normalize(vec2(-dot(dir,up),dot(dir,right))+vec2(.00001));vec2 ndc=vec2(dot(v,right)/(z*t),dot(v,up)/(z*t))-pan;ndc.x/=aspect;
 ndc+=side*info.x*lineWidth*2./resolution;
 gl_Position=vec4(ndc*z,(z-1.)*.999,z);across=info.x;along=info.y;identity=info.z;shell=info.w;
}`;
export const fieldFragment=`#version 300 es
precision highp float;
in vec3 world;in float across,along,identity,shell;out vec4 frag;
uniform vec3 eye;uniform float time,flowRate,fieldIntensity,fieldLog,exposure,flare,fade,nsCompactness;uniform bool magnetar,flowParticles;
void main(){vec3 v=world-eye;float distanceToPoint=length(v);vec3 ray=v/distanceToPoint;float b=dot(eye,ray),d=b*b-dot(eye,eye)+1.;if(d>0.&&-b-sqrt(d)<distanceToPoint-.015)discard;
 float travel=magnetar?along: (shell<0.?along:along*.55);
 float phase=fract(travel*3.-time*flowRate*(magnetar?.38:.7)+identity*.137),packet=exp(-pow((phase-.5)*13.,2.));
 float thread=exp(-across*across*38.),halo=exp(-across*across*5.)*.09;
 float family=magnetar?1.:shell<0.?1.45:.28;
 float depth=.6+.4*max(0.,dot(normalize(world),normalize(eye)));
 float power=(.26+(flowParticles?packet*3.4:0.))*(thread+halo)*fieldIntensity*(.65+(fieldLog-11.)*.11)*(1.+flare*3.)*family*depth;
 power*=pow(1.-along, .15)*pow(along,.15)*1.3;
 vec3 color=magnetar?mix(vec3(.72,.2,.035),vec3(1.,.83,.47),thread):mix(vec3(.13,.34,.64),vec3(.72,.9,1.),thread);
 // Additive schematic magnetic-field emission; not radiative-transfer intensity.
 frag=vec4((vec3(1.)-exp(-color*power*exposure*.78))*fade,1.);
}`;
