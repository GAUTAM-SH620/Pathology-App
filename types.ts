export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
}

export interface TestResult {
  testName: string;
  result: string;
  normalRange: string;
  price: number;
}

export interface Report {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  date: string;
  refByDr: string;
  tests: TestResult[];
}

export interface TestPrice {
  id: string;
  name: string;
  price: number;
  normalRange: string;
}