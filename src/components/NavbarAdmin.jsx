"use client";

import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Button, Menu, Modal } from "antd";
import Image from "next/image";
import { ExclamationCircleFilled, LogoutOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/userManipulate";
import axios from "axios";
const { Header, Footer } = Layout;
const { confirm } = Modal;

const NavbarAdmin = ({ children }) => {
  const [user, setUser] = useState({});
  const router = useRouter();

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
    <Layout>
      {/* Navigation Bar */}
      <Header style={{ padding: 0, backgroundColor: "#001529" }}>
        <Row justify="space-between" align="middle" style={{ height: "100%" }}>
          {/* Left side - Navigation Links */}
          <Col>
            <Button type="link" href="/">
              Back to Home
            </Button>
            <Button type="link" href="/technician/admin/dashboard">
              Dashboard
            </Button>
            <Button type="link" href="/technician/admin">
              Report
            </Button>
          </Col>

          {/* Right side - Profile Image and Logout */}
          <Col>
            <Menu
              theme="dark"
              mode="horizontal"
              className="gap-2 items-center"
              items={[
                {
                  key: "profile",
                  label: (
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-14 rounded-full border-2 border-red-500 overflow-hidden relative">
                        <Image
                          alt="profile"
                          src={`/api/image/person?id=${user.user_id}`}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span className="text-md truncate line-clamp font-semibold">{user.name}</span>
                    </div>
                  ),
                },
                {
                  key: "logout",
                  label: (
                    <Button
                      onClick={handleSignOut}
                      className="w-auto rounded-xl font-bold text-md"
                      icon={<LogoutOutlined />}
                      danger
                    >
                      Logout
                    </Button>
                  ),
                },
              ]}
            />
          </Col>
        </Row>
      </Header>

      {/* Main Content */}
      {children}
      {/* Footer */}
      <Footer style={{ textAlign: "center" }}>Admin Page ©2024</Footer>
    </Layout>
  );
};

export default NavbarAdmin;
