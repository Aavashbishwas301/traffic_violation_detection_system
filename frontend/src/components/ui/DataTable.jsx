import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table.jsx';
import { Input } from './Input.jsx';
import { Button } from './Button.jsx';
import { Select } from './Select.jsx';

export const DataTable = ({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pagination = true,
  defaultPageSize = 10,
  emptyMessage = "No records found.",
  emptySubMessage = "Try adjusting your filters or search query."
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // 1. Filtering
  const filteredData = useMemo(() => {
    if (!globalFilter || !searchKey) return data;
    
    const searchLower = globalFilter.toLowerCase();
    
    return data.filter(item => {
      // If searchKey is an array, search across multiple fields
      if (Array.isArray(searchKey)) {
        return searchKey.some(key => {
           const val = key.split('.').reduce((o, i) => o?.[i], item);
           return String(val || '').toLowerCase().includes(searchLower);
        });
      }
      
      // If single string key (support dot notation for nested objects)
      const val = searchKey.split('.').reduce((o, i) => o?.[i], item);
      return String(val || '').toLowerCase().includes(searchLower);
    });
  }, [data, globalFilter, searchKey]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = sortConfig.key.split('.').reduce((o, i) => o?.[i], a);
        const valB = sortConfig.key.split('.').reduce((o, i) => o?.[i], b);
        
        // Handle null/undefined
        if (valA === valB) return 0;
        if (valA == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valB == null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        // Handle numbers
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        // Handle strings
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        
        if (strA < strB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (strA > strB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // 3. Pagination
  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1;
  const currentData = useMemo(() => {
    if (!pagination) return sortedData;
    
    // Ensure current page is valid after filtering
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination, totalPages]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc'; // or set to null if we want to reset
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column.accessorKey) {
        return <ChevronDown size={14} className="ml-1 opacity-20 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
        ? <ChevronUp size={14} className="ml-1 text-primary-600" />
        : <ChevronDown size={14} className="ml-1 text-primary-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {searchKey && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-10 bg-white"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                {columns.map((column, idx) => (
                  <TableHead 
                    key={idx} 
                    className={`font-semibold text-slate-600 ${column.className || ''}`}
                    onClick={() => column.sortable && requestSort(column.accessorKey)}
                  >
                    <div className={`flex items-center ${column.sortable ? 'cursor-pointer select-none group' : ''} ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                        {column.header}
                        {column.sortable && getSortIcon(column)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((row, rowIndex) => (
                  <TableRow key={row._id || rowIndex} className="hover:bg-slate-50/50 transition-colors">
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.className}>
                        {column.cell ? column.cell(row) : row[column.accessorKey]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <FileSpreadsheet size={32} className="mb-3 text-slate-300" />
                      <p className="font-medium text-slate-900">{emptyMessage}</p>
                      <p className="text-sm">{emptySubMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
                <span>Rows per page</span>
                <Select 
                    className="h-8 w-20 py-1" 
                    value={pageSize} 
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </Select>
            </div>
            
            <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex space-x-1">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-slate-600 border-slate-200"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft size={16} />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-slate-600 border-slate-200"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-slate-600 border-slate-200"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight size={16} />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-slate-600 border-slate-200"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronsRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
