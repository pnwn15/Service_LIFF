import React from 'react';
import { jsPDF } from "jspdf";  // นำเข้า jsPDF สำหรับการสร้าง PDF
import "jspdf-autotable"; // นำเข้า AutoTable สำหรับสร้างตารางใน PDF
import { Button } from 'antd'; // นำเข้า Button จาก Ant Design
import { font } from "./K2D-ExtraLight-normal" // นำเข้าฟอนต์ที่ใช้ใน PDF

const DownloadPDF = ({ searchResults }) => {

    // ฟังก์ชันสำหรับสร้างและดาวน์โหลด PDF
    const handlePDF = () => {
        // สร้าง instance ของ jsPDF
        const doc = new jsPDF();

        // เพิ่มฟอนต์เข้าไปใน jsPDF
        doc.addFileToVFS("MyFont.ttf", font); // เพิ่มฟอนต์ที่บรรจุในไฟล์ MyFont.ttf
        doc.addFont("MyFont.ttf", "MyFont", "normal"); // ลงทะเบียนฟอนต์ที่ใช้ใน PDF
        doc.setFont("MyFont"); // ตั้งฟอนต์ที่ใช้ใน PDF

        // ดึงความกว้างของหน้ากระดาษ
        let width = doc.internal.pageSize.getWidth();
        let height = doc.internal.pageSize.getHeight(); // เพิ่มการดึงความสูงของหน้ากระดาษ
        // เพิ่มข้อความ "Report" ที่ตำแหน่งกึ่งกลางของหน้ากระดาษ
        // doc.text("Report", width / 2, 20, { align: "center" });  // ข้อความจะอยู่ตรงกลางในแนวนอนและห่างจากขอบบน 20

        // เพิ่มโลโก้ในตำแหน่งที่กำหนด
        doc.addImage("/logo.png", "JPEG", 170, 10, 30, 12, undefined, "FAST");
        // โลโก้จะถูกแสดงที่ตำแหน่ง x=170, y=10 และขนาด 30x12

        // เพิ่มวันที่ที่มุมซ้ายของหน้ากระดาษ
        let currentDate = new Date().toLocaleDateString(); // ดึงวันที่ปัจจุบันในรูปแบบที่เหมาะสม
        doc.text(`Report Date: ${currentDate}`, 15, 20);  // เพิ่มข้อความ "Report Date: <วันที่>" ที่มุมซ้ายของหน้า

        // สร้างข้อมูลสำหรับแสดงในตาราง
        let data = searchResults.map((item) => [
            item.id,            // คอลัมน์ 1: ID
            item.site_name,     // คอลัมน์ 5: Site Name
            item.equipment_name, // คอลัมน์ 6: Equipment Name
            item.create_date,   // คอลัมน์ 2: Create Date
            item.write_date,    // คอลัมน์ 3: Write Date
            item.end_date,      // คอลัมน์ 4: End Date
            item.status,        // คอลัมน์ 7: Status
            item.participants,  // คอลัมน์ 8: Participants
        ]);

        let content = {
            theme: 'grid',  // ใช้ธีมแบบกริด
            headStyles: { fontStyle: "bold" }, // ตั้งค่าสไตล์หัวข้อเป็นตัวหนา
            startY: 30,  // ตั้งตำแหน่งเริ่มต้นของตารางจากขอบบนที่ 30
            head: [["ID", "Site Name", "Equipment", "Create Time", "Write Time", "End Time", "Status", "Participants"]], // ชื่อคอลัมน์ของตาราง
            body: data,  // ข้อมูลตาราง
            bodyStyles: { font: 'MyFont', fontSize: 8 }, // กำหนดฟอนต์และขนาดฟอนต์สำหรับข้อมูลตาราง
            pageBreak: "auto", // การตั้งค่าการแบ่งหน้าอัตโนมัติ
            columnStyles: {
                0: { cellWidth: 10 }, // คอลัมน์ ID
                1: { cellWidth: 15 }, // คอลัมน์ Site Name
                2: { cellWidth: 15 }, // คอลัมน์ Equipment
                3: { cellWidth: 35 }, // คอลัมน์ Create Time
                4: { cellWidth: 35 }, // คอลัมน์ Write Time
                5: { cellWidth: 35 }, // คอลัมน์ End Time
                6: { cellWidth: 15 }, // คอลัมน์ Status
                7: { cellWidth: 25 }  // คอลัมน์ Participants
            }
        };

        // สร้างตารางใน PDF โดยใช้ข้อมูลและการตั้งค่าที่กำหนด
        doc.autoTable(content);

        // กำหนดตำแหน่งเริ่มต้นของข้อความ
        const signX = width - 90; // ขยับข้อความไปทางซ้าย 30 หน่วยจากขอบขวา
        const signY = height - 40; // ตำแหน่งเริ่มต้นของข้อความ (ห่างจากขอบล่าง 40)

        doc.setFontSize(10); // เปลี่ยนขนาดฟอนต์ตามที่ต้องการ
        // เพิ่ม "ลายเซ็นผู้ตรวจสอบ" ใต้ข้อความ
        doc.text("ลายเซ็นผู้ตรวจสอบ............................................", signX, signY + 15); // วางข้อความ "ลายเซ็นผู้ตรวจสอบ............"

        // เพิ่ม "ตรวจสอบวันที่" ใต้ข้อความ "ลายเซ็นผู้ตรวจสอบ"
        doc.text("ตรวจสอบวันที่่.....................................................", signX, signY + 25); // วางข้อความ "ตรวจสอบวันที่............"

        // สร้างชื่อไฟล์ PDF โดยใช้ timestamp เพื่อให้ชื่อไฟล์ไม่ซ้ำ
        let timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // ใช้เวลาปัจจุบันในการตั้งชื่อไฟล์
        doc.save(`Report_${timestamp}.pdf`); // บันทึกไฟล์ PDF โดยใช้ชื่อไฟล์ที่กำหนด
    };

    return (
        <>
            {/* ปุ่มที่ผู้ใช้คลิกเพื่อดาวน์โหลด PDF */}
            <Button type='primary' onClick={handlePDF} className="align-center" style={{ width: "100%", height: "auto", maxWidth: "100%" }}>
                <i className="align-center TextSpace fi fi-rr-download"> </i>Export PDF
            </Button>
        </>
    );
};

export default DownloadPDF;
