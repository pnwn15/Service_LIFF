"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExclamationCircleFilled, LogoutOutlined } from "@ant-design/icons";
import { getUser } from "@/lib/userManipulate";
import axios from "axios";
import Image from "next/image";
import { Modal } from "antd";

const { confirm } = Modal;

const NavbarAdmin = ({ children }) => {
  const [user, setUser] = useState({});
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // Track the menu state (open or close)

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await getUser();
        setUser(result);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    confirm({
      title: "Confirm Logout",
      icon: <ExclamationCircleFilled />,
      centered: true,
      danger: true,
      content: "Are you sure you want to logout?",
      async onOk() {
        try {
          const result = await axios.get("/api/sign-out");
          if (result.data.success) {
            router.push("/login");
          }
        } catch (error) {
          console.error("Error during sign-out:", error);
        }
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-[#313A46] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="hidden md:flex">
            <img className="w-18 h-14" src="/logo.png" />
          </div>
          {/* Left side - Navigation Links */}
          <div className="hidden md:flex space-x-4">
            <a href="/" className="text-lg font-semibold hover:text-gray-300">
              Home
            </a>
            <a
              href="/technician/admin/dashboard"
              className="text-lg font-semibold hover:text-gray-300"
            >
              Dashboard
            </a>
            <a href="/technician/admin" className="text-lg font-semibold hover:text-gray-300">
              Report
            </a>
          </div>

          {/* Hamburger Menu Icon for Small Screens */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-8 h-8"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Right side - Profile Image and Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-full border-2 border-red-500 overflow-hidden relative">
                <Image
                  alt="profile"
                  src={`/api/image/person?id=${user.user_id}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span className="text-md font-semibold truncate">{user.name}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 hidden md:flex text-md font-semibold text-red-500 hover:text-red-700"
            >
              <LogoutOutlined />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu (Hamburger Menu) */}
        {menuOpen && (
          <div className="md:hidden bg-gray-800 text-white space-y-4 px-4 py-4">
            <div className="flex items-center justify-center  w-full">
              <img className="w-18 h-14" src="/logo.png" />
            </div>

            <a href="/" className="block text-lg font-semibold border-b-2 border-gray-500 hover:text-gray-300">
              Back to Home
            </a>
            <a
              href="/technician/admin/dashboard"
              className="block text-lg font-semibold border-b-2 border-gray-500 hover:text-gray-300"
            >
              Dashboard
            </a>
            <a href="/technician/admin" className="block text-lg border-b-2 border-gray-500 font-semibold hover:text-gray-300">
              Report
            </a>
            <button
              onClick={handleSignOut}
              className="block text-lg font-semibold text-red-500 hover:text-red-700"
            >
              <LogoutOutlined className="inline-block mr-2" />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        Admin Page ©2024
      </footer>
    </div>
  );
};

export default NavbarAdmin;
