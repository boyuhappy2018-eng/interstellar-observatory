import {fragment} from './shaders';
export const wormFragment=fragment.slice(0,fragment.indexOf('vec3 emission'))+`
uniform bool wormCinema;uniform float wormL;uniform bool wormLookBack;
vec3 derivative(vec3 y,float b){float r2=1.+y.x*y.x;return vec3(y.y,b*b*y.x/(r2*r2),b/r2);}
vec3 otherSky(vec3 d,bool other){
 if(other)d=vec3(.8*d.x+.6*d.z,d.y,-.6*d.x+.8*d.z);
 vec3 field=sky(other?d.yzx:d);
 float band=dot(d,normalize(other?vec3(.25,1.,.65):vec3(.4,.9,-.3)));
 float dust=noise(d*9.)*.6+noise(d*27.)*.3+noise(d*85.)*.1;
 field+=(other?vec3(.16,.105,.055):vec3(.025,.038,.06))*exp(-band*band*(other?90.:220.))*pow(dust,2.);
 // One distant extended beacon in B provides a fixed feature to follow through lensing.
 float beacon=pow(max(0.,dot(d,normalize(vec3(.2,.2,-1.)))),700.);
 field+=vec3(.7,.52,.3)*beacon*.28*float(other);
 return field;
}
void main(){
 vec3 n=normalize(eye),forward=(wormLookBack?1.:-1.)*n,right=normalize(cross(forward,vec3(0,1,0))),up=cross(right,forward);
 vec2 q=uv*2.-1.;q.x*=resolution.x/resolution.y;q+=pan;float nearThroat=exp(-wormL*wormL*.12);float bank=wormCinema?.09*sin(wormL*.35)*nearThroat:0.;q=mat2(cos(bank),sin(bank),-sin(bank),cos(bank))*q;
 vec3 ray=normalize(forward+(q.x*right+q.y*up)*tan((fov+(wormCinema?32.*nearThroat:0.))*.008726646));
 float mu=dot(ray,n),b=sqrt(1.+wormL*wormL)*sqrt(max(0.,1.-mu*mu));vec3 tangent=ray-mu*n;tangent=length(tangent)>.00001?normalize(tangent):right;
 vec3 y=vec3(wormL,mu,0.);
 for(int i=0;i<420;i++){if(i>=steps)break;float h=min(.8,.055*(1.+abs(y.x)));vec3 k1=derivative(y,b),k2=derivative(y+h*k1*.5,b),k3=derivative(y+h*k2*.5,b),k4=derivative(y+h*k3,b);y+=h*(k1+2.*k2+2.*k3+k4)/6.;if(abs(y.x)>40.&&y.x*y.y>0.)break;}
 vec3 endN=cos(y.z)*n+sin(y.z)*tangent,endT=-sin(y.z)*n+cos(y.z)*tangent;
 vec3 direction=normalize(sign(y.x)*y.y*endN+b/sqrt(1.+y.x*y.x)*endT);
 vec3 color=otherSky(toLocal(direction),y.x<0.);float peak=max(max(color.r,color.g),color.b);color=color/max(peak,.000001)*(1.-exp(-peak*exposure));frag=vec4(pow(color,vec3(.4545))*fade,1.);
}`;
