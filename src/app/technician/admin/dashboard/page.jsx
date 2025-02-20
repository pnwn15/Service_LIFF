"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Card, Button, Row, Col, Spin } from "antd";
import dynamic from "next/dynamic";
import axios from "axios";
import moment from "moment";
import AnalogClock from "@/components/AnalogClock/AnalogClock";
import { BarChartOutlined, TagsOutlined, ClockCircleOutlined, TeamOutlined, ToolOutlined, CheckCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import Loading from '@/components/LoadingPage';

const NavbarAdmin = dynamic(() => import("@/components/NavbarAdmin"), { ssr: false });
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DashboardPage = () => {
    const defaultStartDate = moment().subtract(3, "days");
    const defaultEndDate = moment();
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const [chartData, setChartData] = useState([]);
    const [totalTasks, setTotalTasks] = useState(0);
    const [repairedItems, setRepairedItems] = useState(0);
    const [technicianSummary, setTechnicianSummary] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [technicianPendingTasks, setTechnicianPendingTasks] = useState(0);
    const [technicianCompletedTasks, setTechnicianCompletedTasks] = useState(0);

    const fetchTechnicianTasks = async () => {
        try {
            const response = await axios.get("/api/admin/search-report");
            const dataTasks = response.data.reports;

            if (Array.isArray(dataTasks)) {
                const summary = dataTasks.reduce((acc, task) => {
                    const technician = (Array.isArray(task.participants) && task.participants.length > 0)
                        ? task.participants.join(", ")
                        : "No technician assigned";

                    acc[technician] = (acc[technician] || 0) + 1;
                    return acc;
                }, {});

                const summaryArray = Object.entries(summary).map(([name, count]) => ({ name, count }));
                setTechnicianSummary(summaryArray);
                setTechnicianPendingTasks(dataTasks.filter(task => task.status !== "complete").length);
                setTechnicianCompletedTasks(dataTasks.filter(task => task.status === "complete").length);
            }
        } catch (error) {
            console.error("Error fetching technician tasks:", error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get("/api/admin/search-report", {
                params: {
                    start_date: dateRange[0]?.toISOString(),
                    end_date: dateRange[1]?.toISOString(),
                },
            });

            const dataTasks = response.data.reports;

            if (Array.isArray(dataTasks)) {
                const groupedData = dataTasks.reduce((acc, task) => {
                    const date = moment(task.create_date).format("YYYY-MM-DD");
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {});

                setChartData(
                    Object.keys(groupedData).map(date => ({ x: date, y: groupedData[date] }))
                );
            } else {
                setChartData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getTotalData = async () => {
        try {
            const response = await axios.get("/api/admin/search-report");
            const dataTasks = response.data.reports;

            if (Array.isArray(dataTasks)) {
                setTotalTasks(new Set(dataTasks.map(task => task.request_id)).size);
                setRepairedItems(new Set(dataTasks.map(task => task.id)).size);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        const fetchDataRealtime = async () => {
            setLoading(true);
            await Promise.all([fetchData(), getTotalData(), fetchTechnicianTasks()]);
            setLoading(false);
        };

        fetchDataRealtime();
        const pollingInterval = setInterval(fetchDataRealtime, 3000000);

        return () => clearInterval(pollingInterval);
    }, [dateRange]);

    const maxChartValue = chartData.length ? Math.max(...chartData.map(item => item.y)) + 2 : 6;

    const chartOptions = {
        chart: {
            type: "bar",
            zoom: { enabled: true },
        },
        xaxis: {
            type: "datetime",
            title: { text: "Date" },
        },
        yaxis: {
            title: { text: "Number of Requests" },
            min: 0,
            max: maxChartValue,
            labels: { formatter: value => value.toFixed(0) },
        },
        stroke: { curve: "smooth" },
        markers: { size: 5 },
        tooltip: {
            x: { format: "dd MMM yyyy" }
        },
        colors: ['#001529'],
    };

    const chartSeries = [{ name: "Requests per Day", data: chartData }];

    return (
        <Suspense fallback={<Loading />}>
            <NavbarAdmin>
                {loading ? (
                    // Show loading spinner as a full page loader
                    <div className="flex justify-center items-center h-screen w-full">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="p-3">
                        <h1 className="font-bold text-3xl lg:text-4xl text-gray-700 mb-5">Dashboard</h1>

                            <Row gutter={24}>
                                <Col span={5}>
                                    <Card
                                       
                                        title={
                                            <div className="flex items-center">
                                                <TagsOutlined className="mr-2 text-white" />
                                                <span>Total Tasks</span>
                                            </div>
                                        }
                                        bordered
                                        className="shadow-md"
                                        style={{ backgroundColor: "#e0f2fe", borderColor: "#90cdf4" }}
                                        styles={{
                                            header: { backgroundColor: "#74c1f1", color: "#fff" }, 
                                        }}
                                    >
                                        <div className="h-24 flex items-center justify-center font-bold text-3xl lg:text-4xl text-blue-300">
                                            {totalTasks} 
                                        </div>
                                    </Card>

                                </Col>
                                <Col span={5}>
                                    <Card
                                        title={
                                            <div className="flex items-center">
                                                <ToolOutlined className="mr-2 text-white" />
                                                <span>Total Repaired Items</span>
                                            </div>
                                        }
                                        bordered
                                        className="shadow-md"
                                        style={{ backgroundColor: "#f0fdf4", borderColor: "#a3e635" }}
                                        styles={{
                                            header: { backgroundColor: "#88cc19",color: "#fff"},
                                        }}
                                    >
                                        <div className="h-24 flex items-center justify-center font-bold text-3xl lg:text-4xl text-green-300">
                                            {repairedItems}  
                                        </div>
                                    </Card>
                                </Col>
                             
                                <Col span={4}>
                                    <Card
                                        title={
                                            <div className="flex items-center">
                                                <ClockCircleOutlined className="mr-2 text-white" />
                                                <span>Pending Tasks</span>
                                            </div>
                                        }
                                        bordered
                                        className="shadow-md"
                                        style={{ backgroundColor: "#fee2e2", borderColor: "#f87171" }}
                                        styles={{
                                            header: { backgroundColor: "#f75555", color: "#fff" },
                                        }}
                                    >
                                        <div className="h-24 flex items-center justify-center font-bold text-3xl lg:text-4xl text-red-300">
                                            {technicianPendingTasks} 
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={4}>
                                    <Card
                                        title={
                                            <div className="flex items-center">
                                                <CheckCircleOutlined className="mr-2 text-white" />
                                                <span>Completed Tasks</span>
                                            </div>
                                        }
                                        bordered
                                        className="shadow-md"
                                        style={{ backgroundColor: "#d1fae5", borderColor: "#34d399" }}
                                        styles={{
                                            header: { backgroundColor: "#29bc86", color: "#fff" },
                                        }}
                                    >
                                        <div className="h-24 flex items-center justify-center font-bold text-3xl lg:text-4xl text-teal-300">
                                            {technicianCompletedTasks} 
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card
                                        title={
                                            <div className="flex items-center">
                                                <TeamOutlined className="mr-2 text-white" />
                                                <span>Technician Summary</span>
                                            </div>
                                        }
                                        bordered
                                        className="shadow-md"
                                        style={{ backgroundColor: "#fef9c3", borderColor: "#fde68a" }}
                                        styles={{
                                            header: { backgroundColor: "#fcd436", color: "#fff" },
                                        }}
                                    >
                                        <div className="h-24 flex flex-col justify-start gap-2 overflow-auto">
                                            {technicianSummary.map((technician, index) => (
                                                <p key={index} className="flex justify-between text-gray-800">
                                                    <span>{technician.name}</span>
                                                    <span>{technician.count} tasks</span>
                                                </p>
                                            ))}

                                        </div>
                                    </Card>
                                </Col>
                            </Row>


                        <Row className="mt-4" gutter={24}>
                            <Col span={16}>
                                <Card title={
                                    <div className="flex justify-between">
                                        <span className="flex items-center"><BarChartOutlined className="mr-2" />Requests per Day (Bar Chart)</span>
                                        <div className="flex gap-2">
                                            <Button onClick={() => setDateRange([moment().subtract(3, "days"), moment()])}>3 Days</Button>
                                            <Button onClick={() => setDateRange([moment().subtract(7, "days"), moment()])}>7 Days</Button>
                                            <Button onClick={() => setDateRange([moment().subtract(30, "days"), moment()])}>30 Days</Button>
                                        </div>
                                    </div>}
                                    bordered className="shadow-md shadow-cyan-950">
                                    <div className="h-96">
                                        <Chart options={chartOptions} series={chartSeries} type="bar" height={384} />
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card title="Clock" bordered className="shadow-md shadow-cyan-950">
                                    <div className="h-96">
                                        <AnalogClock />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </NavbarAdmin>
        </Suspense>
    );
};

export default DashboardPage;
