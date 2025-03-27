import React from 'react';
import { jsPDF } from "jspdf"; // นำเข้าไลบรารี jsPDF สำหรับการสร้างไฟล์ PDF
import { Button } from 'antd'; // นำเข้า Button จาก Ant Design สำหรับ UI ปุ่ม
import { font } from "./Sarabun-Regular-normal"; // นำเข้าไฟล์ฟอนต์ Sarabun-Regular
import { stripHtmlTags } from '@/lib/stripHtml'; // นำเข้าฟังก์ชัน stripHtmlTags เพื่อลบ HTML tags

const DownloadReportImage = ({ searchResults }) => {
    // ฟังก์ชันสร้างและดาวน์โหลด PDF
    const handlePDF = async () => {
        const doc = new jsPDF(); // สร้าง instance ของ jsPDF

        // เพิ่มฟอนต์ภาษาไทย Sarabun
        doc.addFileToVFS("Sarabun-Regular-normal.ttf", font); // เพิ่มฟอนต์ลงใน VFS (Virtual File System) ของ jsPDF
        doc.addFont("Sarabun-Regular-normal.ttf", "Sarabun-Regular", "normal"); // ลงทะเบียนฟอนต์ Sarabun
        doc.setFont("Sarabun-Regular"); // กำหนดฟอนต์ที่ใช้ในเอกสาร PDF

        // กำหนดขนาดหน้ากระดาษ PDF
        const pdf_width = doc.internal.pageSize.width;
        const pdf_height = doc.internal.pageSize.height;
        const margin_l = 20; // กำหนดระยะห่างจากขอบซ้าย
        let pageWidth = doc.internal.pageSize.getWidth(); // ความกว้างของหน้ากระดาษ
        let pageHeight = doc.internal.pageSize.getHeight(); // ความสูงของหน้ากระดาษ
        let margin = 10; // กำหนดระยะห่างจากขอบทั้งหมด
        let maxWidth = pageWidth - (margin * 2); // คำนวณขนาดที่สามารถใช้ได้สำหรับข้อความ
        let y = 15; // ตำแหน่งเริ่มต้นของข้อความที่จะแสดงในแนวตั้ง (y-axis)

        // เพิ่มหัวข้อ "Maintenance Report" ไปกลางหน้ากระดาษ
        doc.setFontSize(16); // กำหนดขนาดฟอนต์
        doc.text("Maintenance Report", pageWidth / 2, y + 15, { align: "center" }); // วางข้อความที่กลางหน้าและขยับลงมา
        y += 30; // เพิ่มระยะห่างจากข้อความหลัก


        // ลองเพิ่มโลโก้เข้าไปในเอกสาร PDF
        try {
            doc.addImage("/logo.png", "JPEG", 170, 10, 30, 12, undefined, "FAST"); // เพิ่มโลโก้
        } catch (error) {
            console.error("Error loading logo:", error); // ถ้าเกิดข้อผิดพลาดจะถูกพิมพ์ออกมาที่ console
        }

        // กำหนดขนาดคอลัมน์และระยะห่าง
        const colWidth = (pageWidth - margin * 2) / 2; // กำหนดความกว้างของคอลัมน์ (แบ่งพื้นที่หน้าออกเป็น 2 ส่วน)
        // วนลูปแสดงข้อมูลแต่ละรายการใน searchResults
        searchResults.forEach((job, index) => {
            // ถ้าพื้นที่หมด ก็จะเพิ่มหน้าใหม่
            if (y > pageHeight - 50) {
                doc.addPage(); // เพิ่มหน้ากระดาษใหม่
                y = 15; // รีเซ็ตตำแหน่ง y ให้เริ่มต้นใหม่
            }


            doc.setFontSize(12); // กำหนดขนาดฟอนต์

            // จัดตำแหน่งให้ตรงกันในคอลัมน์ซ้ายและขวา
            doc.text(`ชื่อรายงาน: ${job.name}`, margin, y); // เพิ่มชื่อรายงาน
            doc.text(`วันที่เเจ้งซ่อม: ${job.create_date}`, margin + colWidth, y); // เพิ่มวันที่สร้างรายงาน
            y += 10; // เพิ่มระยะห่างระหว่างบรรทัด

            doc.text(`วันที่ซ่อมเสร็จ: ${job.end_date}`, margin, y); // เพิ่มวันที่เสร็จสิ้น
            doc.text(`สถานที่: ${job.site_name}`, margin + colWidth, y); // เพิ่มสถานที่
            y += 10;

            doc.text(`อุปกรณ์: ${job.job_type === 'PM' ? job.equipment_list : job.equipment_name}`, margin, y); // เพิ่มอุปกรณ์
            doc.text(`สถานะ: ${job.status}`, margin + colWidth, y); // เพิ่มสถานะ
            y += 10;

            if (job.job_type === 'BM') {
                doc.text(`ผู้ตรวจสอบ: ${job.participants}`, margin, y); // เพิ่มผู้เข้าร่วมกรณีเป็น BM
            }
            y += 10; // เพิ่มช่องว่างระหว่างข้อมูล

            // แยกหมายเหตุจาก HTML tags และแสดงในหลายบรรทัด
            let noteText = stripHtmlTags(job.note).split("\n"); // แยกข้อความหมายเหตุที่มีหลายบรรทัด

            // คำนวณขนาดของข้อความหมายเหตุ
            let noteStartY = y; // ตำแหน่งเริ่มต้นของข้อความหมายเหตุ
            let maxWidth = pageWidth - margin * 2; // กำหนดความกว้างของข้อความ (หลีกเลี่ยงการพิมพ์เกินขอบ)

            doc.text(`ระบุปัญหาเพิ่มเติม:`, margin, y); // เพิ่มข้อความ "Note:"
            y += 10; // เพิ่มระยะห่างก่อนเริ่มแสดงหมายเหตุ

            // วนลูปเพื่อแสดงหมายเหตุในหลายบรรทัด
            noteText.forEach(line => {
                // ใช้ splitTextToSize เพื่อห่อข้อความให้พอดีกับพื้นที่
                let wrappedText = doc.splitTextToSize(line, maxWidth); // maxWidth ควรเป็นขนาดที่เหมาะสมสำหรับพื้นที่ในหน้า

                // แสดงข้อความที่ห่อแล้ว
                wrappedText.forEach(wrappedLine => {
                    doc.text(wrappedLine, margin, y); // พิมพ์แต่ละบรรทัด
                    y += 6; // เพิ่มระยะห่างระหว่างบรรทัด (ปรับค่าตามขนาดฟอนต์)
                });
            });

            // เพิ่มระยะห่างหลังจากแสดงหมายเหตุ
            y += 10; // เพิ่มระยะห่างหลังจากการแสดงหมายเหตุ

            // กำหนดขนาดและตำแหน่งของกรอบ
            const borderMargin = 4; // ระยะห่างจากขอบเอกสาร
            const borderWidth = pageWidth - borderMargin * 2; // ความกว้างของกรอบ
            const borderHeight = pageHeight - borderMargin * 2; // ความสูงของกรอบ (ใช้ค่า y ที่คำนวณมา)

            // วาดกรอบ
            doc.setDrawColor(0); // กำหนดสีเส้นกรอบ (สีดำ)
            doc.rect(borderMargin, borderMargin, borderWidth, borderHeight); // วาดกรอบ

            // ฟังก์ชันแสดงข้อความไทยอย่างถูกต้อง (จัดการการพิมพ์ภาษาไทยใน PDF)
            function thaitext(doc, str, x, y) {
                var sara = ['่', '้', '๊', '๋', '์']; // สัญลักษณ์เสียงในภาษาไทย
                var pushers = ['ิ', 'ี', 'ึ', 'ื', 'ำ', 'ั']; // สัญลักษณ์อักขระที่ใช้กับพยัญชนะไทย
                var base = ''; // ข้อความฐาน
                var dim = doc.getTextDimensions(str); // คำนวณขนาดของข้อความ

                // วนลูปเพื่อพิมพ์ข้อความทีละตัว
                for (var i = 0; i < str.length; i++) {
                    var c = str.charAt(i); // ตัวอักษรที่กำลังตรวจสอบ
                    if (sara.indexOf(c) < 0) {
                        base += c; // ถ้าไม่ใช่สัญลักษณ์เสียง ก็เพิ่มเข้าไปในข้อความ
                    } else {
                        var pusher = base.charAt(base.length - 1); // ตรวจสอบอักขระก่อนหน้า
                        if (pushers.indexOf(pusher) < 0) {
                            if (str.charAt(i + 1) != '' && str.charAt(i + 1) == "ำ") {
                                var len = doc.getTextWidth(base + "ำ");
                                doc.text(c, x + len, y - (dim.h / 4)); // พิมพ์อักษรที่มี "ำ"
                            } else {
                                base += c; // ถ้าไม่ใช่ตัวอักขระที่ใช้งานร่วม ก็เพิ่มเข้าไปในข้อความ
                            }
                        } else {
                            var len = doc.getTextWidth(base);
                            doc.text(c, x + len, y - (dim.h / 4)); // พิมพ์ตัวอักษรในตำแหน่งที่ถูกต้อง
                        }
                    }
                }
                doc.text(base, x, y); // พิมพ์ข้อความทั้งหมด
            }

            // ฟังก์ชันเพื่อเพิ่มภาพใน PDF (รองรับกรณีที่มีภาพในข้อมูล)
            const addImagesToPDF = async (images, title) => {
                if (images.length > 0) {
                    doc.setFontSize(12); // กำหนดขนาดฟอนต์
                    doc.text(title, margin, y); // วางข้อความชื่อภาพ
                    y += 5; // เพิ่มระยะห่าง

                    let imgWidth = 80, imgHeight = 50; // ขนาดของภาพ
                    let imgX1 = margin, imgX2 = pageWidth / 2 + 5; // ตำแหน่งของภาพ
                    let col = 0; // ตัวแปรใช้เก็บจำนวนคอลัมน์

                    for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
                        let image = images[imgIndex];
                        if (!image.image_url || !image.image_url.startsWith("data:image/")) {
                            console.warn("Invalid image URL:", image.image_url); // ถ้าภาพไม่ถูกต้อง จะแสดงข้อผิดพลาด
                            continue;
                        }

                        if (y + imgHeight > pageHeight - 20) {
                            doc.addPage(); // ถ้าพื้นที่ไม่พอจะเพิ่มหน้ากระดาษใหม่
                            y = 15; // รีเซ็ตตำแหน่ง y
                        }

                        let imgX = col === 0 ? imgX1 : imgX2; // กำหนดตำแหน่งภาพ (แบ่งเป็น 2 คอลัมน์)
                        try {
                            doc.addImage(image.image_url, "JPEG", imgX, y, imgWidth, imgHeight); // เพิ่มภาพลงใน PDF
                        } catch (error) {
                            console.error("Error adding image:", error); // ถ้าเกิดข้อผิดพลาดจะถูกพิมพ์ออกมาที่ console
                        }

                        col += 1; // เปลี่ยนคอลัมน์
                        if (col === 2) {
                            col = 0; // รีเซ็ตคอลัมน์เมื่อมี 2 ภาพ
                            y += imgHeight + 10; // เพิ่มระยะห่างหลังจากเพิ่มภาพ 2 ภาพ
                        }

                        if (images.length % 2 !== 0 && imgIndex === images.length - 1) {
                            y += imgHeight + 10; // ถ้ามีภาพคี่ ให้เพิ่มระยะห่าง
                        }
                    }
                }
            };

            // เพิ่มภาพก่อนและหลังจากการทำงาน (ถ้ามี)
            addImagesToPDF(job.images?.filter(img => img.image_url?.startsWith("data:image/")) || [], "Images");
            addImagesToPDF(job.images_after?.filter(img => img.image_url?.startsWith("data:image/")) || [], "Images After");
            addImagesToPDF(job.images_before?.filter(img => img.image_url?.startsWith("data:image/")) || [], "Images Before");

            y += 20; // เพิ่มระยะห่างหลังจากแสดงข้อมูลแต่ละรายการ
        });




        const textDate = (new Date()).toString(); // ดึงวันที่และเวลาปัจจุบัน

        const pages = doc.internal.getNumberOfPages(); // จำนวนหน้าของ PDF
        // เพิ่มหมายเลขหน้าและวันที่
        for (let j = 1; j < pages + 1; j++) {
            doc.setPage(j); // กำหนดหน้าที่จะเพิ่มข้อมูล
            doc.text(`วันเวลา : ${textDate}`, margin_l, pdf_height - 15, null, null, "left"); // เพิ่มวันที่ในส่วนท้าย
            doc.text(`หน้า ${j} จาก ${pages}`, pdf_width - margin_l, pdf_height - 15, null, null, "right"); // เพิ่มหมายเลขหน้า
        }

        // บันทึกไฟล์ PDF ด้วยชื่อที่กำหนด
        doc.save(`Maintenance_Report_${new Date().getTime()}.pdf`);
    };

    return (
        <Button onClick={handlePDF}>Download PDF</Button> // ปุ่มสำหรับดาวน์โหลด PDF
    );
};

export default DownloadReportImage;
