'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button } from '@heroui/react';

export default function UpdateProgressPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-2xl font-bold">Update Progress Program Kerja</h1>
              <p className="text-gray-600">Form untuk update progress program kerja</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Update Progress</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            Fitur update progress akan tersedia setelah setup token atau sistem authentikasi.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
