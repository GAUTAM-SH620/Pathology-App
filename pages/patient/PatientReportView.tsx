import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../services/mockApi';
import { Report } from '../../types';
import { generateReportPDF } from '../../utils/pdfGenerator';
// FIX: The 'QRCode' component is not a named export. Using 'QRCodeCanvas' and aliasing it.
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const PatientReportView: React.FC = () => {
    const { patientId, reportId } = useParams<{ patientId: string; reportId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (patientId && reportId) {
            api.fetchReportForPatient(patientId, reportId)
                .then(data => {
                    if (data) {
                        setReport(data);
                    } else {
                        setError('Report not found or invalid Patient ID.');
                    }
                })
                .catch(() => setError('An error occurred while fetching your report.'))
                .finally(() => setLoading(false));
        }
    }, [patientId, reportId]);
    
    const handleDownload = async () => {
        if (!report) return;
        const portalLink = `${window.location.origin}/#/patient-report/${report.patientId}/${report.id}`;
        const canvas = document.getElementById('qr-code-patient') as HTMLCanvasElement;
        if (canvas) {
            const qrCodeDataURL = canvas.toDataURL("image/png");
            await generateReportPDF(report, qrCodeDataURL);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-dark">PathoLab Pro</h1>
                        <p className="text-brand-gray">Your Health, Our Priority.</p>
                    </div>
                    <button onClick={() => navigate('/patient-portal')} className="text-sm text-brand-blue hover:underline">Back to Portal</button>
                 </div>
                 <hr className="my-6"/>
                 
                 {loading && <p>Loading your report...</p>}
                 {error && <p className="text-red-500">{error}</p>}

                 {report && (
                     <div>
                         <div className="flex justify-between items-center mb-4">
                             <h2 className="text-xl font-semibold">Report for {report.patientName}</h2>
                             <button onClick={handleDownload} className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600">Download PDF</button>
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                             <p><strong>Patient ID:</strong> {report.patientId}</p>
                             <p><strong>Report ID:</strong> {report.id}</p>
                             <p><strong>Report Date:</strong> {report.date}</p>
                         </div>

                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Test Name</th>
                                        <th scope="col" className="px-6 py-3">Result</th>
                                        <th scope="col" className="px-6 py-3">Normal Range</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.tests.map((test, index) => (
                                        <tr key={index} className="bg-white border-b">
                                            <td className="px-6 py-4 font-medium text-gray-900">{test.testName}</td>
                                            <td className="px-6 py-4">{test.result}</td>
                                            <td className="px-6 py-4">{test.normalRange}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                         {/* Hidden QR for PDF generation */}
                         <div className="hidden">
                             <QRCode id="qr-code-patient" value={`${window.location.origin}/#/patient-report/${report.patientId}/${report.id}`} size={128} />
                         </div>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default PatientReportView;