import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Premium responsive sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main viewport */}
      <div className="main-content">
        <TopNavbar toggleSidebar={toggleSidebar} />
        
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
