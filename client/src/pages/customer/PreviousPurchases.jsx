import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';

const PreviousPurchases = () => {
    const { user } = useContext(AuthContext);
    const [purchases, setPurchases] = useState([]);

    // Dummy Data for now
    useEffect(() => {
        setPurchases([
            {
                _id: '1',
                productName: 'Smart LED TV 55"',
                date: '2023-12-01',
                amount: 45000,
                status: 'Delivered',
                img: 'https://via.placeholder.com/100'
            },
            {
                _id: '2',
                productName: 'Washing Machine 7kg',
                date: '2023-10-15',
                amount: 22000,
                status: 'Delivered',
                img: 'https://via.placeholder.com/100'
            }
        ]);
    }, []);

    const styles = {
        container: { padding: '20px' },
        header: { marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
        card: { 
            background: 'white', 
            borderRadius: '10px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        badge: {
            display: 'inline-block',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.8em',
            background: '#e8f5e9',
            color: '#2e7d32',
            alignSelf: 'flex-start'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Previous Purchases</h1>
                <p>Welcome, {user?.name}</p>
            </div>

            <div style={styles.grid}>
                {purchases.map(item => (
                    <div key={item._id} style={styles.card}>
                        <div style={{display:'flex', gap:'15px'}}>
                            <img src={item.img} alt="Product" style={{width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px'}} />
                            <div>
                                <h3 style={{margin:'0 0 5px 0'}}>{item.productName}</h3>
                                <div style={{color:'#666', fontSize:'0.9em'}}>{item.date}</div>
                            </div>
                        </div>
                        <hr style={{width:'100%', border:'0', borderTop:'1px solid #eee'}}/>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <span style={{fontWeight:'bold', fontSize:'1.1em'}}>₹{item.amount.toLocaleString()}</span>
                            <span style={styles.badge}>{item.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreviousPurchases;