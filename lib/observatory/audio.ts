/** Original, slow organ/choir-like sustained harmony. No astronomical sound claim. */
export class SacredAmbience {
 context=new AudioContext();master=this.context.createGain();private oscillators:OscillatorNode[]=[];
 constructor(volume=.55){const a=this.context;this.master.gain.value=0;const limiter=a.createDynamicsCompressor();limiter.threshold.value=-10;limiter.ratio.value=8;this.master.connect(limiter);limiter.connect(a.destination);
 const reverb=a.createConvolver(),length=a.sampleRate*5,impulse=a.createBuffer(2,length,a.sampleRate);for(let ch=0;ch<2;ch++){const d=impulse.getChannelData(ch);for(let i=0;i<length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/a.sampleRate*1.5)*.35;}reverb.buffer=impulse;const wet=a.createGain();wet.gain.value=.32;reverb.connect(wet);wet.connect(this.master);
 // Open fifths and slowly breathing upper voices, all audible on laptop speakers.
 [130.8128,196,261.6256,329.6276,392,523.251].forEach((f,i)=>{const voice=a.createGain();voice.gain.value=.07;const pan=a.createStereoPanner();pan.pan.value=(i-2.5)*.16;voice.connect(pan);pan.connect(this.master);pan.connect(reverb);
 for(const [harmonic,g] of [[1,1],[2,.22],[3,.08]]){const o=a.createOscillator(),gain=a.createGain();o.frequency.value=f*harmonic;o.detune.value=(i%2?1:-1)*2;gain.gain.value=g;o.connect(gain);gain.connect(voice);o.start();this.oscillators.push(o);}
 const breath=a.createOscillator(),depth=a.createGain();breath.frequency.value=.015+i*.003;depth.gain.value=.016;breath.connect(depth);depth.connect(voice.gain);breath.start();this.oscillators.push(breath);});this.setVolume(volume);}
 setVolume(v:number){this.master.gain.setTargetAtTime(v*.9,this.context.currentTime,.5);}
 async play(){await this.context.resume();}async pause(){await this.context.suspend();}close(){return this.context.close();}
}
