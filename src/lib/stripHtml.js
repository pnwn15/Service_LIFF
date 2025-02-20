export function stripHtmlTags(html) {
  if (!html) {
    // หากค่า html เป็น undefined, null หรือค่าที่ไม่ใช่ string ให้คืนค่าพื้นฐานเป็นข้อความว่าง
    return "";
  }

  // Replace <br> with newline characters
  html = html.replace(/<br\s*\/?>/gi, '\n');
  
  // Create a temporary div to hold the HTML
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Strip other HTML tags and return the cleaned text
  return div.textContent || div.innerText || "";
}
