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
          fill="#82ca9d"
          activeBar={<Rectangle fill="#60f789" stroke="blue" />}
        />
        <Bar
          dataKey="KKM"
          fill="#ecbbb2"
          activeBar={<Rectangle fill="#ff856c" stroke="purple" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
