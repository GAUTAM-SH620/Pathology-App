import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Report } from '../../types';
import * as api from '../../services/mockApi';
import { Search } from '../../components/icons';
import { generateReportPDF } from '../../utils/pdfGenerator';
// FIX: The 'QRCode' component is not a named export. Using 'QRCodeCanvas' and aliasing it.
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const AllReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        api.fetchReports().then(data => {
            setReports(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setLoading(false);
        });
    }, []);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  report.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  report.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = !dateFilter || report.date === dateFilter;
            return matchesSearch && matchesDate;
        });
    }, [reports, searchTerm, dateFilter]);

    const handleDownload = async (report: Report) => {
        const portalLink = `${window.location.origin}/#/patient-report/${report.patientId}/${report.id}`;
        // Create QR code as a data URL to pass to the PDF generator
        const canvas = document.getElementById(`qr-code-${report.id}`) as HTMLCanvasElement;
        if (canvas) {
            const qrCodeDataURL = canvas.toDataURL("image/png");
            await generateReportPDF(report, qrCodeDataURL);
        }
    };
    
    return (
        <AdminLayout title="All Reports">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Search by Patient Name, ID, or Report ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="p-2 pl-10 border rounded-md w-full focus:ring-2 focus:ring-brand-blue"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="p-2 border rounded-md w-full md:w-auto focus:ring-2 focus:ring-brand-blue"
                    />
                </div>

                {loading ? (
                    <p>Loading reports...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Report ID</th>
                                    <th scope="col" className="px-6 py-3">Patient ID</th>
                                    <th scope="col" className="px-6 py-3">Patient Name</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map(report => (
                                    <tr key={report.id} className="bg-white border-b">
                                        <td className="px-6 py-4 font-medium text-gray-900">{report.id}</td>
                                        <td className="px-6 py-4">{report.patientId}</td>
                                        <td className="px-6 py-4">{report.patientName}</td>
                                        <td className="px-6 py-4">{report.date}</td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleDownload(report)}
                                                className="font-medium text-brand-blue hover:underline"
                                            >
                                                Download PDF
                                            </button>
                                            <div className="hidden">
                                                 <QRCode id={`qr-code-${report.id}`} value={`${window.location.origin}/#/patient-report/${report.patientId}/${report.id}`} size={128} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredReports.length === 0 && <p className="text-center p-4">No reports found.</p>}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AllReportsPage;