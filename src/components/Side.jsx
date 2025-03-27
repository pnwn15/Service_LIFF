import React from 'react';
import './SlideText.css'; // นำเข้าไฟล์ CSS ที่ใช้

const SlideText = () => {
    return (
        <div className="overflow-hidden flex items-center justify-center w-full border-black bg-black">
            <div className="animate-slideRight border-b-2 border-white text-md font-bold text-white whitespace-nowrap">
                "Welcome to the Service system. We apologize for the inconvenience caused due to the website experiencing some lag. The Admin will work on resolving the issue within 24 hours."
            </div>
        </div>

    );
};

export default SlideText;
