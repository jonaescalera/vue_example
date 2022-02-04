import { resolveObjectProperty } from './object';

export function generateCSVData(rows, columns) {
  const headerList = columns.map(column => column.headerName);

  const dataRows = rows.map(row =>
    columns.map(column => {
      const value = resolveObjectProperty(column.field, row);
      if (value && column.exportValueFormatter) {
        return column.exportValueFormatter.call(null, value);
      }
      return value;
    })
  );

  const csvRows = [headerList, ...dataRows];

  return csvRows.map(rowArray => rowArray.join(',')).join('\r\n');
}
