import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-is-mobile';

export default function PassingGradeChart({ data }: any) {
  const isMobile = useIsMobile();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 25,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          interval={0} 
          angle={isMobile ? -45 : 0} 
          textAnchor={isMobile ? "end" : "middle"} 
          fontSize={isMobile ? 10 : 12}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="Nilai"
          fill="#0ea5e9"
          activeBar={<Rectangle fill="#0284c7" stroke="blue" />}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="KKM"
          fill="#cbd5e1"
          activeBar={<Rectangle fill="#94a3b8" stroke="purple" />}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
