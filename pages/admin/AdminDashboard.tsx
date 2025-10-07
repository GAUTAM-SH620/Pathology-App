import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Patient } from '../../types';
import * as api from '../../services/mockApi';
import { UserPlus } from '../../components/icons';

const AddPatientForm: React.FC<{ onPatientAdded: (patient: Patient) => void }> = ({ onPatientAdded }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
    const [contact, setContact] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        try {
            const newPatient = await api.addPatient({ name, age: parseInt(age), gender, contact });
            onPatientAdded(newPatient);
            setMessage(`Patient ${newPatient.name} (ID: ${newPatient.id}) added successfully!`);
            // Reset form
            setName(''); setAge(''); setGender('Male'); setContact('');
        } catch (error) {
            setMessage('Failed to add patient.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><UserPlus className="w-6 h-6 mr-2 text-brand-blue" />Add New Patient</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="p-2 border rounded-md focus:ring-2 focus:ring-brand-blue" />
                <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} required className="p-2 border rounded-md focus:ring-2 focus:ring-brand-blue" />
                <select value={gender} onChange={e => setGender(e.target.value as any)} className="p-2 border rounded-md focus:ring-2 focus:ring-brand-blue bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <input type="tel" placeholder="Contact Number" value={contact} onChange={e => setContact(e.target.value)} required className="p-2 border rounded-md focus:ring-2 focus:ring-brand-blue" />
                <div className="md:col-span-2">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-brand-blue text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300">
                        {isSubmitting ? 'Adding...' : 'Add Patient'}
                    </button>
                </div>
            </form>
            {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        </div>
    );
};

const PatientList: React.FC<{ patients: Patient[] }> = ({ patients }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recently Added Patients</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Patient ID</th>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Age</th>
                        <th scope="col" className="px-6 py-3">Gender</th>
                        <th scope="col" className="px-6 py-3">Contact</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.slice(0, 5).map(p => (
                        <tr key={p.id} className="bg-white border-b">
                            <td className="px-6 py-4 font-medium text-gray-900">{p.id}</td>
                            <td className="px-6 py-4">{p.name}</td>
                            <td className="px-6 py-4">{p.age}</td>
                            <td className="px-6 py-4">{p.gender}</td>
                            <td className="px-6 py-4">{p.contact}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        api.fetchPatients().then(data => setPatients(data.reverse()));
    }, []);

    const handlePatientAdded = (newPatient: Patient) => {
        setPatients(prev => [newPatient, ...prev]);
    };

    return (
        <AdminLayout title="Dashboard">
            <div className="space-y-6">
                <AddPatientForm onPatientAdded={handlePatientAdded} />
                <PatientList patients={patients} />
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;