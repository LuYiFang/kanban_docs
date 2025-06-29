import{p as U}from"./chunk-4BMEZGHF.a88d4545.js";import{aG as S,aH as G,aI as j,F as H,o as J,p as Z,s as q,g as K,c as Q,b as X,_ as u,l as z,v as Y,d as tt,G as et,aE as at,aJ as rt,k as nt}from"./index.77876883.js";import{p as it}from"./mermaid-parser.core.e5d9efa6.js";import{d as P}from"./arc.eef13a04.js";import{o as st}from"./ordinal.d6400369.js";import"./_baseUniq.25647a79.js";import"./_basePickBy.6ef041fc.js";import"./clone.1a4e4ba9.js";import"./init.0b4a962a.js";function ot(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function lt(t){return t}function ct(){var t=lt,a=ot,h=null,o=S(0),g=S(G),A=S(0);function i(e){var r,l=(e=j(e)).length,c,w,v=0,p=new Array(l),n=new Array(l),d=+o.apply(this,arguments),C=Math.min(G,Math.max(-G,g.apply(this,arguments)-d)),m,$=Math.min(Math.abs(C)/l,A.apply(this,arguments)),E=$*(C<0?-1:1),f;for(r=0;r<l;++r)(f=n[p[r]=r]=+t(e[r],r,e))>0&&(v+=f);for(a!=null?p.sort(function(y,D){return a(n[y],n[D])}):h!=null&&p.sort(function(y,D){return h(e[y],e[D])}),r=0,w=v?(C-l*E)/v:0;r<l;++r,d=m)c=p[r],f=n[c],m=d+(f>0?f*w:0)+E,n[c]={data:e[c],index:r,value:f,startAngle:d,endAngle:m,padAngle:$};return n}return i.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),i):t},i.sortValues=function(e){return arguments.length?(a=e,h=null,i):a},i.sort=function(e){return arguments.length?(h=e,a=null,i):h},i.startAngle=function(e){return arguments.length?(o=typeof e=="function"?e:S(+e),i):o},i.endAngle=function(e){return arguments.length?(g=typeof e=="function"?e:S(+e),i):g},i.padAngle=function(e){return arguments.length?(A=typeof e=="function"?e:S(+e),i):A},i}var R=H.pie,F={sections:new Map,showData:!1,config:R},k=F.sections,I=F.showData,pt=structuredClone(R),ut=u(()=>structuredClone(pt),"getConfig"),gt=u(()=>{k=new Map,I=F.showData,Y()},"clear"),dt=u(({label:t,value:a})=>{k.has(t)||(k.set(t,a),z.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ft=u(()=>k,"getSections"),mt=u(t=>{I=t},"setShowData"),ht=u(()=>I,"getShowData"),L={getConfig:ut,clear:gt,setDiagramTitle:J,getDiagramTitle:Z,setAccTitle:q,getAccTitle:K,setAccDescription:Q,getAccDescription:X,addSection:dt,getSections:ft,setShowData:mt,getShowData:ht},vt=u((t,a)=>{U(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),yt={parse:u(async t=>{const a=await it("pie",t);z.debug(a),vt(a,L)},"parse")},xt=u(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),St=xt,At=u(t=>{const a=[...t.entries()].map(o=>({label:o[0],value:o[1]})).sort((o,g)=>g.value-o.value);return ct().value(o=>o.value)(a)},"createPieArcs"),wt=u((t,a,h,o)=>{z.debug(`rendering pie chart
`+t);const g=o.db,A=tt(),i=et(g.getConfig(),A.pie),e=40,r=18,l=4,c=450,w=c,v=at(a),p=v.append("g");p.attr("transform","translate("+w/2+","+c/2+")");const{themeVariables:n}=A;let[d]=rt(n.pieOuterStrokeWidth);d!=null||(d=2);const C=i.textPosition,m=Math.min(w,c)/2-e,$=P().innerRadius(0).outerRadius(m),E=P().innerRadius(m*C).outerRadius(m*C);p.append("circle").attr("cx",0).attr("cy",0).attr("r",m+d/2).attr("class","pieOuterCircle");const f=g.getSections(),y=At(f),D=[n.pie1,n.pie2,n.pie3,n.pie4,n.pie5,n.pie6,n.pie7,n.pie8,n.pie9,n.pie10,n.pie11,n.pie12],T=st(D);p.selectAll("mySlices").data(y).enter().append("path").attr("d",$).attr("fill",s=>T(s.data.label)).attr("class","pieCircle");let N=0;f.forEach(s=>{N+=s}),p.selectAll("mySlices").data(y).enter().append("text").text(s=>(s.data.value/N*100).toFixed(0)+"%").attr("transform",s=>"translate("+E.centroid(s)+")").style("text-anchor","middle").attr("class","slice"),p.append("text").text(g.getDiagramTitle()).attr("x",0).attr("y",-(c-50)/2).attr("class","pieTitleText");const M=p.selectAll(".legend").data(T.domain()).enter().append("g").attr("class","legend").attr("transform",(s,x)=>{const b=r+l,_=b*T.domain().length/2,B=12*r,V=x*b-_;return"translate("+B+","+V+")"});M.append("rect").attr("width",r).attr("height",r).style("fill",T).style("stroke",T),M.data(y).append("text").attr("x",r+l).attr("y",r-l).text(s=>{const{label:x,value:b}=s.data;return g.getShowData()?`${x} [${b}]`:x});const W=Math.max(...M.selectAll("text").nodes().map(s=>{var x;return(x=s==null?void 0:s.getBoundingClientRect().width)!=null?x:0})),O=w+e+r+l+W;v.attr("viewBox",`0 0 ${O} ${c}`),nt(v,c,O,i.useMaxWidth)},"draw"),Ct={draw:wt},Ft={parser:yt,db:L,renderer:Ct,styles:St};export{Ft as diagram};
