import React from 'react'
import logo from '../../assets/logo.png'
import './Header.css'
import { NotificationsNone, Language, Settings } from '@material-ui/icons'

function Header() {
   return (
      <div className='header'>




         <div className='topbarWrapper'>
            <div className='topLeft'>
               {/* <span className='logo'>OM Admin</span> */}
					<img src={logo} alt="" className="logo" />
					<h2>Office Manager</h2>
            </div>
            <div className='topRight'>
               <div className='topbarIconContainer'>
                  <NotificationsNone className='barIcon' />
                  <span className='topIconBadge'>2</span>
               </div>
               <div className='topbarIconContainer'>
                  <Language className='barIcon' />
                  <span className='topIconBadge'>2</span>
               </div>
               <div className='topbarIconContainer'>
                  <Settings className='barIcon' />
                  <span className='topIconBadge'>2</span>
               </div>
               <img
                  src='https://media-exp1.licdn.com/dms/image/C4E03AQHuu1RddphBoQ/profile-displayphoto-shrink_100_100/0/1607721886690?e=1649894400&v=beta&t=W3Y3wujaCmc7yDFbthcVETqVcZ6Fhuuub1fC1FaDXXc'
                  alt='Avatar'
                  className='topAvatar'
               />
            </div>
         </div>

      </div>
   )
}

export default Header
