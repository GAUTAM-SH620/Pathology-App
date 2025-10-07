import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientPortal: React.FC = () => {
    const [patientId, setPatientId] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would validate the patient ID and perhaps a second factor.
        // For this mock, we just navigate to a generic view.
        // The PatientReportView will handle fetching reports for this ID.
        // As a simple example, we can route to a report R001 for patient P001 if typed.
        let reportId = 'R001'; // Default, in real app, you'd fetch available reports.
        if (patientId.toUpperCase() === 'P002') reportId = 'R002';
        
        navigate(`/patient-report/${patientId.toUpperCase()}/${reportId}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-brand-dark">Patient Portal</h2>
                    <p className="mt-2 text-center text-sm text-brand-gray">Access your reports securely.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                     <p className="text-center text-sm text-brand-gray">Enter your Patient ID found on your receipt or report QR to download your report.</p>
                    <div>
                        <input
                            id="patientId"
                            name="patientId"
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                            placeholder="Enter Patient ID (e.g., P001)"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                        >
                            View My Report
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm text-brand-gray">
                    <button onClick={() => navigate('/login')} className="font-medium text-brand-blue hover:text-blue-500">
                        Admin Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientPortal;