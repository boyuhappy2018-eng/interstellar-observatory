import {fragment} from './shaders';
// Shared camera, procedural noise and distant stars. Stellar photosphere uses straight rays:
// compactness is tiny across this main-sequence range; no fictitious black-hole lensing.
export const starFragment=fragment.slice(0,fragment.indexOf('vec3 emission'))+`
uniform float stellarRadius,stellarTemperature,activity,rotation,limb,corona,granulation;
uniform vec3 stellarColor;
uniform bool colorContrast;
// Smooth cellular granules, with derivative-based filtering near the limb.
float granules(vec3 p){vec3 cell=floor(p),q=fract(p);float d=9.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){vec3 o=vec3(x,y,z);vec3 jitter=vec3(noise(cell+o),noise(cell+o+23.),noise(cell+o+57.));d=min(d,length(o+.15+.7*jitter-q));}return 1.-smoothstep(.24,.65,d);}
void main(){
 vec3 forward=normalize(-eye),right=normalize(cross(forward,vec3(0,1,0))),up=cross(right,forward);
 vec2 q=uv*2.-1.;q.x*=resolution.x/resolution.y;q+=pan;
 vec3 ray=normalize(forward+(q.x*right+q.y*up)*tan(fov*.008726646));
 float b=dot(eye,ray),c=dot(eye,eye)-stellarRadius*stellarRadius,disc=b*b-c;
 vec3 color=sky(ray);float closest=length(cross(eye,ray))/stellarRadius;
 if(disc>=0.&&b<0.){
  vec3 normal=(eye+ray*(-b-sqrt(disc)))/stellarRadius;
  float mu=max(0.,dot(normal,-ray));normal=toLocal(normal);float angle=time*rotation*.045*(1.-.18*normal.y*normal.y);
  vec3 n=vec3(cos(angle)*normal.x-sin(angle)*normal.z,normal.y,sin(angle)*normal.x+cos(angle)*normal.z);
  float convection=1.-smoothstep(6500.,9000.,stellarTemperature);
  float large=noise(n*14.+vec3(0.,time*.025,0.));float fine=noise(n*115.+vec3(large*3.,time*.09,0.));float finer=noise(n*290.);
  float footprint=length(fwidth(n))*200.;float cellular=mix(granules(n*200.+vec3(0.,time*.08,0.)),.5,smoothstep(.3,1.3,footprint));
  float cells=.74+.32*cellular+.1*fine+.045*finer;
  // Supergranular modulation, bright magnetic faculae and multi-scale lanes.
  float superCells=noise(n*35.+vec3(0.,time*.018,0.));
  float network=pow(1.-abs(2.*noise(n*58.)-1.),8.);
  float texture=mix(1.,cells*(.94+.13*superCells),granulation*convection);
  texture*=1.+(1.-convection)*granulation*.045*(noise(n*18.+vec3(time*.015))-0.5); // Illustrative weak photospheric variability, not cool-star granules.
  float faculae=activity*convection*network*.16*pow(1.-mu,1.5);
  float spots=pow(smoothstep(.71,.86,noise(n*11.+vec3(2.,0.,0.))),2.)*(1.-smoothstep(.18,.6,abs(n.y)));
  float penumbra=smoothstep(.47,.76,noise(n*11.+vec3(2.,0.,0.)))*spots;
  float fibrils=.65+.35*noise(n*450.+vec3(time*.05));
  float spotShade=1.-activity*convection*(spots*.7+penumbra*.2*fibrils);
  float limbDarkening=1.-limb*(1.-mu);
  color=stellarColor*(texture*spotShade+faculae)*limbDarkening*1.6;
 }else if(b<0.){
  // Optional visibility-enhanced outer atmosphere; not a bolometric corona prediction.
  float halo=exp(-max(0.,closest-1.)*22.)*.08+exp(-max(0.,closest-1.)*4.)*.012;
  vec3 n=normalize(eye+ray*(-b));float stream=.5+.5*noise(n*12.+time*.03);
  color+=stellarColor*halo*corona*(.5+activity)*stream;
 }
 if(colorContrast)color=pow(max(color,vec3(0.)),vec3(1.65));
 color*=exposure;float peak=max(max(color.r,color.g),color.b);vec3 mapped=color/max(peak,.00001)*(1.-exp(-peak));mapped=pow(mapped,vec3(.4545));frag=vec4(mapped*fade,1.);
}`;
