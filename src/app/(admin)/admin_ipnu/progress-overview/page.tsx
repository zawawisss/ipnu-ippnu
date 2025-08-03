'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';

export default function ProgressOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [organisasi, setOrganisasi] = useState('IPNU');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-2xl font-bold">Progress Overview Program Kerja</h1>
              <p className="text-gray-600">Monitoring progress semua program kerja PC IPNU Ponorogo</p>
            </div>
            
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardBody className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Total Program</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">On Track</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-4">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">At Risk</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-4">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-sm text-gray-600">Behind</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">0%</div>
            <div className="text-sm text-gray-600">Rata-rata</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Progress Detail (0 Program)</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            Belum ada data program kerja. Silakan tambahkan program kerja terlebih dahulu.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
