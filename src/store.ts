import {useEffect,useState} from 'react'
export const TASKS=[
{id:'listening',label:'Listening',min:50,slot:'Morning'},{id:'reading',label:'Reading',min:50,slot:'Morning'},
{id:'writing',label:'Writing',min:60,slot:'Evening'},{id:'speaking',label:'Speaking',min:30,slot:'Evening'},
{id:'vocabgrammar',label:'Vocabulary and Grammar',min:30,slot:'Evening'}]
export type Day={done:Record<string,boolean>;minutes:Record<string,number>;notes:string;difficulty:string;learned:string}
export type State={profile:{name:string;start:string;exam:string;target:number;theme:'dark'|'light'};days:Record<string,Day>}
export const initial:State={profile:{name:'Muhammad Masum Billah',start:'2026-10-30',exam:'2027-02-07',target:7.0,theme:'dark'},days:{}}
export const emptyDay=():Day=>({done:{},minutes:{},notes:'',difficulty:'',learned:''})
const pad=(n:number)=>String(n).padStart(2,'0')
export const key=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
export const parse=(s:string)=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
export const addDays=(d:Date,n:number)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x}
export const dayMinutes=(d?:Day)=>d?Object.values(d.minutes).reduce((a,b)=>a+(b||0),0):0
export const doneCount=(d?:Day)=>d?TASKS.filter(t=>d.done[t.id]).length:0
export type Status='done'|'partial'|'missed'|'upcoming'
export function status(k:string,d?:Day):Status{
 const n=doneCount(d);if(n===TASKS.length)return'done';if(n>0)return'partial'
 return k<key(new Date())?'missed':'upcoming'}
export function useStore(){
 const [s,set]=useState<State>(()=>{try{const r=localStorage.getItem('ielts-tracker-v1');return r?{...initial,...JSON.parse(r)}:initial}catch{return initial}})
 useEffect(()=>{localStorage.setItem('ielts-tracker-v1',JSON.stringify(s));document.documentElement.dataset.theme=s.profile.theme},[s])
 return [s,set] as const}
