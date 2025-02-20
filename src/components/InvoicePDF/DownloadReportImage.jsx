import React from 'react';
import { jsPDF } from "jspdf";
import { Button } from 'antd';
import { font } from "./Sarabun-Regular-normal";
import { stripHtmlTags } from '@/lib/stripHtml';

const DownloadReportImage = ({ searchResults }) => {
    const handlePDF = async () => {
        const doc = new jsPDF();

        // เพิ่มฟอนต์ไทย
        doc.addFileToVFS("Sarabun-Regular-normal.ttf", font);
        doc.addFont("Sarabun-Regular-normal.ttf", "Sarabun-Regular", "normal");
        doc.setFont("Sarabun-Regular");

        const pdf_width = doc.internal.pageSize.width;
        const pdf_height = doc.internal.pageSize.height;
        const margin_l = 20;
        let pageWidth = doc.internal.pageSize.getWidth();
        let pageHeight = doc.internal.pageSize.getHeight();
        let margin = 10;
        let maxWidth = pageWidth - (margin * 2);
        let y = 15;

        doc.setFontSize(16);
        doc.text("Maintenance Report", pageWidth / 2, y, { align: "center" });
        y += 10;

        try {
            doc.addImage("/logo.png", "JPEG", 170, 2, 30, 12, undefined, "FAST");
        } catch (error) {
            console.error("Error loading logo:", error);
        }

        searchResults.forEach((job, index) => {
            if (y > pageHeight - 50) {
                doc.addPage();
                y = 15;
            }

            doc.setFontSize(12);
            doc.text(`Report Name: ${job.name}`, margin, y);
            y += 5; // เพิ่มระยะห่างระหว่างบรรทัด
            doc.text(`Created On: ${job.create_date}`, margin, y);
            y += 5;
            doc.text(`Completed On: ${job.end_date}`, margin, y);
            y += 5;
            doc.text(`Location: ${job.site_name}`, margin, y);
            y += 5;
            doc.text(`Equipment: ${job.job_type === 'PM' ? job.equipment_list : job.equipment_name}`, margin, y);
            y += 5;
            doc.text(`Status: ${job.status}`, margin, y);
            y += 5;
            if (job.job_type === 'BM') {
                doc.text(`Participants: ${job.participants}`, margin, y);
            }
            y += 5; // เพิ่มช่องว่างระหว่างส่วนนี้กับ Note

            let noteText = stripHtmlTags(job.note).split("\n"); // เอา HTML tags ออกและแยกเป็นบรรทัด
            doc.text(`Note:`, margin, y);
            y += 5;

           

            noteText.forEach(line => {
                // แยกข้อความให้ไม่ล้น
                let wrappedText = doc.splitTextToSize(line, maxWidth);
                thaitext(doc, wrappedText.join(' '), margin + 5, y); 
                y += wrappedText.length * 5 * 1.5;
            });

            y += 10;


            function thaitext(doc, str, x, y) {
                var sara = ['่', '้', '๊', '๋', '์'];
                var pushers = ['ิ', 'ี', 'ึ', 'ื', 'ำ', 'ั'];
                var base = '';
                var dim = doc.getTextDimensions(str); 

                for (var i = 0; i < str.length; i++) {
                    var c = str.charAt(i);

                    if (sara.indexOf(c) < 0) {
                        base += c;
                    } else {
                        var pusher = base.charAt(base.length - 1);

                       
                        if (pushers.indexOf(pusher) < 0) {
                            if (str.charAt(i + 1) != '' && str.charAt(i + 1) == "ำ") {
                                var len = doc.getTextWidth(base + "ำ");
                                doc.text(c, x + len, y - (dim.h / 4)); 
                            } else {
                                base += c;
                            }
                        } else {
                            var len = doc.getTextWidth(base);
                            doc.text(c, x + len, y - (dim.h / 4)); 
                        }
                    }
                }

                doc.text(base, x, y); 
            }
            const addImagesToPDF = async (images, title) => {
                if (images.length > 0) {
                    doc.setFontSize(12);
                    doc.text(title, margin, y);
                    y += 5;

                    let imgWidth = 80, imgHeight = 50;
                    let imgX1 = margin, imgX2 = pageWidth / 2 + 5;
                    let col = 0;

                    for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
                        let image = images[imgIndex];
                        if (!image.image_url || !image.image_url.startsWith("data:image/")) {
                            console.warn("Invalid image URL:", image.image_url);
                            continue;
                        }

                        if (y + imgHeight > pageHeight - 20) {
                            doc.addPage();
                            y = 15;
                        }

                        let imgX = col === 0 ? imgX1 : imgX2;
                        try {
                            doc.addImage(image.image_url, "JPEG", imgX, y, imgWidth, imgHeight);
                        } catch (error) {
                            console.error("Error adding image:", error);
                        }

                        col += 1;
                        if (col === 2) {
                            col = 0;
                            y += imgHeight + 10;
                        }

                        if (images.length % 2 !== 0 && imgIndex === images.length - 1) {
                            y += imgHeight + 10;
                        }
                    }
                }
            };

            addImagesToPDF(job.images?.filter(img => img.image_url?.startsWith("data:image/")) || [], "Images");
            addImagesToPDF(job.images_after?.filter(img => img.image_url?.startsWith("data:image/")) || [], "Images After");
            addImagesToPDF(job.images_before?.filter(img => img.image_url?.startsWith("data:image/")) || [], "Images Before");

            y += 20;
        });
        const textDate = (new Date()).toString();

        const pages = doc.internal.getNumberOfPages();
        //add footer page
        for (let j = 1; j < pages + 1; j++) {
            doc.setPage(j);
            doc.text(`วันเวลา : ${textDate}`, margin_l, pdf_height - 15, null, null, "left");
            doc.text(`หน้า ${j} จาก ${pages}`, pdf_width - margin_l, pdf_height - 15, null, null, "right");
        }

        doc.save(`Maintenance_Report_${textDate }.pdf`);
    };

    return (
        <Button type='primary' onClick={handlePDF} style={{ width: "100%" }}>
            <i className="fi fi-rr-download"></i> Export Maintenance Report
        </Button>
    );
};

export default DownloadReportImage;
