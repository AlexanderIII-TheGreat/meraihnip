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
          Benar: item.correct,
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
          tick={false}
        />

        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="Benar"
          fill="#82ca9d"
          activeBar={<Rectangle fill="gold" stroke="purple" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
