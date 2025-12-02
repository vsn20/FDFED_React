import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../api/api';

const ProfitDashboard = () => {
    // Data State
    const [monthOptions, setMonthOptions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [profitsData, setProfitsData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter & Pagination State
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage, setCardsPerPage] = useState(5);
    const [rowsInput, setRowsInput] = useState("5");

    // 1. Initialize Month Dropdown
    useEffect(() => {
        const options = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();

        for (let i = 1; i <= 6; i++) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            options.push(`${monthNames[d.getMonth()]}-${d.getFullYear()}`);
        }
        setMonthOptions(options);
        if (options.length > 0) setSelectedMonth(options[0]);
    }, []);

    // 2. Fetch Data
    useEffect(() => {
        if (selectedMonth) fetchData();
    }, [selectedMonth]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/owner/profits?monthYear=${selectedMonth}`);
            setProfitsData(res.data.profits);
        } catch (err) {
            console.error("Error fetching profits:", err);
            setProfitsData([]);
        } finally {
            setLoading(false);
        }
    };

    // 3. Calculation: Grand Total
    const totalProfit = useMemo(() => {
        return profitsData.reduce((sum, item) => sum + item.net_profit, 0);
    }, [profitsData]);

    // 4. Filter Logic (Search by Branch Name/ID)
    const filteredBranches = useMemo(() => {
        if (!searchQuery.trim()) return profitsData;
        const query = searchQuery.toLowerCase();
        return profitsData.filter(item => 
            item.branch_name.toLowerCase().includes(query) || 
            item.branch_id.toLowerCase().includes(query)
        );
    }, [searchQuery, profitsData]);

    // 5. Pagination Logic
    const indexOfLast = currentPage * cardsPerPage;
    const indexOfFirst = indexOfLast - cardsPerPage;
    const currentCards = filteredBranches.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredBranches.length / cardsPerPage);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedMonth]);

    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);
        if (val !== '' && !isNaN(val) && parseInt(val) > 0) {
            setCardsPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };

    const formatCurrency = (val) => {
        return `₹${Math.abs(val).toLocaleString()}`;
    };

    return (
        <div className="content-area">
            <h2>Profits</h2>
            <div className="page-header">               
                <h2>{selectedMonth.replace('-', ' ')} Report</h2>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
                <div className="control-group">
                    <select 
                        className="month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {monthOptions.map(opt => (
                            <option key={opt} value={opt}>{opt.replace('-', ' ')}</option>
                        ))}
                    </select>
                   
                </div>

                <div className="control-group" style={{justifyContent: 'flex-end'}}>
                    <input 
                        type="text" 
                        className="filter-input"
                        placeholder="Search Branch Name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                 <button className="btn-generate" onClick={fetchData}>Reset</button>
            </div>

            {loading ? (
                <div style={{textAlign:'center', padding:'40px'}}>Loading Profit Data...</div>
            ) : (
                <>
                    {/* Profit Cards Grid */}
                    <div className="profit-cards-grid">
                        {/* 1. Grand Total Card (Always Visible) */}
                        <div className="profit-card total-card">
                            <h3>Total Net Profit</h3>
                            <p className={totalProfit < 0 ? 'negative' : ''}>
                                {totalProfit < 0 ? '-' : ''}{formatCurrency(totalProfit)}
                            </p>
                        </div>

                        {/* 2. Branch Cards */}
                        {currentCards.length > 0 ? (
                            currentCards.map((branch) => (
                                <div className="profit-card" key={branch.branch_id}>
                                    <h3>{branch.branch_name} ({branch.branch_id})</h3>
                                    <p className={branch.net_profit < 0 ? 'negative' : ''}>
                                        {branch.net_profit < 0 ? '-' : ''}{formatCurrency(branch.net_profit)}
                                    </p>
                                    <div style={{fontSize:'0.85rem', color:'#666', marginTop:'5px'}}>
                                        Sales: {branch.sale_count} | Exp: {formatCurrency(branch.expenses)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{gridColumn:'1/-1', textAlign:'center', padding:'20px', color:'#666'}}>
                                No branches found matching your search.
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {filteredBranches.length > 0 && (
                        <div className="pagination-controls">
                            <div style={{display:'flex', alignItems:'center', gap:'10px', color:'#636e72', fontSize:'0.9rem'}}>
                                <span>Cards per page:</span>
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
                </>
            )}
        </div>
    );
};

export default ProfitDashboard;