import jsPDF from "jspdf";

export const convertImageToPDF = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const pdf = new jsPDF({
            orientation: img.width > img.height ? "landscape" : "portrait",
            unit: "px",
          });

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          let imgWidth = img.width;
          let imgHeight = img.height;
          
          const ratio = Math.min(
            pageWidth / imgWidth,
            pageHeight / imgHeight
          );
          
          imgWidth *= ratio;
          imgHeight *= ratio;
          
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
          
          pdf.addImage(
            e.target?.result as string,
            "JPEG",
            x,
            y,
            imgWidth,
            imgHeight
          );
          
          const blob = pdf.output("blob");
          resolve(blob);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
};

export const convertTextToPDF = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const pdf = new jsPDF();
        
        const lines = pdf.splitTextToSize(text, 180);
        pdf.text(lines, 15, 15);
        
        const blob = pdf.output("blob");
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsText(file);
  });
};

export const convertFileToPDF = async (file: File): Promise<Blob> => {
  if (file.type.startsWith("image/")) {
    return convertImageToPDF(file);
  } else if (file.type === "text/plain") {
    return convertTextToPDF(file);
  } else {
    throw new Error("Unsupported file type for conversion");
  }
};
