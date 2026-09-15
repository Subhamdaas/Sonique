import {Outlet} from 'react-router-dom';import {Sidebar,Topbar,PlayerBar,MobileNav} from './layout';
export default function AppShell(){return <div className="appShell"><Sidebar/><div className="mainArea"><Topbar/><main className="pageContent"><Outlet/></main></div><PlayerBar/><MobileNav/></div>}
