import React from 'react';
import {
  BsGrid1X2Fill, BsFillArchiveFill, BsPeopleFill,
  BsListCheck, BsFillGearFill
} from 'react-icons/bs';
import './Sidebar.css';

function Sidebar({ openSidebarToggle, OpenSidebar, onLiveStocksClick, onCreateAlertsClick, alerts }) {
    return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive" : ""}>
            <div className='sidebar-title'>
        <div className='sidebar-brand'>
          MENU
        </div>
            </div>

            <ul className='sidebar-list'>
                <li className='sidebar-list-item'>
          <a href="">
                        <BsGrid1X2Fill className='icon' /> Home
          </a>
                </li>
                <li className='sidebar-list-item'>
          <button className='sidebar-link-button' onClick={onLiveStocksClick}>
            <BsFillArchiveFill className='icon' /> Live Stocks
          </button>
        </li>
        <li className='sidebar-list-item'>
          <button className='sidebar-link-button' onClick={onCreateAlertsClick}>
                        <BsPeopleFill className='icon' /> Create Alerts
                    </button>
                </li>
                <li className='sidebar-list-item'>
          <a href="">
            <BsListCheck className='icon' /> Alerts
          </a>
          <ul>
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <li key={index}>{`${alert.stock} - ${alert.comparisonType} ${alert.threshold}`}</li>
              ))
            ) : (
              <li>No alerts created yet.</li>
            )}
          </ul>
        </li>
            </ul>
        </aside>
    );
}

export default Sidebar;
