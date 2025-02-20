export function FormatDate(dateString) {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 7); // เพิ่มเวลา 7 ชั่วโมง

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
