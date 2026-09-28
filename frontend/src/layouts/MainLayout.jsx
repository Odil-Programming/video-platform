import { useState } from "react";

import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import "../styles/variables.css";
import "../styles/layout.css";


export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);


  function openSidebar() {
    setIsSidebarOpen(true);
  }


  function closeSidebar() {
    setIsSidebarOpen(false);
  }


  return (
    <div className="app-layout">
      <Navbar
        onMenuClick={openSidebar}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <main className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}