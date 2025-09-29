import React from 'react'
import { useState,useEffect } from 'react';
import api from '../../api/api';
import AddCompany from './Company/AddCompany';
import CompanyDetails from './Company/CompanyDetails';
const CompanyPage = () => {
    const[companies,setCompanies]=useState([]);
    const [addcompany,setaddcompany]=useState(false);
    const [singlecompany,setSinglecompany]=useState(null);
    useEffect(()=>{
        fetchCompanies();
    },[]);
    const fetchCompanies=async()=>{
        try{
            const res=await api.get('/companies');
            setCompanies(res.data);
        }catch(err){
            console.error("Error fetching companies:",err);
        }
    }
    const handleAddCompany=()=>{
        setaddcompany(true);
        setSinglecompany(null);
    }
    const handleback=()=>{
        setaddcompany(false);
        fetchCompanies();
        setSinglecompany(null);
    };
    const handlerowclick=(id)=>{
        setSinglecompany(id);
        setaddcompany(false);
        // navigate(`/owner/employees/edit/${id}`);
    }
  return (
    <div>
        <h1>Companies</h1>
        
        {addcompany && !singlecompany &&
        <>
        <button onClick={handleback}>back to list</button>
        <AddCompany />
        </>
        // <AddCompany />
        }
        {singlecompany && !addcompany &&(
            <>
            <button onClick={handleback}>back to list</button>
            <CompanyDetails 
            id={singlecompany}
            handleback={handleback}
            />
            </>
        )}
        {!addcompany && !singlecompany &&
        <>
        <button onClick={()=>{handleAddCompany()}}>Add Company</button>
           <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Company ID</th>
                        <th>Company Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map((company) => (
                        <tr key={company._id} onClick={() => handlerowclick(company.c_id)} style={{ cursor: 'pointer' }}>
                            <td>{company.c_id}</td>
                            <td>{company.cname}</td>
                            <td>{company.email}</td>
                            <td>{company.phone}</td>
                            <td>{company.address}</td>
                        </tr>
                  ))}
                </tbody>
            </table>
        </>
      }
       
    </div>
    
  )
}

export default CompanyPage