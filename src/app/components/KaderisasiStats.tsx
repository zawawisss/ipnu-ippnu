import React, { useEffect, useState } from 'react';
import StatisticsCard from './statistik';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const KaderisasiStats = () => {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [totalStats, setTotalStats] = useState({ ipnu: 0, ippnu: 0, total: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/kaderisasi-recap');
        const data = await response.json();
        setMonthlyStats(data);

        // Calculate total stats from monthly data
        const ipnuTotal = data.reduce((sum: number, entry: any) => sum + entry.ipnu, 0);
        const ippnuTotal = data.reduce((sum: number, entry: any) => sum + entry.ippnu, 0);
        setTotalStats({ ipnu: ipnuTotal, ippnu: ippnuTotal, total: ipnuTotal + ippnuTotal });

      } catch (error) {
        console.error('Failed to fetch kaderisasi stats:', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-lg sm:text-xl font-bold mb-4">Rekapitulasi Alumni MAKESTA</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatisticsCard title="Alumni MAKESTA IPNU" value={totalStats.ipnu} icon="lucide:user-check" color="primary" />
          <StatisticsCard title="Alumni MAKESTA IPPNU" value={totalStats.ippnu} icon="lucide:user-check" color="success" />
          <StatisticsCard title="Total Alumni MAKESTA" value={totalStats.total} icon="lucide:users" color="warning" />
        </div>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyStats}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ipnu" stackId="a" fill="#0088FE" name="IPNU" />
              <Bar dataKey="ippnu" stackId="a" fill="#00C49F" name="IPPNU" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KaderisasiStats;
