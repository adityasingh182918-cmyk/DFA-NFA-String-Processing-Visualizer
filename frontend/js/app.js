const $ = id => document.getElementById(id);
let data = null, step = 0, timer = null;
const api = async (url, body) => { const r = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const j=await r.json(); if(!r.ok) throw Error(j.detail||'Request failed'); return j; };

async function process() {
  clearInterval(timer); timer=null; step=0; playbackStatus('Ready'); $('error').textContent=''; $('result').textContent='';
  try { const example=$('example').value, input=$('input').value, kind=$('kind').value;
    data = example === 'exact' ? await api(`/api/simulate/${kind}`,{input}) : await api('/api/example',{example,input});
    $('machine-title').textContent=data.automaton.name; renderAll(); showStep(0);
  } catch(e) { $('error').textContent=e.message; }
}
function renderAll(){
 const a=data.analysis; $('stats').innerHTML=[['Input',a.input===''?'ε':a.input],['Length',a.length],['Alphabet',`{ ${a.alphabet.map(x=>x===' '?'space':x).join(', ')} }`],['States',data.automaton.states.length]].map(x=>`<div><div class="stat-label">${x[0]}</div><div class="stat-value">${escapeHtml(x[1])}</div></div>`).join('');
 updateTheory(a); renderGraph(); renderTable(); $('path').innerHTML=data.computation_path.map((x,i)=>`<li id="path-${i}">${pathText(x)}</li>`).join('');
}
function updateTheory(analysis){
 $('theory-input').textContent=analysis.input===''?'ε (empty string)':analysis.input;
 const symbols=Array.from(analysis.input).map(displaySymbol);
 $('theory-sequence').textContent=symbols.length?symbols.join(' → '):'ε (empty string)';
}
function pathText(x){if(!x.step)return escapeHtml(`Step 0: start in ${setText(x.active_states)}.`); let edge=x.from?`${x.from} → ${x.to}`:(x.edges||[]).map(e=>`${e.from} → ${e.to}`).join(', ')||'no transition'; return escapeHtml(`Step ${x.step}: read “${displaySymbol(x.read)}”; ${edge}; active ${setText(x.active_states)}.`)}
function setText(s){return s.length===1?s[0]:`{${s.join(', ')}}`}
function renderTable(){const a=data.automaton; $('table').innerHTML=`<thead><tr><th>State</th>${a.alphabet.map(x=>`<th>${escapeHtml(x)}</th>`).join('')}</tr></thead><tbody>${data.table.map(r=>`<tr><td>${r.start?'→':''}${r.final?'*':''}${escapeHtml(r.state)}</td>${a.alphabet.map(x=>`<td>${escapeHtml(Array.isArray(r[x])?(r[x].join(', ')||'—'):r[x])}</td>`).join('')}</tr>`).join('')}</tbody>`}
function renderGraph(){
 const a=data.automaton, svg=$('canvas'), positions={}, dead='D';
 const states=a.states.filter(s=>s!==dead), spacing=160, firstX=120;
 const hasDead=a.states.includes(dead), deadY=330+states.length*20;
 const width=Math.max(1000,300+Math.max(0,states.length-1)*spacing), height=hasDead?deadY+80:440;
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`); svg.style.width=`${width}px`; svg.style.height=`${height}px`;

 // Keep exact-string states in a clean row. Lay out the branching demo on two
 // branches so its nondeterministic choice is visible instead of overlapping.
 if(a.name==='Branching NFA (ab)'){
   Object.assign(positions,{q0:{x:140,y:220},q1:{x:410,y:120},q2:{x:410,y:320},q3:{x:700,y:220}});
 } else {
   states.forEach((name,index)=>{positions[name]={x:firstX+index*spacing,y:150}});
   if(hasDead) positions[dead]={x:firstX+(states.length-1)*spacing/2,y:deadY};
 }

 const defs='<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3z" fill="#8ea0b9"/></marker></defs>';
 let edges='', nodes='';
 // Group symbols that share the same directed route (for example D's 0,1 loop).
 const groups=new Map();
 a.transitions.forEach(t=>{const key=`${t.source}\u0000${t.target}`;if(!groups.has(key))groups.set(key,{source:t.source,target:t.target,symbols:[]});const group=groups.get(key);if(!group.symbols.includes(t.symbol))group.symbols.push(t.symbol)});
 const deadGroups=[...groups.values()].filter(e=>e.target===dead && e.source!==dead).sort((x,y)=>states.indexOf(x.source)-states.indexOf(y.source));
 [...groups.values()].forEach(group=>{
   const {source,target,symbols}=group, p=positions[source], q=positions[target]; if(!p||!q)return;
   const edgeClass=edgeClassName(source,target), label=escapeHtml(symbols.map(displaySymbol).join(', '));
   if(target===dead && source!==dead){
     // Route each rejecting transition through its own lane. The labels stay
     // separated and the arrows no longer pile up diagonally over the DFA row.
     const lane=220+deadGroups.findIndex(e=>e.source===source)*20;
     const angle=(-178+deadGroups.findIndex(e=>e.source===source)*176/Math.max(1,deadGroups.length-1))*Math.PI/180;
     const endX=q.x+38*Math.cos(angle), endY=q.y+38*Math.sin(angle);
     edges+=`<path class="edge ${edgeClass}" d="M ${p.x} ${p.y+29} C ${p.x} ${lane}, ${endX} ${lane}, ${endX} ${endY}" marker-end="url(#arrow)"/><text class="edge-label reject-label" x="${(p.x+endX)/2}" y="${lane-7}">${label}</text>`;
   } else if(source===dead && target===dead){
     // Keep the dead-state loop beside the state, away from the incoming fan.
     edges+=`<path class="edge ${edgeClass}" d="M ${p.x+28} ${p.y-23} C ${p.x+103} ${p.y-76}, ${p.x+103} ${p.y+76}, ${p.x+28} ${p.y+23}" marker-end="url(#arrow)"/><text class="edge-label" x="${p.x+91}" y="${p.y}">${label}</text>`;
   } else if(source===target){
     edges+=`<path class="edge ${edgeClass}" d="M ${p.x-18} ${p.y-23} C ${p.x-68} ${p.y-92}, ${p.x+68} ${p.y-92}, ${p.x+18} ${p.y-23}" marker-end="url(#arrow)"/><text class="edge-label" x="${p.x}" y="${p.y-72}">${label}</text>`;
   } else {
     const dx=q.x-p.x, dy=q.y-p.y;
     const startX=p.x+Math.sign(dx||1)*28, startY=p.y+(dy?Math.sign(dy)*16:0);
     const endX=q.x-Math.sign(dx||1)*30, endY=q.y+(dy?-Math.sign(dy)*16:0);
     let path,labelX,labelY;
     const hasReverse=groups.has(`${target}\u0000${source}`);
     if(dy===0 && hasReverse){const offset=p.x<q.x?-48:48;path=`M ${startX} ${startY} Q ${(startX+endX)/2} ${startY+offset} ${endX} ${endY}`;labelX=(startX+endX)/2;labelY=startY+offset+(offset<0?-10:20);}
     else if(dy===0){path=`M ${startX} ${startY} L ${endX} ${endY}`;labelX=(startX+endX)/2;labelY=startY-17;}
     else {const bend=(startX+endX)/2;path=`M ${startX} ${startY} Q ${bend} ${startY} ${endX} ${endY}`;labelX=bend;labelY=(startY+endY)/2-13;}
     edges+=`<path class="edge ${edgeClass}" d="${path}" marker-end="url(#arrow)"/><text class="edge-label" x="${labelX}" y="${labelY}">${label}</text>`;
   }
 });
 a.states.forEach(name=>{const p=positions[name], final=a.final_states.includes(name), radius=name===dead?36:29;nodes+=`<g class="node node-${name}"><circle class="state ${final?'final':''}" cx="${p.x}" cy="${p.y}" r="${radius}"/>${final?`<circle class="state inner-final" cx="${p.x}" cy="${p.y}" r="22"/>`:''}<text class="node-label" x="${p.x}" y="${p.y}">${name}</text></g>`});
 const start=positions[a.start_state];
 svg.innerHTML=defs+`<path class="start-arrow" d="M ${start.x-72} ${start.y} L ${start.x-34} ${start.y}" marker-end="url(#arrow)"/><text class="start-label" x="${start.x-52}" y="${start.y-13}">START</text>`+edges+nodes;
}
function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function displaySymbol(s){return s===' '?'␠':s==='\n'?'↵':s==='\t'?'⇥':s==='\r'?'␍':s}
function edgeClassName(from,to){return `edge-${from}-${to}`}
function showStep(i){if(!data)return; step=Math.max(0,Math.min(i,data.computation_path.length-1)); const x=data.computation_path[step];
 document.querySelectorAll('.state').forEach(e=>e.classList.remove('active')); document.querySelectorAll('.edge').forEach(e=>e.classList.remove('active')); document.querySelectorAll('.path li').forEach(e=>e.classList.remove('current'));
 x.active_states.forEach(s=>document.querySelectorAll(`.node-${CSS.escape(s)} .state`).forEach(e=>e.classList.add('active')));
 if(x.from)document.querySelectorAll(`.${edgeClassName(x.from,x.to)}`).forEach(e=>e.classList.add('active')); else (x.edges||[]).forEach(e=>document.querySelectorAll(`.${edgeClassName(e.from,e.to)}`).forEach(el=>el.classList.add('active')));
 $(`path-${step}`).classList.add('current'); const transition=x.from?`${x.from} --${x.read}--> ${x.to}`:(x.edges||[]).map(e=>`${e.from} --${x.read}--> ${e.to}`).join(' | ')||'No transition';
 $('step-panel').textContent=`Current step: ${step} / ${data.computation_path.length-1}\nCurrent symbol: ${x.read??'—'}\nActive states: ${setText(x.active_states)}\nTransition: ${transition}`;
 if(step===data.computation_path.length-1){$('result').className=`result ${data.result}`;$('result').textContent=`${data.accepted?'✓ STRING ACCEPTED':'✗ STRING REJECTED'} — ${data.reason}`}
 else {$('result').textContent='';$('result').className='result'}
}
function playbackStatus(message){$('playback-status').textContent=message}
function stopPlayback(message='Paused'){clearInterval(timer);timer=null;playbackStatus(message)}
function start(){if(!data||step>=data.computation_path.length-1)return;stopPlayback('Playing');timer=setInterval(()=>{if(step>=data.computation_path.length-1){stopPlayback('Complete');return}showStep(step+1);if(step>=data.computation_path.length-1)stopPlayback('Complete')},Number($('speed').value))}
$('process').onclick=process; $('start').onclick=start; $('pause').onclick=()=>stopPlayback(); $('next').onclick=()=>{stopPlayback('Paused');showStep(step+1)}; $('reset').onclick=()=>{stopPlayback('Ready');showStep(0)};
$('example').onchange=()=>{const x=$('example').value; const presets={'simple-dfa':'10101','simple-nfa':'aab','branching-nfa':'ab'}; if(presets[x])$('input').value=presets[x];};
fetch('/api/health').catch(()=>{$('status').textContent='● API unavailable'}); process();
