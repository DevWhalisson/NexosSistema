import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import './AppShell.css';

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell">
      <div className="header-full">
        <Header />
      </div>
      <div className="content-wrapper">
        <div className="main-container">
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
