import {useEffect,useState} from 'react'
import {NavLink,Route,Routes} from 'react-router-dom'
import {Bar,BarChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts'
import {LayoutDashboard,CalendarDays,Settings as Cog,Check,BookOpenText,Languages} from 'lucide-react'
import {TASKS,State,Day,Status,useStore,key,parse,addDays,dayMinutes,doneCount,status,emptyDay,initial} from './store'
import {IELTS_VOCAB} from './vocabularyData'
import {GRAMMAR_MODULES} from './grammarData'
import {GRAMMAR_LESSONS} from './grammarLessonData'

type P={s:State;set:React.Dispatch<React.SetStateAction<State>>}
const card='rounded-lg border border-line bg-panel p-4'
const color:Record<Status,string>={done:'bg-ok',partial:'bg-warn',missed:'bg-bad/70',upcoming:'bg-line'}
const PAGE_SIZE=10

function patch(set:P['set'],k:string,fn:(d:Day)=>Day){set(s=>({...s,days:{...s.days,[k]:fn(s.days[k]??emptyDay())}}))}
function toggle(set:P['set'],k:string,id:string,plan:number){
 patch(set,k,d=>{const on=!d.done[id];return{...d,done:{...d.done,[id]:on},minutes:{...d.minutes,[id]:on?(d.minutes[id]||plan):0}}})}

function Countdown({exam}:{exam:string}){
 const [now,setNow]=useState(Date.now())
 useEffect(()=>{const i=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(i)},[])
 const ms=Math.max(0,parse(exam).getTime()-now),sec=Math.floor(ms/1000)
 const parts:[number,string][]=[[Math.floor(sec/86400),'days'],[Math.floor(sec%86400/3600),'hours'],[Math.floor(sec%3600/60),'min'],[sec%60,'sec']]
 return<div className={card}><p className="text-sm text-mute">Until exam day, {parse(exam).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'})}</p>
 <div className="mt-2 flex gap-5">{parts.map(([n,l])=><div key={l}><span className="text-3xl font-semibold tabular-nums">{n}</span><span className="ml-1 text-sm text-mute">{l}</span></div>)}</div></div>}

function Checklist({s,set,k}:P&{k:string}){
 const d=s.days[k]??emptyDay(),n=doneCount(d),pct=Math.round(n/TASKS.length*100)
 return<div className={card}><div className="flex justify-between"><h2 className="font-medium">Today's tasks</h2><span className="text-sm text-mute">{n}/{TASKS.length} done · {Math.round(dayMinutes(d))} min studied · {pct}%</span></div>
 <div className="mt-3 h-1.5 rounded bg-line"><div className="h-full rounded bg-prog transition-all" style={{width:pct+'%'}}/></div>
 <ul className="mt-3 space-y-2">{TASKS.map(t=><li key={t.id}><button onClick={()=>toggle(set,k,t.id,t.min)} className="flex w-full items-center gap-3 rounded-md border border-line px-3 py-2 text-left hover:bg-line/40">
 <span className={`grid size-5 place-items-center rounded border ${d.done[t.id]?'border-ok bg-ok text-bg':'border-mute'}`}>{d.done[t.id]&&<Check size={14}/>}</span>
 <span className={d.done[t.id]?'line-through text-mute':''}>{t.label}</span><span className="ml-auto text-sm text-mute">{t.slot}, {t.min} min</span></button></li>)}</ul></div>}

function VocabularySection(){
 const [page,setPage]=useState(1)
 const [trackedWords,setTrackedWords]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('ielts-vocab-tracked') ?? '[]')}catch{return []}})
 useEffect(()=>{localStorage.setItem('ielts-vocab-tracked',JSON.stringify(trackedWords))},[trackedWords])
 const totalPages=Math.ceil(IELTS_VOCAB.length/PAGE_SIZE)
 const start=(page-1)*PAGE_SIZE
 const current=IELTS_VOCAB.slice(start,start+PAGE_SIZE)
 const toggleTracked=(word:string)=>setTrackedWords(prev=>prev.includes(word)?prev.filter(w=>w!==word):[...prev,word])
 return<div className={card}><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Important IELTS Vocabulary</h2><span className="rounded-full border border-line bg-line/40 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-mute">Page {page}/{totalPages}</span></div>
 <p className="mb-3 text-sm text-mute">Tracked words: <span className="font-medium text-fg">{trackedWords.length}</span></p>
 <div className="space-y-3">{current.map(({word,bangla,sentence,answer})=>{const tracked=trackedWords.includes(word);return<div key={word} className="rounded-md border border-line bg-bg/60 p-3"><div className="flex items-center justify-between gap-2"><span className="text-base font-semibold text-fg">{word}</span><button onClick={()=>toggleTracked(word)} className={`rounded-md border px-2 py-1 text-xs font-medium ${tracked?'border-ok bg-ok/15 text-ok':'border-line text-mute hover:text-fg'}`}>{tracked?'Tracked':'Track word'}</button></div>
 <div className="mt-2 text-xs text-mute"><span className="font-medium text-fg">Bangla meaning:</span> {bangla}</div><p className="mt-2 text-sm"><span className="font-medium text-fg">Example sentence:</span> {sentence}</p><p className="mt-1 text-sm text-mute"><span className="font-medium text-fg">Meaning:</span> {answer}</p></div>})}</div>
 <div className="mt-4 flex items-center justify-between gap-3">
  <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-md border border-line px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
  <span className="text-sm text-mute">Showing {start+1}-{Math.min(start+PAGE_SIZE,IELTS_VOCAB.length)} of {IELTS_VOCAB.length}</span>
  <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="rounded-md border border-line px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">Next</button>
 </div></div>}

const GRAMMAR_GUIDE=[
 {title:'১. Subject–Verb Agreement',rule:'Subject একবচন না বহুবচন—তার সঙ্গে verb মিলতে হবে। Present simple-এ he/she/it বা একবচন subject-এর verb-এর শেষে সাধারণত -s/-es যোগ হয়।',good:'The government invests in public transport.',bad:'The government invest in public transport.'},
 {title:'২. সঠিক Tense ব্যবহার',rule:'সাধারণ সত্য বা নিয়মিত ঘটনা বোঝাতে Present Simple ব্যবহার করুন। অতীতের নির্দিষ্ট ঘটনা হলে Past Simple লিখুন। বর্তমানে নিয়মিত ঘটে এমন ঘটনা বর্ণনায় একই অনুচ্ছেদে অকারণে Past Simple ব্যবহার করবেন না।',good:'Many students use online resources every day.',bad:'Many students used online resources every day.'},
 {title:'৩. Articles: a, an, the',rule:'একটি গণনাযোগ্য একবচন noun-এর আগে সাধারণত a/an লাগে। নির্দিষ্ট বা আগে উল্লেখ করা noun-এর আগে the ব্যবহার হয়।',good:'A university can provide students with useful resources.',bad:'University can provide student with useful resources.'},
 {title:'৪. Countable noun ও Plural',rule:'একাধিক গণনাযোগ্য জিনিস বোঝালে noun plural করুন। information, advice, research-এর মতো uncountable noun সাধারণত plural হয় না।',good:'Many people need more job opportunities.',bad:'Many people need more job opportunity.'},
 {title:'৫. Complete sentence লিখুন',rule:'সম্পূর্ণ বাক্যে subject এবং finite verb থাকতে হবে। শুধু dependent clause লিখলে sentence fragment হয়।',good:'Although public transport is convenient, it can be overcrowded.',bad:'Although public transport is convenient.'},
 {title:'৬. Complex sentence গঠন',rule:'কারণ, ফল, বৈপরীত্য বা শর্ত বোঝাতে because, although, while, if-এর মতো conjunction দিয়ে দুটি সম্পর্কিত idea যুক্ত করুন।',good:'Although the policy is expensive, it could reduce pollution.',bad:'Although the policy is expensive. It could reduce pollution.'},
 {title:'৭. Linking words সঠিকভাবে ব্যবহার',rule:'ধারণার সম্পর্ক অনুযায়ী linking word বাছুন: কারণের জন্য because, ফলের জন্য therefore, বৈপরীত্যের জন্য however। however দিয়ে দুটি সম্পূর্ণ বাক্য যুক্ত করলে full stop বা semicolon ব্যবহার করুন।',good:'The measure is costly; however, it may benefit future generations.',bad:'The measure is costly, however, it may benefit future generations.'},
 {title:'৮. Comma splice এড়িয়ে চলুন',rule:'শুধু comma দিয়ে দুটি সম্পূর্ণ বাক্য জোড়া যায় না। Full stop, semicolon, অথবা উপযুক্ত conjunction ব্যবহার করুন।',good:'The city is growing rapidly, and housing is becoming more expensive.',bad:'The city is growing rapidly, housing is becoming more expensive.'},
 {title:'৯. Passive voice',rule:'কাজটি কে করেছে তার চেয়ে কাজ বা ফল গুরুত্বপূর্ণ হলে be verb + past participle দিয়ে passive voice তৈরি করুন। IELTS Writing Task 1-এর process বর্ণনায় এটি বিশেষভাবে কাজে লাগে।',good:'The data are collected every month.',bad:'The data collected every month.'},
 {title:'১০. Conditional sentence',rule:'বাস্তব সম্ভাবনা বোঝাতে If + Present Simple, will + base verb ব্যবহার করুন। If-clause-এ সাধারণত will বসে না।',good:'If governments improve public transport, fewer people will drive.',bad:'If governments will improve public transport, fewer people will drive.'},
 {title:'১১. Parallel structure',rule:'একই তালিকায় grammatical form একই রাখুন—যেমন সবগুলো noun, অথবা সবগুলো verb-এর -ing form।',good:'The scheme aims to reduce costs, improve access, and protect the environment.',bad:'The scheme aims to reduce costs, improving access, and environmental protection.'},
 {title:'১২. Formal academic style',rule:'Formal writing-এ contractions (যেমন don’t) ও কথ্য শব্দ এড়িয়ে চলুন। অতিরঞ্জিত দাবি না করে precise ভাষা ব্যবহার করুন।',good:'This approach may improve access to education.',bad:'This approach is gonna totally fix education.'},
] as const

function GrammarSection({s,set}:P){
 const [unit,setUnit]=useState(1)
 const module=GRAMMAR_MODULES[unit-1]
 const firstTopic=GRAMMAR_MODULES.slice(0,unit-1).reduce((total,section)=>total+section.topics.length,1)
 const completed=GRAMMAR_MODULES.reduce((total,section,index)=>total+section.topics.filter((_,topicIndex)=>s.grammarDone?.[`lesson-${GRAMMAR_MODULES.slice(0,index).reduce((count,previous)=>count+previous.topics.length,1)+topicIndex}`]).length,0)
 const unitCompleted=module.topics.filter((_,index)=>s.grammarDone?.[`lesson-${firstTopic+index}`]).length
 return<div className="space-y-4">
 <div><h1 className="text-2xl font-semibold">IELTS Grammar: 300 Topics</h1><p className="mt-1 text-sm text-mute">৩৩টি ইউনিটে সাজানো ৩০০টি grammar lesson topic — প্রতিটি বিষয়ে বাংলা ব্যাখ্যা ও English উদাহরণসহ।</p></div>
 <section className={card}>
  <div className="flex items-center justify-between gap-3"><h2 className="font-medium">Grammar progress</h2><span className="text-sm text-mute">{completed}/300 lessons · {Math.round(completed/300*100)}%</span></div>
  <div className="mt-3 h-2 rounded bg-line" role="progressbar" aria-label="Grammar lesson progress" aria-valuemin={0} aria-valuemax={300} aria-valuenow={completed}><div className="h-full rounded bg-prog transition-all" style={{width:`${completed/300*100}%`}}/></div>
 </section>
 <section className={card}>
  <div className="mb-3"><p className="text-xs font-medium uppercase tracking-wide text-mute">Unit {unit} of {GRAMMAR_MODULES.length} · {unitCompleted}/{module.topics.length} completed</p><h2 className="mt-1 text-lg font-semibold">{module.title}</h2><p className="mt-1 text-sm text-mute">{module.description}</p></div>
  <ol className="divide-y divide-line">{module.topics.map((title,index)=>{const lessonNumber=firstTopic+index,lessonId=`lesson-${lessonNumber}`,isDone=Boolean(s.grammarDone?.[lessonId]),[explanation,example]=GRAMMAR_LESSONS[unit-1][index];return<li key={title} className="py-4"><div className="flex items-start gap-3"><span className="mt-0.5 min-w-16 text-xs text-mute">Lesson {lessonNumber}</span><div className="min-w-0 flex-1"><h3 className={`text-sm font-medium ${isDone?'text-mute line-through':''}`}>{title}</h3><p className="mt-2 text-sm leading-6 text-mute">{explanation}</p><p className="mt-2 text-sm"><span className="font-medium text-ok">Example: </span>{example}</p></div><button type="button" aria-pressed={isDone} aria-label={`${isDone?'Mark':'Complete'} lesson ${lessonNumber}: ${title}`} onClick={()=>set(current=>({...current,grammarDone:{...current.grammarDone,[lessonId]:!current.grammarDone?.[lessonId]}}))} className={`flex shrink-0 items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium ${isDone?'border-ok bg-ok/15 text-ok':'border-line text-mute hover:text-fg'}`}>{isDone&&<Check size={14}/>}<span>{isDone?'Done':'Mark done'}</span></button></div></li>})}</ol>
  <div className="mt-4 flex items-center justify-between gap-3">
   <button disabled={unit===1} onClick={()=>setUnit(n=>Math.max(1,n-1))} className="rounded-md border border-line px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">Previous unit</button>
   <span className="text-sm text-mute">Topics {firstTopic}–{firstTopic+module.topics.length-1} of 300</span>
   <button disabled={unit===GRAMMAR_MODULES.length} onClick={()=>setUnit(n=>Math.min(GRAMMAR_MODULES.length,n+1))} className="rounded-md border border-line px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">Next unit</button>
  </div>
 </section>
 <section className="space-y-3"><h2 className="text-lg font-semibold">Quick writing grammar reference</h2><div className="grid gap-3 lg:grid-cols-2">{GRAMMAR_GUIDE.map(({title,rule,good,bad})=><article key={title} className={card}>
  <h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-mute">{rule}</p>
  <p className="mt-3 text-sm"><span className="font-medium text-ok">ভালো উদাহরণ: </span>{good}</p><p className="mt-1 text-sm"><span className="font-medium text-bad">এড়িয়ে চলুন: </span>{bad}</p>
 </article>)}</div></section>
 </div>}

function Dashboard({s,set}:P){
 const today=new Date(),tk=key(today),start=parse(s.profile.start)
 const idx=Math.floor((parse(tk).getTime()-start.getTime())/864e5)+1
 const keys=Array.from({length:100},(_,i)=>key(addDays(start,i)))
 const completed=keys.filter(k=>status(k,s.days[k])==='done').length
 const hours=Object.values(s.days).reduce((a,d)=>a+dayMinutes(d),0)/60
 let streak=0;for(let i=0;i<100;i++){const k=key(addDays(today,-i));if(doneCount(s.days[k])>0)streak++;else if(i>0)break}
 const pct=Math.round(completed/100*100)
 const week=Array.from({length:7},(_,i)=>{const dt=addDays(today,i-6);return{day:dt.toLocaleDateString(undefined,{weekday:'short'}),hours:+(dayMinutes(s.days[key(dt)])/60).toFixed(1)}})
 const stats:[string,string][]=[['Days completed',`${completed}`],['Days remaining',`${Math.max(0,100-Math.max(idx,0))}`],['Study hours',hours.toFixed(1)],['Streak',`${streak} days`],['Preparation',pct+'%'],['Target band',s.profile.target.toFixed(1)],['Current band','Not assessed']]
 return<div className="space-y-4"><h1 className="text-2xl font-semibold">Welcome back, {s.profile.name.split(' ')[0]}</h1>
 <p className="text-mute">{idx<1?`Day 1 starts on ${s.profile.start}.`:idx>100?'The 100 days are over.':`Day ${idx} of 100.`}</p>
 <Countdown exam={s.profile.exam}/>
 <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map(([l,v])=><div key={l} className={card}><p className="text-sm text-mute">{l}</p><p className="mt-1 text-xl font-semibold">{v}</p></div>)}</div>
 <div className={card}><p className="mb-2 text-sm text-mute">100-day progress</p><div className="h-2 rounded bg-line"><div className="h-full rounded bg-prog" style={{width:pct+'%'}}/></div></div>
 <div className="grid gap-4 lg:grid-cols-2"><Checklist s={s} set={set} k={tk}/>
 <div className={card}><h2 className="mb-2 font-medium">Study hours, last 7 days</h2><div className="h-56"><ResponsiveContainer><BarChart data={week}><XAxis dataKey="day" stroke="#8b929c" fontSize={12}/><YAxis stroke="#8b929c" fontSize={12}/><Tooltip contentStyle={{background:'#15181d',border:'1px solid #262b33'}}/><Bar dataKey="hours" fill="#4c8dff" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div></div></div>}

function Calendar({s,set}:P){
 const start=parse(s.profile.start),[sel,setSel]=useState(key(new Date()))
 const d=s.days[sel]??emptyDay()
 return<div className="space-y-4"><h1 className="text-2xl font-semibold">Calendar</h1>
 <div className="flex gap-4 text-sm text-mute">{(['done','partial','missed','upcoming'] as Status[]).map(x=><span key={x} className="flex items-center gap-1"><i className={`size-3 rounded ${color[x]}`}/>{x==='done'?'Completed':x==='partial'?'Partial':x==='missed'?'Missed':'Upcoming'}</span>)}</div>
 <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">{Array.from({length:100},(_,i)=>{const k=key(addDays(start,i));return<button key={k} onClick={()=>setSel(k)} aria-label={`Day ${i+1}, ${k}`} className={`aspect-square rounded-md text-xs font-medium text-bg ${color[status(k,s.days[k])]} ${sel===k?'ring-2 ring-fg':''}`}>{i+1}</button>})}</div>
 <div className={card}><h2 className="mb-3 font-medium">{parse(sel).toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})}</h2>
 <div className="grid gap-3 sm:grid-cols-3">{TASKS.map(t=><label key={t.id} className="text-sm text-mute">{t.label} (min)<input type="number" min={0} max={600} value={d.minutes[t.id]??0} onChange={e=>{const v=Math.max(0,Math.min(600,+e.target.value||0));patch(set,sel,x=>({...x,minutes:{...x.minutes,[t.id]:v},done:{...x.done,[t.id]:v>0}}))}}/></label>)}</div>
 <p className="mt-2 text-sm text-mute">Total: {dayMinutes(d)} min</p>
 {([['difficulty','Biggest difficulty today'],['learned','What I learned today'],['notes','Notes']] as const).map(([f,l])=><label key={f} className="mt-3 block text-sm text-mute">{l}<textarea rows={2} value={d[f]} onChange={e=>patch(set,sel,x=>({...x,[f]:e.target.value}))}/></label>)}</div></div>}

function Settings({s,set}:P){
 const [msg,setMsg]=useState('');const pr=s.profile
 const up=(p:Partial<State['profile']>)=>set(x=>({...x,profile:{...x.profile,...p}}))
 const exp=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(s,null,2)],{type:'application/json'}));a.download='ielts-tracker-backup.json';a.click()}
 const imp=async(f?:File)=>{if(!f)return;try{const j=JSON.parse(await f.text());if(!j.profile||!j.days)throw 0;set({...initial,...j});setMsg('Data imported.')}catch{setMsg('Import failed: choose a JSON file exported from this app.')}}
 return<div className="max-w-xl space-y-4"><h1 className="text-2xl font-semibold">Settings</h1>
 <div className={card+' space-y-3'}>
 <label className="block text-sm text-mute">Name<input value={pr.name} onChange={e=>up({name:e.target.value})}/></label>
 <label className="block text-sm text-mute">Exam date<input type="date" value={pr.exam} onChange={e=>e.target.value&&up({exam:e.target.value})}/></label>
 <label className="block text-sm text-mute">Target band (4.0 to 9.0)<input type="number" step={0.5} min={4} max={9} value={pr.target} onChange={e=>{const v=+e.target.value;if(v>=4&&v<=9)up({target:v})}}/></label>
 <button className="rounded-md border border-line px-3 py-1.5 text-sm" onClick={()=>up({theme:pr.theme==='dark'?'light':'dark'})}>Switch to {pr.theme==='dark'?'light':'dark'} theme</button></div>
 <div className={card+' space-y-3'}><div className="flex flex-wrap gap-2"><button className="rounded-md bg-prog px-3 py-1.5 text-sm text-white" onClick={exp}>Export JSON</button>
 <label className="cursor-pointer rounded-md border border-line px-3 py-1.5 text-sm">Import JSON<input type="file" accept="application/json" hidden onChange={e=>imp(e.target.files?.[0])}/></label>
 <button className="rounded-md border border-bad px-3 py-1.5 text-sm text-bad" onClick={()=>{if(confirm('Delete all progress? This cannot be undone.')){set(initial);setMsg('All data reset.')}}}>Reset data</button></div>{msg&&<p className="text-sm text-mute" role="status">{msg}</p>}</div></div>}

export default function App(){
 const [s,set]=useStore()
 const nav=[['/',LayoutDashboard,'Dashboard'],['/calendar',CalendarDays,'Calendar'],['/vocabulary',BookOpenText,'Vocabulary'],['/grammar',Languages,'Grammar'],['/settings',Cog,'Settings']] as const
 return<div className="min-h-screen md:flex"><nav className="flex gap-1 border-b border-line p-2 md:min-h-screen md:w-52 md:flex-col md:border-b-0 md:border-r md:p-3">
 <p className="hidden px-2 py-3 font-semibold md:block">IELTS 100</p>
 {nav.map(([to,Icon,l])=><NavLink key={to} to={to} end={to === '/'} className={({isActive})=>`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive?'bg-line text-fg':'text-mute hover:text-fg'}`}><Icon size={16}/>{l}</NavLink>)}
 </nav>
 <main className="flex-1 p-4 md:p-8"><Routes><Route path="/" element={<Dashboard s={s} set={set}/>}/><Route path="/calendar" element={<Calendar s={s} set={set}/>}/><Route path="/vocabulary" element={<VocabularySection/>}/><Route path="/grammar" element={<GrammarSection s={s} set={set}/>}/><Route path="/settings" element={<Settings s={s} set={set}/>}/></Routes></main></div>}
