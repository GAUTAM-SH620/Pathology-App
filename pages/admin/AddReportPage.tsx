import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Patient, TestPrice, TestResult, Report } from '../../types';
import * as api from '../../services/mockApi';
import { Trash2 } from '../../components/icons';
import { generateReportPDF } from '../../utils/pdfGenerator';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const AddReportPage: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [allTests, setAllTests] = useState<TestPrice[]>([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [refByDr, setRefByDr] = useState('Dr. Self');
    const [selectedTests, setSelectedTests] = useState<TestResult[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [lastGeneratedReport, setLastGeneratedReport] = useState<Report | null>(null);

    useEffect(() => {
        api.fetchPatients().then(setPatients);
        api.fetchTestPrices().then(setAllTests);
    }, []);

    useEffect(() => {
        if (lastGeneratedReport) {
            const generatePdf = async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
                const canvas = document.getElementById('qr-code-new') as HTMLCanvasElement;
                if (canvas) {
                    const qrCodeDataURL = canvas.toDataURL("image/png");
                    await generateReportPDF(lastGeneratedReport, qrCodeDataURL);
                }
            };
            generatePdf();
        }
    }, [lastGeneratedReport]);

    const handleAddTest = (testId: string) => {
        const testToAdd = allTests.find(t => t.id === testId);
        if (testToAdd && !selectedTests.some(t => t.testName === testToAdd.name)) {
            setSelectedTests(prev => [...prev, {
                testName: testToAdd.name,
                result: '',
                normalRange: testToAdd.normalRange,
                price: testToAdd.price
            }]);
        }
    };

    const handleRemoveTest = (testName: string) => {
        setSelectedTests(prev => prev.filter(t => t.testName !== testName));
    };

    const handleResultChange = (testName: string, value: string, field: 'result' | 'normalRange') => {
        setSelectedTests(prev => prev.map(t => t.testName === testName ? { ...t, [field]: value } : t));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient || selectedTests.length === 0) {
            setMessage('Please select a patient and add at least one test.');
            return;
        }
        setIsSubmitting(true);
        setMessage('');

        try {
            const newReport = await api.addReport({
                patientId: selectedPatient,
                refByDr,
                tests: selectedTests
            });
            setMessage(`Report ${newReport.id} created successfully!`);
            setLastGeneratedReport(newReport);
            
            // Reset form
            setSelectedPatient('');
            setSelectedTests([]);
            setRefByDr('Dr. Self');

        } catch (error) {
            setMessage('Failed to create report.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <AdminLayout title="Add New Report">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient & Tests</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={selectedPatient}
                            onChange={e => setSelectedPatient(e.target.value)}
                            required
                            className="p-2 border rounded-md focus:ring-2 focus:ring-brand-blue bg-white"
                        >
                            <option value="">-- Select Patient --</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="Referred by Dr."
                            value={refByDr}
                            onChange={e => setRefByDr(e.target.value)}
                            required
                            className="p-2 border rounded-md focus:ring-2 focus:ring-brand-blue"
                        />
                         <div className="md:col-span-2">
                            <select
                                onChange={e => handleAddTest(e.target.value)}
                                value=""
                                className="p-2 border rounded-md focus:ring-2 focus:ring-brand-blue bg-white w-full"
                            >
                                <option value="">-- Add a Test to the Report --</option>
                                {allTests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {selectedTests.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Details</h3>
                        <div className="space-y-4">
                            {selectedTests.map((test, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4">
                                    <p className="font-medium col-span-4 md:col-span-1">{test.testName}</p>
                                    <input type="text" placeholder="Result" value={test.result} onChange={e => handleResultChange(test.testName, e.target.value, 'result')} required className="p-2 border rounded-md focus:ring-2 focus:ring-brand-blue" />
                                    <input type="text" placeholder="Normal Range" value={test.normalRange} onChange={e => handleResultChange(test.testName, e.target.value, 'normalRange')} className="p-2 border rounded-md focus:ring-2 focus:ring-brand-blue" />
                                    <button type="button" onClick={() => handleRemoveTest(test.testName)} className="text-red-500 hover:text-red-700 justify-self-end">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                 <div className="flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="bg-brand-blue text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:bg-blue-300">
                        {isSubmitting ? 'Saving...' : 'Save & Generate Report PDF'}
                    </button>
                </div>
                {message && <p className="mt-4 text-center text-green-600">{message}</p>}
                
                { lastGeneratedReport && <div className="hidden"><QRCode id="qr-code-new" value={`${window.location.origin}/#/patient-report/${lastGeneratedReport.patientId}/${lastGeneratedReport.id}`} size={128} /></div>}
            </form>
        </AdminLayout>
    );
};

export default AddReportPage;