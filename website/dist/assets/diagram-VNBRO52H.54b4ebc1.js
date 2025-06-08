import{p as w}from"./chunk-4BMEZGHF.da024cbd.js";import{F as B,s as S,g as F,o as z,p as P,b as W,c as T,_ as s,l as v,G as x,H as D,v as E,aE as _,k as A}from"./index.7fada018.js";import{p as N}from"./mermaid-parser.core.13544334.js";import"./_baseUniq.c2d13438.js";import"./_basePickBy.58f1ba10.js";import"./clone.cc9c2209.js";var C={packet:[]},m=structuredClone(C),L=B.packet,Y=s(()=>{const t=x({...L,...D().packet});return t.showBits&&(t.paddingY+=10),t},"getConfig"),G=s(()=>m.packet,"getPacket"),H=s(t=>{t.length>0&&m.packet.push(t)},"pushWord"),I=s(()=>{E(),m=structuredClone(C)},"clear"),h={pushWord:H,getPacket:G,getConfig:Y,clear:I,setAccTitle:S,getAccTitle:F,setDiagramTitle:z,getDiagramTitle:P,getAccDescription:W,setAccDescription:T},M=1e4,O=s(t=>{w(t,h);let e=-1,o=[],n=1;const{bitsPerRow:i}=h.getConfig();for(let{start:r,end:a,label:p}of t.blocks){if(a&&a<r)throw new Error(`Packet block ${r} - ${a} is invalid. End must be greater than start.`);if(r!==e+1)throw new Error(`Packet block ${r} - ${a!=null?a:r} is not contiguous. It should start from ${e+1}.`);for(e=a!=null?a:r,v.debug(`Packet block ${r} - ${e} with label ${p}`);o.length<=i+1&&h.getPacket().length<M;){const[b,c]=K({start:r,end:a,label:p},n,i);if(o.push(b),b.end+1===n*i&&(h.pushWord(o),o=[],n++),!c)break;({start:r,end:a,label:p}=c)}}h.pushWord(o)},"populate"),K=s((t,e,o)=>{if(t.end===void 0&&(t.end=t.start),t.start>t.end)throw new Error(`Block start ${t.start} is greater than block end ${t.end}.`);return t.end+1<=e*o?[t,void 0]:[{start:t.start,end:e*o-1,label:t.label},{start:e*o,end:t.end,label:t.label}]},"getNextFittingBlock"),R={parse:s(async t=>{const e=await N("packet",t);v.debug(e),O(e)},"parse")},U=s((t,e,o,n)=>{const i=n.db,r=i.getConfig(),{rowHeight:a,paddingY:p,bitWidth:b,bitsPerRow:c}=r,u=i.getPacket(),l=i.getDiagramTitle(),g=a+p,d=g*(u.length+1)-(l?0:a),k=b*c+2,f=_(e);f.attr("viewbox",`0 0 ${k} ${d}`),A(f,d,k,r.useMaxWidth);for(const[$,y]of u.entries())X(f,y,$,r);f.append("text").text(l).attr("x",k/2).attr("y",d-g/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),X=s((t,e,o,{rowHeight:n,paddingX:i,paddingY:r,bitWidth:a,bitsPerRow:p,showBits:b})=>{const c=t.append("g"),u=o*(n+r)+r;for(const l of e){const g=l.start%p*a+1,d=(l.end-l.start+1)*a-i;if(c.append("rect").attr("x",g).attr("y",u).attr("width",d).attr("height",n).attr("class","packetBlock"),c.append("text").attr("x",g+d/2).attr("y",u+n/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(l.label),!b)continue;const k=l.end===l.start,f=u-2;c.append("text").attr("x",g+(k?d/2:0)).attr("y",f).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",k?"middle":"start").text(l.start),k||c.append("text").attr("x",g+d).attr("y",f).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(l.end)}},"drawWord"),j={draw:U},q={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},J=s(({packet:t}={})=>{const e=x(q,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},"styles"),rt={parser:R,db:h,renderer:j,styles:J};export{rt as diagram};
