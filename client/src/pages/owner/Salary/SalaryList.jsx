import React, { useState, useEffect } from 'react';
import api from '../../../api/api';

const SalaryList = () => {
    // Data State
    const [monthOptions, setMonthOptions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [salaries, setSalaries] = useState([]);
    const [filteredSalaries, setFilteredSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rowsInput, setRowsInput] = useState("10");

    // 1. Initialize Options (Months & Branches)
    useEffect(() => {
        // Generate Month Options
        const options = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        for (let i = 1; i <= 6; i++) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            options.push(`${monthNames[d.getMonth()]}-${d.getFullYear()}`);
        }
        setMonthOptions(options);
        if (options.length > 0) setSelectedMonth(options[0]);

        // Fetch Branches
        const fetchBranches = async () => {
            try {
                const res = await api.get('/owner/salaries/branches');
                setBranches(res.data);
            } catch (err) {
                console.error("Error fetching branches:", err);
            }
        };
        fetchBranches();
    }, []);

    // 2. Fetch Salaries when Month changes
    useEffect(() => {
        if (selectedMonth) fetchSalaries();
    }, [selectedMonth]);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/owner/salaries?monthYear=${selectedMonth}`);
            setSalaries(res.data.salaries);
            setFilteredSalaries(res.data.salaries);
        } catch (err) {
            console.error("Error fetching salaries:", err);
            setSalaries([]);
            setFilteredSalaries([]);
        } finally {
            setLoading(false);
        }
    };

    // 3. Filter Logic
    useEffect(() => {
        let result = salaries;

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.eid.toLowerCase().includes(query) || 
                s.ename.toLowerCase().includes(query)
            );
        }

        // Branch Filter
        if (selectedBranch) {
            result = result.filter(s => s.branch_id === selectedBranch || s.branch_name === selectedBranch);
        }

        setFilteredSalaries(result);
        setCurrentPage(1);
    }, [searchQuery, selectedBranch, salaries]);

    // 4. Pagination Logic
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentItems = filteredSalaries.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredSalaries.length / rowsPerPage);

    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);
        if (val !== '' && !isNaN(val) && parseInt(val) > 0) {
            setRowsPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };

    const handleGenerate = () => {
        fetchSalaries();
    };

    return (
        <div className="content-area">
            <div className="page-header">
                <h1>Salaries</h1>
                <div className="salary-subtitle">
                    {selectedMonth ? `${selectedMonth.replace('-', ' ')} Report` : 'Select Month'}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
                {/* Month Selector */}
                <select 
                    className="filter-input"
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{maxWidth:'150px'}}
                >
                    {monthOptions.map(opt => (
                        <option key={opt} value={opt}>{opt.replace('-', ' ')}</option>
                    ))}
                </select>

                <button className="btn-generate" onClick={handleGenerate}>
                    Refresh Data
                </button>

                {/* Search */}
                <input 
                    type="text" 
                    className="filter-input"
                    placeholder="Search by Employee ID or Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Branch Filter */}
                <select 
                    className="filter-input"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                >
                    <option value="">All Branches</option>
                    {branches.map(b => (
                        <option key={b._id} value={b.bid}>{b.b_name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="salary-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Branch</th>
                            <th>Base Salary</th>
                            <th>Commission</th>
                            <th>Total</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>Loading...</td></tr>
                        ) : currentItems.length > 0 ? (
                            currentItems.map((s) => (
                                <tr key={s._id || s.eid}>
                                    <td>{s.eid}</td>
                                    <td>{s.ename}</td>
                                    <td>{s.role}</td>
                                    <td>{s.branch_name}</td>
                                    <td>₹{s.salary.toFixed(2)}</td>
                                    <td>₹{s.commission.toFixed(2)}</td>
                                    <td style={{fontWeight:'bold'}}>₹{s.total.toFixed(2)}</td>
                                    <td className="note-text">{s.note}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="8" style={{textAlign:'center', padding:'30px', color:'#666'}}>No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredSalaries.length > 0 && (
                <div className="pagination-controls">
                    <div style={{display:'flex', alignItems:'center', gap:'10px', color:'#636e72', fontSize:'0.9rem'}}>
                        <span>Rows per page:</span>
                        <input 
                            type="number" 
                            min="1" 
                            value={rowsInput} 
                            onChange={handleRowsChange}
                            className="rows-input"
                        />
                    </div>
                    
                    <div style={{display:'flex', alignItems:'center'}}>
                        <button 
                            className="btn-page"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span style={{margin:'0 15px', fontSize:'0.9rem', color:'#2d3436'}}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            className="btn-page"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryList;