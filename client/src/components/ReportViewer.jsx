import { saveAs } from "file-saver";

export default function ReportViewer({ reportHtml, onDownload, isLoading }) {
  // Download as Word
  const handleDownloadWord = () => {
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>${reportHtml}</body></html>`,
      ],
      { type: "application/msword" }
    );
    saveAs(blob, "AI_Report.doc");
    if (onDownload) onDownload("word");
  };


  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          AI Analysis Report
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadWord}
            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-sm font-medium transition-colors flex items-center"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
            Download Word
          </button>
          {/* <button
            onClick={handleDownloadPDF}
            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-sm font-medium transition-colors flex items-center"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
            Download PDF
          </button> */}
        </div>
      </div>

      <div
        id="ai-report-content"
        className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 leading-relaxed overflow-y-auto"
        style={{ maxHeight: "500px" }}
        dangerouslySetInnerHTML={{ __html: reportHtml }}
      />
    </div>
  );
}
