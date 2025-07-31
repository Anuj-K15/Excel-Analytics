import XLSX from 'xlsx';
import Upload from '../models/Upload.js';
import History from '../models/History.js'; // ✅ import history model

export const uploadExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ msg: 'No file uploaded' });

    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Save upload data
    const upload = await Upload.create({
      filename: file.filename,
      originalName: file.originalname,
      data,
      uploadedBy: req.user // This assumes auth middleware sets req.user
    });

    // ✅ Save to history
    await History.create({
      user: req.user, // or req.user._id
      fileName: file.originalname,
      chartType: 'Bar',     // or get from req.body
      xAxis: Object.keys(data[0])[0] || 'X',
      yAxis: Object.keys(data[0])[1] || 'Y'
    });

    res.status(200).json({ msg: 'File uploaded and parsed successfully', data });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
