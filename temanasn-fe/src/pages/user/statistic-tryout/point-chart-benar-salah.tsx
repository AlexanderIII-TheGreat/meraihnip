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

export default function PointChartBenarSalah({ data }: any) {
  const isMobile = useIsMobile();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data?.map((item: any) => ({
          name: item.subcategory,
          Benar: item.correct || 0,
          Salah: item.wrong || 0,
        }))}
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
          dataKey="Benar"
          fill="#0ea5e9"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="Salah"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
