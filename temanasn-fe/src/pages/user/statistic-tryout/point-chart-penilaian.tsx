import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-is-mobile';

interface PointFrequencyItem {
  point: number;
  frequency: number;
}

interface InputObject {
  pointFrequency?: PointFrequencyItem[];
  correct?: number;
  duration?: number;
  subcategory?: string;
}

interface MappedObject {
  [key: string]: number | string;
  correct: number;
  duration: number;
  subcategory: string;
}

function mapObject(inputObject: InputObject): MappedObject {
  const mappedObject: MappedObject = {
    correct: inputObject.correct || 0,
    duration: inputObject.duration || 0,
    subcategory: inputObject.subcategory || '',
  };

  if (inputObject.pointFrequency && Array.isArray(inputObject.pointFrequency)) {
    inputObject.pointFrequency.forEach((item: PointFrequencyItem) => {
      const propertyName = `point-${item.point}`;
      mappedObject[propertyName] = item.frequency;
    });
  }

  return mappedObject;
}

export default function PointChartPenilaian({ data }: any) {
  const isMobile = useIsMobile();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data?.map((item: any) => {
          return mapObject(item);
        })}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 25,
        }}
      >
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
        <XAxis 
          dataKey="subcategory" 
          type="category" 
          scale="band" 
          interval={0} 
          angle={isMobile ? -45 : 0} 
          textAnchor={isMobile ? "end" : "middle"} 
          fontSize={isMobile ? 10 : 12}
        />
        <YAxis type="number" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.98)', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: '12px',
            fontFamily: 'Poppins, sans-serif'
          }} 
        />
        <Legend />
        <Bar dataKey="point-5" name="5 Point" stackId="points" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="point-4" name="4 Point" stackId="points" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="point-3" name="3 Point" stackId="points" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="point-2" name="2 Point" stackId="points" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        <Bar dataKey="point-1" name="1 Point" stackId="points" fill="#93c5fd" radius={[4, 4, 0, 0]} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
