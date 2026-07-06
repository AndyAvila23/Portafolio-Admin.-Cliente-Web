export const downloadCSV = (data, filename) => {
  if (!data || !data.length) {
    alert("No hay datos para exportar.");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Agregar headers
  csvRows.push(headers.join(','));

  // Agregar datos
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escapar comillas dobles y envolver en comillas si contiene comas
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' }); // \uFEFF es para UTF-8 BOM (ayuda a Excel a leer acentos)

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
