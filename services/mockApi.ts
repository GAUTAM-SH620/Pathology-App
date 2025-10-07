import { Patient, Report, TestPrice } from '../types';
import { HEALTH_TESTS, MOCK_PATIENTS, MOCK_REPORTS } from '../constants';

// In-memory "database"
let patients: Patient[] = [...MOCK_PATIENTS];
let reports: Report[] = [...MOCK_REPORTS];
let testPrices: TestPrice[] = [...HEALTH_TESTS];

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchPatients = async (): Promise<Patient[]> => {
  await simulateDelay(500);
  return [...patients];
};

export const addPatient = async (patientData: Omit<Patient, 'id'>): Promise<Patient> => {
  await simulateDelay(500);
  const newPatient: Patient = {
    ...patientData,
    id: `P${String(patients.length + 1).padStart(3, '0')}`,
  };
  patients.push(newPatient);
  return newPatient;
};

export const fetchReports = async (): Promise<Report[]> => {
  await simulateDelay(800);
  return [...reports];
};

export const fetchReportForPatient = async (patientId: string, reportId: string): Promise<Report | undefined> => {
    await simulateDelay(500);
    return reports.find(r => r.patientId === patientId && r.id === reportId);
}

export const addReport = async (reportData: Omit<Report, 'id' | 'patientName' | 'date' | 'patientAge' | 'patientGender'>): Promise<Report> => {
    await simulateDelay(1000);
    const patient = patients.find(p => p.id === reportData.patientId);
    if (!patient) throw new Error('Patient not found');
    const newReport: Report = {
        ...reportData,
        id: `R${String(reports.length + 1).padStart(3, '0')}`,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        date: new Date().toISOString().split('T')[0]
    };
    reports.push(newReport);
    return newReport;
}

export const fetchTestPrices = async (): Promise<TestPrice[]> => {
    await simulateDelay(300);
    return [...testPrices];
}

export const updateTestPrice = async (testId: string, newPrice: number): Promise<TestPrice> => {
    await simulateDelay(200);
    const testIndex = testPrices.findIndex(t => t.id === testId);
    if (testIndex === -1) {
        throw new Error('Test not found');
    }
    // Create a new object to avoid mutating a read-only object from constants.
    const updatedTest = {
        ...testPrices[testIndex],
        price: newPrice,
    };
    // Replace the old object with the updated one.
    testPrices[testIndex] = updatedTest;
    return updatedTest;
}

export const addTestPrice = async (testData: Omit<TestPrice, 'id'>): Promise<TestPrice> => {
    await simulateDelay(500);
    const newTest: TestPrice = {
        ...testData,
        id: `T${String(testPrices.length + 1).padStart(3, '0')}`,
    };
    testPrices.push(newTest);
    return newTest;
}