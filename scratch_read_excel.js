import XLSX from 'xlsx';

const filePath = 'd:\\Wood Box Cost Calculator\\PINE WOOD BOX WORK OUT FORMULA -01.xlsx';
console.log('Reading Excel file:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);
  
  workbook.SheetNames.forEach((sheetName) => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    data.slice(0, 50).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, JSON.stringify(row));
    });
  });
} catch (error) {
  console.error('Error reading Excel:', error);
}
