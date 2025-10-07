import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { TestPrice } from '../../types';
import * as api from '../../services/mockApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon, PlusCircle } from '../../components/icons';


const AddTestForm: React.FC<{ onTestAdded: (test: TestPrice) => void }> = ({ onTestAdded }) => {
    const [name, setName] = useState('');
    const [normalRange, setNormalRange] = useState('');
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            const newTest = await api.addTestPrice({
                name,
                normalRange,
                price: parseFloat(price)
            });
            onTestAdded(newTest);
            setMessage(`Test "${newTest.name}" added successfully!`);
            // Reset form
            setName('');
            setNormalRange('');
            setPrice('');
        } catch (error) {
            setMessage('Failed to add test.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                <PlusCircle className="w-5 h-5 mr-2 text-brand-blue" /> Add New Test
            </h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-3 lg:col-span-1">
                    <label htmlFor="testName" className="block text-sm font-medium text-gray-700">Test Name</label>
                    <input type="text" id="testName" placeholder="e.g., Vitamin B12" value={name} onChange={e => setName(e.target.value)} required className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div>
                     <label htmlFor="normalRange" className="block text-sm font-medium text-gray-700">Normal Range</label>
                    <input type="text" id="normalRange" placeholder="e.g., 190-950 pg/mL" value={normalRange} onChange={e => setNormalRange(e.target.value)} required className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (INR)</label>
                    <input type="number" id="price" placeholder="e.g., 1000" value={price} onChange={e => setPrice(e.target.value)} required className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div className="md:col-span-3">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-brand-blue text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300">
                        {isSubmitting ? 'Adding...' : 'Add Test'}
                    </button>
                </div>
            </form>
             {message && <p className={`mt-3 text-center text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
        </div>
    );
};


const PricingPage: React.FC = () => {
    const [testPrices, setTestPrices] = useState<TestPrice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.fetchTestPrices().then(data => {
            setTestPrices(data);
            setLoading(false);
        });
    }, []);

    const handlePriceChange = (id: string, newPrice: string) => {
        const price = parseFloat(newPrice);
        if (!isNaN(price)) {
            setTestPrices(prev => prev.map(t => t.id === id ? { ...t, price } : t));
        }
    };
    
    const handlePriceUpdate = (id: string, newPrice: number) => {
        api.updateTestPrice(id, newPrice).then(updatedTest => {
             // Can add a success toast here
        });
    };
    
    const handleTestAdded = (newTest: TestPrice) => {
        setTestPrices(prev => [...prev, newTest]);
    };

    return (
        <AdminLayout title="Test Pricing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Test Prices</h3>
                     <AddTestForm onTestAdded={handleTestAdded} />
                     {loading ? (
                         <p>Loading prices...</p>
                     ) : (
                         <div className="overflow-y-auto max-h-[45vh]">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Test Name</th>
                                        <th scope="col" className="px-6 py-3">Price (INR)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testPrices.map(test => (
                                        <tr key={test.id} className="bg-white border-b">
                                            <td className="px-6 py-4 font-medium text-gray-900">{test.name}</td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={test.price}
                                                    onChange={e => handlePriceChange(test.id, e.target.value)}
                                                    onBlur={e => handlePriceUpdate(test.id, parseFloat(e.target.value))}
                                                    className="w-24 p-1 border rounded-md focus:ring-2 focus:ring-brand-blue"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                     )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BarChartIcon className="w-6 h-6 mr-2 text-brand-blue" />Test Price Distribution</h3>
                    <div className="w-full h-96">
                        <ResponsiveContainer>
                            <BarChart data={testPrices.filter(t => t.price > 0)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="price" fill="#0A7AFF" name="Price (INR)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PricingPage;