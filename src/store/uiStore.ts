import {create} from 'zustand';
type UIState={mobileNav:boolean;toast:string|null;setToast:(v:string|null)=>void;setMobileNav:(v:boolean)=>void};
export const useUIStore=create<UIState>(set=>({mobileNav:false,toast:null,setToast:v=>set({toast:v}),setMobileNav:v=>set({mobileNav:v})}));
