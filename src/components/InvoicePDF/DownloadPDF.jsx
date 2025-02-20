

import React from 'react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Button } from 'antd';
import { font } from "./K2D-ExtraLight-normal"



const DownloadPDF = ({ searchResults }) => {

    //console.log(searchResults)
    const handlePDF = () => {
        const doc = new jsPDF();

        // add the font to jsPDF
        doc.addFileToVFS("MyFont.ttf", font);
        doc.addFont("MyFont.ttf", "MyFont", "normal");
        doc.setFont("MyFont");

        let width = doc.internal.pageSize.getWidth();

        doc.text("Report", width / 2, 10, { align: "center" });
        doc.addImage("/logo.png", "JPEG", 170, 2, 30, 12, undefined, "FAST") 

        let data = searchResults.map((item) => [
            item.id,
            item.create_date,
            item.write_date,
            item.end_date,
            item.site_name,
            item.equipment_name,
            item.status,
            item.participants,
        ]);
        let content = {
            theme: 'grid',
            headStyles: { fontStyle: "bold" },
            startY: 15,
            head: [["Report ID", "Create Time", "Write Time", "End Time", "Site Name", "Equipment", "Status", "Participants"]],
            body: data,
            bodyStyles: { font: 'MyFont', fontSize: 10 },
            pageBreak: "auto"

        };


        doc.autoTable(content);
        let timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        doc.save(`Report_${timestamp}.pdf`);


    };
    return (
        <>
            <Button type='primary' onClick={handlePDF} className="align-center" style={{ width: "100%", height: "auto", maxWidth: "100%" }}>  <i className="align-center TextSpace fi fi-rr-download"> </i>Export PDF</Button>
        </>
    )
};

export default DownloadPDF;
