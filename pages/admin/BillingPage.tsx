import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Report } from '../../types';
import * as api from '../../services/mockApi';
import { generateBillPDF } from '../../utils/pdfGenerator';
import { CreditCard, DollarSign, Search } from '../../components/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// Augment report with a total property
interface Bill extends Report {
    total: number;
}

const BillingPage: React.FC = () => {
    const [reports, setReports] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.fetchReports().then(data => {
            const bills: Bill[] = data.map(report => ({
                ...report,
                total: report.tests.reduce((acc, test) => acc + test.price, 0)
            })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setReports(bills);
            setLoading(false);
        });
    }, []);

    const filteredReports = useMemo(() => {
        return reports.filter(report =>
            report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reports, searchTerm]);
    
    const totalRevenue = useMemo(() => {
        return reports.reduce((acc, bill) => acc + bill.total, 0);
    }, [reports]);

    const chartData = useMemo(() => {
        // Show latest 10 bills in chart
        return filteredReports.slice(0, 10).reverse();
    }, [filteredReports]);

    if (loading) {
        return (
            <AdminLayout title="Billing Dashboard">
                <p>Loading billing information...</p>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Billing Dashboard">
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-semibold text-gray-800">INR {totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Total Bills Generated</p>
                            <p className="text-2xl font-semibold text-gray-800">{reports.length}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Bill List */}
                    <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Bills</h3>
                         <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Search by Patient or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="p-2 pl-10 border rounded-md w-full focus:ring-2 focus:ring-brand-blue"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <div className="overflow-y-auto max-h-[50vh]">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Report ID</th>
                                        <th scope="col" className="px-4 py-3">Patient</th>
                                        <th scope="col" className="px-4 py-3">Amount (INR)</th>
                                        <th scope="col" className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.map(report => (
                                        <tr key={report.id} className="bg-white border-b">
                                            <td className="px-4 py-3 font-medium text-gray-900">{report.id}</td>
                                            <td className="px-4 py-3">{report.patientName}</td>
                                            <td className="px-4 py-3 font-semibold">{report.total.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => generateBillPDF(report)}
                                                    className="font-medium text-brand-blue hover:underline text-xs"
                                                >
                                                    Generate PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredReports.length === 0 && <p className="text-center p-4">No bills found.</p>}
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bill Amounts</h3>
                         <div className="w-full h-96">
                            <ResponsiveContainer>
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="patientName" type="category" width={80} tick={{ fontSize: 10 }} />
                                    <Tooltip formatter={(value: number) => `INR ${value.toFixed(2)}`} />
                                    <Legend />
                                    <Bar dataKey="total" fill="#0A7AFF" name="Bill Amount" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BillingPage;