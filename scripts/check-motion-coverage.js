/**
 * Find state changes that are not animated.
 *
 * Two failure shapes, and the second is the one that reads as "glitchy" rather
 * than merely abrupt:
 *   1. NO TRANSITION: a style object whose values depend on hover/press/focus
 *      but which declares no transition at all. The change snaps.
 *   2. PARTIAL TRANSITION: the object declares a transition, but a property it
 *      actually changes on state is missing from the transition list. Half the
 *      change animates and half snaps, in the same gesture.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const STATE = /\b(hov|hovered|hot|pressed|active|focused|isHover|isPressed|isFocused|open)\b\s*(\?|&&)/;
// properties whose value can change on state and which visibly animate
const ANIMATABLE = ["background","backgroundColor","color","borderColor","border","boxShadow","opacity","outline","outlineColor","fill","stroke","transform","width","height","left","right","top","bottom","borderRadius"];
const CSS_NAME = { backgroundColor:"background-color", borderColor:"border-color", boxShadow:"box-shadow", outlineColor:"outline-color", borderRadius:"border-radius", background:"background" };

function files(d,out=[]){for(const e of readdirSync(d)){if(e==="node_modules")continue;const p=join(d,e);if(statSync(p).isDirectory())files(p,out);else if(p.endsWith(".jsx"))out.push(p);}return out;}

const findings=[];
for(const p of files("components")){
  const src=readFileSync(p,"utf8");
  const src_all=src;
  // brace-match every object literal that looks like a style object
  const re=/(?:style=\{\{|(?:const|let)\s+\w*[Ss]tyle\w*\s*=\s*\{|:\s*\{)/g;
  let m;
  while((m=re.exec(src))){
    const open=src.indexOf("{", m.index + (m[0].endsWith("{{") ? m[0].length-2 : m[0].length-1));
    if(open<0) continue;
    let depth=0,end=-1;
    for(let i=open;i<src.length && i<open+4000;i++){
      if(src[i]==="{")depth++;
      else if(src[i]==="}"){depth--;if(depth===0){end=i;break;}}
    }
    if(end<0) continue;
    const body=src.slice(open,end+1);
    if(body.length>3500) continue;
    // which animatable props are STATE-DEPENDENT in this object?
    const stateful=[];
    for(const prop of ANIMATABLE){
      const pm=new RegExp(`\\b${prop}\\s*:([^,;}]|\\([^)]*\\))*`,"g");
      let x;
      while((x=pm.exec(body))){
        if(STATE.test(x[0])) { stateful.push(prop); break; }
      }
    }
    if(!stateful.length) continue;
    const tm=/transition\s*:\s*(`[^`]*`|"[^"]*"|'[^']*'|[^,\n]+)/.exec(body);
    const line=src.slice(0,open).split("\n").length;
    if(!tm){
      findings.push({p,line,kind:"NO TRANSITION",props:[...new Set(stateful)]});
      continue;
    }
    let t=tm[1];
    // Resolve one level of indirection: `transition: active ? SCROLL.fadeIn : SCROLL.fadeOut`
    // is the shape every component here uses, and reading it literally makes the
    // check blind to exactly the bug it exists to find.
    //
    // EACH BRANCH IS CHECKED SEPARATELY. The first version of this joined the
    // referenced constants into one string, so a property present in EITHER
    // branch counted as covered: fadeOut listing `opacity` excused fadeIn for
    // omitting it, which is the precise bug that was being looked for. A
    // transition the element SWAPS between only animates what the branch in
    // force at that moment names, so every branch has to name every property.
    const refs=[...t.matchAll(/\b([A-Z][A-Za-z0-9_]*)\.([A-Za-z0-9_]+)\b/g)];
    let branches=[t];
    if(refs.length){
      const resolved=[];
      for(const [,obj,key] of refs){
        const km=new RegExp(`\\b${key}\\s*:\\s*("[^"]*"|\`[^\`]*\`|'[^']*')`).exec(src_all);
        if(km) resolved.push({name:`${obj}.${key}`, text:km[1]});
      }
      if(resolved.length) branches=resolved;
    }
    for(const b of branches){
      const text = typeof b === "string" ? b : b.text;
      const label = typeof b === "string" ? text.slice(0,44) : b.name;
      if(/\ball\b/.test(text)) continue;
      const missing=[...new Set(stateful)].filter(prop=>{
        const css=CSS_NAME[prop]||prop;
        return !text.includes(css);
      });
      if(missing.length) findings.push({p,line,kind:"PARTIAL",props:missing,transition:label});
    }
  }
}
const no=findings.filter(f=>f.kind==="NO TRANSITION");
const part=findings.filter(f=>f.kind==="PARTIAL");
// Gate: either shape is a real defect, because the user sees half a gesture.
console.log(`state-dependent style objects with NO transition: ${no.length}`);
for(const f of no.slice(0,18)) console.log(`  ${f.p.replace("components/","")}:${f.line}  changes ${f.props.join(", ")}`);
console.log(`\nPARTIAL transitions (a property changes but is not in the transition list): ${part.length}`);
for(const f of part.slice(0,18)) console.log(`  ${f.p.replace("components/","")}:${f.line}  missing ${f.props.join(", ")}\n       has: ${f.transition}`);

if (no.length || part.length) {
  console.error("\ncheck-motion-coverage: a state change is not fully animated.");
  console.error("Half an animated gesture reads as glitchy, not as fast. Either add the");
  console.error("property to the transition, or make the change not state-dependent.");
  process.exit(1);
}
console.log("\nEvery state-dependent style change is fully covered by its transition.");
