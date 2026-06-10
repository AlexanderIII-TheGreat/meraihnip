import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function CategoryChart({ item, type = 'BENAR_SALAH' }: any) {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  const COLORS =
    type === 'BENAR_SALAH'
      ? ['#0ea5e9', '#ef4444', '#cbd5e1'] // Sky Blue (Correct), Coral Red (Incorrect), Slate Gray (Unanswered)
      : ['#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd']; // Monochromatic blue gradient for points

  const data =
    type === 'BENAR_SALAH'
      ? [
          { name: 'Benar', value: item.answer_right || 0 },
          { name: 'Salah', value: item.answer_wrong || 0 },
          { name: 'Tidak Dijawab', value: item.not_answer || 0 },
        ]
      : [
          { name: '5 Point', value: item.point5 || 0 },
          { name: '4 Point', value: item.point4 || 0 },
          { name: '3 Point', value: item.point3 || 0 },
          { name: '2 Point', value: item.point2 || 0 },
          { name: '1 Point', value: item.point1 || 0 },
        ];

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={60}
          paddingAngle={3}
          cornerRadius={4}
          dataKey="value"
          onMouseEnter={(_, index) => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(-1)}
        >
          {data.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              style={{
                filter: hoveredIndex === index ? 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15))' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </Pie>
        
        {/* Dynamic Center Text */}
        <text 
          x="50%" 
          y="46%" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          style={{ 
            fontSize: '9px', 
            fill: '#94a3b8', 
            fontWeight: 800, 
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
        >
          {hoveredIndex !== -1 ? data[hoveredIndex].name : 'TOTAL'}
        </text>
        <text 
          x="50%" 
          y="58%" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          style={{ 
            fontSize: '18px', 
            fill: '#0f172a', 
            fontWeight: 800, 
            fontFamily: 'Poppins, sans-serif' 
          }}
        >
          {hoveredIndex !== -1 ? data[hoveredIndex].value : total}
        </text>

        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.98)', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            fontSize: '12px',
            fontFamily: 'Poppins, sans-serif'
          }} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
