import{useState,useEffect,useCallback,useRef}from'react'
  const W=20,H=20,SZ=22
  type Pt={x:number;y:number}
  const DIR:{[k:string]:Pt}={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}}
  const rnd=():Pt=>({x:Math.floor(Math.random()*W),y:Math.floor(Math.random()*H)})
  const eq=(a:Pt,b:Pt)=>a.x===b.x&&a.y===b.y
  export default function App(){
    const[snake,setSnake]=useState<Pt[]>([{x:10,y:10},{x:9,y:10},{x:8,y:10}])
    const[food,setFood]=useState<Pt>({x:15,y:10})
    const[score,setScore]=useState(0)
    const[best,setBest]=useState(0)
    const[phase,setPhase]=useState<"idle"|"run"|"dead">("idle")
    const dirRef=useRef<Pt>({x:1,y:0})
    const nextRef=useRef<Pt>({x:1,y:0})
    const snakeRef=useRef(snake)
    const foodRef=useRef(food)
    snakeRef.current=snake; foodRef.current=food
    const reset=useCallback(()=>{
      const s=[{x:10,y:10},{x:9,y:10},{x:8,y:10}]
      setSnake(s);setFood(rnd());setScore(0)
      dirRef.current={x:1,y:0};nextRef.current={x:1,y:0}
      setPhase("run")
    },[])
    useEffect(()=>{
      if(phase!=="run")return
      const id=setInterval(()=>{
        const d=nextRef.current;dirRef.current=d
        setSnake(prev=>{
          const head={x:prev[0].x+d.x,y:prev[0].y+d.y}
          if(head.x<0||head.x>=W||head.y<0||head.y>=H||prev.some(p=>eq(p,head))){
            setPhase("dead");clearInterval(id);return prev
          }
          const ate=eq(head,foodRef.current)
          if(ate){
            setScore(s=>{const ns=s+10;setBest(b=>Math.max(b,ns));return ns})
            setFood(rnd())
          }
          const ns=[head,...prev]
          if(!ate)ns.pop()
          return ns
        })
      },140)
      return()=>clearInterval(id)
    },[phase])
    useEffect(()=>{
      const h=(e:KeyboardEvent)=>{
        if(e.key==="Enter"){if(phase!=="run")reset();return}
        const d=DIR[e.key];if(!d)return
        const cur=dirRef.current
        if(d.x===-cur.x&&d.y===-cur.y)return
        nextRef.current=d;e.preventDefault()
      }
      window.addEventListener("keydown",h)
      return()=>window.removeEventListener("keydown",h)
    },[phase,reset])
    const tap=(d:Pt)=>{const c=dirRef.current;if(d.x===-c.x&&d.y===-c.y)return;nextRef.current=d}
    const cells=Array.from({length:W*H},(_,i)=>{
      const x=i%W,y=Math.floor(i/W)
      const si=snake.findIndex(p=>eq(p,{x,y}))
      const isF=eq(food,{x,y})
      return{x,y,si,isF}
    })
    return(
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem",padding:"1.5rem",background:"#0f172a",fontFamily:"Inter,system-ui,sans-serif",color:"#e2e8f0"}}>
        <h1 style={{fontWeight:800,fontSize:"1.6rem",letterSpacing:"0.1em",color:"#f8fafc"}}>🐍 SNAKE</h1>
        <div style={{display:"flex",gap:"2rem"}}>
          {[{l:"SCORE",v:score,c:"#22c55e"},{l:"BEST",v:best,c:"#38bdf8"}].map(({l,v,c})=>(
            <div key={l} style={{textAlign:"center"}}><div style={{fontSize:"1.4rem",fontWeight:800,color:c}}>{v}</div><div style={{fontSize:"0.7rem",color:"#475569"}}>{l}</div></div>
          ))}
        </div>
        <div style={{position:"relative",width:W*SZ,height:H*SZ,background:"#111827",border:"2px solid #1e293b",borderRadius:6}}>
          {cells.map(({x,y,si,isF})=>(
            <div key={x+","+y} style={{position:"absolute",left:x*SZ,top:y*SZ,width:SZ-1,height:SZ-1,borderRadius:si===0?5:2,background:si===0?"#22c55e":si>0?"#16a34a":isF?"#ef4444":"transparent",boxShadow:si===0?"0 0 6px #22c55e44":isF?"0 0 5px #ef444488":""}}/>
          ))}
          {phase!=="run"&&(
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.78)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"0.75rem",borderRadius:4}}>
              <div style={{fontSize:"2.5rem"}}>{phase==="dead"?"💀":"🐍"}</div>
              <div style={{fontWeight:700,color:"#f1f5f9"}}>{phase==="dead"?"Game Over":"Snake"}</div>
              {phase==="dead"&&<div style={{color:"#94a3b8",fontSize:"0.9rem"}}>Score: {score}</div>}
              <button onClick={reset} style={{padding:"0.55rem 1.75rem",background:"#22c55e",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,marginTop:"0.25rem"}}>{phase==="dead"?"Play Again":"Start"}</button>
            </div>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"44px 44px 44px",gridTemplateRows:"44px 44px",gap:4}}>
          {[{d:{x:0,y:-1},l:"▲",r:2,c:1},{d:{x:-1,y:0},l:"◄",r:2,c:2},{d:{x:0,y:1},l:"▼",r:2,c:2},{d:{x:1,y:0},l:"►",r:2,c:3}].map(b=>(
            <button key={b.l} onClick={()=>tap(b.d)} style={{gridRow:b.r===2?"2":"1",gridColumn:b.c+"",background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",borderRadius:8,cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>{b.l}</button>
          ))}
          <div style={{gridRow:"1",gridColumn:"2",background:"#1e293b",border:"1px solid #334155",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><button onClick={()=>tap({x:0,y:-1})} style={{width:"100%",height:"100%",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:"1rem"}}>▲</button></div>
        </div>
        <p style={{color:"#334155",fontSize:"0.73rem"}}>Arrow keys / WASD · Enter to start</p>
      </div>
    )
  }