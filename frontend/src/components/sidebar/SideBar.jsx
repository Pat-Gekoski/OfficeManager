import React from 'react'
import {LineStyle, Timeline, TrendingUp} from '@material-ui/icons'
import './SideBar.css'

function SideBar() {
  return (
	 <div className='sidebar'>
		 <div className="sidebarWrapper">
			 <div className="sidebarMenu">
				<h3 className="sidebarTitle">Dashboard</h3>
				<ul className="sidebarList">
					<li className="sidebarListItem active">
						<LineStyle className='sidebarIcon'/>
						Home
					</li>
					<li className="sidebarListItem">
						<Timeline className='sidebarIcon'/>
						Analytics
					</li>
					<li className="sidebarListItem">
						<TrendingUp className='sidebarIcon'/>
						Sales
					</li>
				</ul>
			 </div>

			 <div className="sidebarMenu">
				<h3 className="sidebarTitle">Dashboard</h3>
				<ul className="sidebarList">
					<li className="sidebarListItem">
						<LineStyle />
						Home
					</li>
					<li className="sidebarListItem">
						<Timeline />
						Analytics
					</li>
					<li className="sidebarListItem">
						<TrendingUp />
						Sales
					</li>
				</ul>
			 </div>
		 </div>
	 </div>
  )
}

export default SideBar