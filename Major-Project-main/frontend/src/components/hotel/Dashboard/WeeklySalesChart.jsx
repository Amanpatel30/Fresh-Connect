import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklySalesChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  
  const demoData = [
    { name: 'Sun', sales: 1200 },
    { name: 'Mon', sales: 1900 },
    { name: 'Tue', sales: 1500 },
    { name: 'Wed', sales: 2100 },
    { name: 'Thu', sales: 1800 },
    { name: 'Fri', sales: 2400 },
    { name: 'Sat', sales: 2000 }
  ];
  
  useEffect(() => {
    console.log('Raw data passed to WeeklySalesChart:', data);
    
    // Check if we have valid data array and at least one non-zero sales value
    const hasValidData = data && 
                        Array.isArray(data) && 
                        data.length > 0 && 
                        data.some(item => (item.sales || 0) > 0);
    
    if (hasValidData) {
      setChartData(data.map(item => ({
        name: item.day,
        sales: item.sales || 0
      })));
    } else {
      // Show demo data when no data or all zeros
      setChartData(demoData);
    }
  }, [data]);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md">
          <p className="font-semibold">{label}</p>
          <p className="text-indigo-600">
            Sales: ${Number(payload[0].value).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Weekly Sales</h2>
      {chartData === demoData && (
        <div className="text-sm text-gray-500 mb-2">
          Showing demo data - Your actual sales data will appear here
        </div>
      )}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#4B5563' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fill: '#4B5563' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar 
              dataKey="sales" 
              fill="#4F46E5" 
              name="Sales" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Debug info */}
      <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
        <p>Debug info:</p>
        <pre>Chart data: {JSON.stringify(chartData, null, 2)}</pre>
        <pre>Original data: {JSON.stringify(data, null, 2)}</pre>
        <p>Using demo data: {chartData === demoData ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default WeeklySalesChart; 