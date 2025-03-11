import React from 'react';
import '../styles/Table.css';

function Table({
    columns,
    data,
    onRowClick,
    containerClassName = "",
    tableClassName = "",
    headerRowClassName = "",
    headerCellClassName = "",
    bodyClassName = "",
    rowClassName = "",
    cellClassName = ""
}) {
    return (
        <div data-name="table-container" className={`table-component__container overflow-x-auto ${containerClassName}`}>
            <table className={`table-component min-w-full divide-y divide-gray-200 ${tableClassName}`}>
                <thead className={`table-component__header bg-gray-50 ${headerRowClassName}`}>
                    <tr>{columns.map(column => (
                        <th key={column.key} className={`table-component__header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${headerCellClassName}`}>
                            {column.label}
                        </th>
                    ))}</tr>
                </thead>
                <tbody className={`table-component__body bg-white divide-y divide-gray-200 ${bodyClassName}`}>
                    {data.map((row, index) => (
                        <tr key={index} onClick={() => onRowClick && onRowClick(row)} className={`table-component__row ${rowClassName} ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
                            {columns.map(column => (
                                <td key={column.key} className={`table-component__cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${cellClassName}`}>
                                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;