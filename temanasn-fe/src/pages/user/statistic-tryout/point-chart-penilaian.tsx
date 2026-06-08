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
  // Membuat objek baru yang akan menjadi hasil pemetaan
  const mappedObject: MappedObject = {
    correct: inputObject.correct || 0,
    duration: inputObject.duration || 0,
    subcategory: inputObject.subcategory || '',
  };

  // Menambahkan properti 'point-n': frequency ke objek baru jika pointFrequency ada
  if (inputObject.pointFrequency && Array.isArray(inputObject.pointFrequency)) {
    inputObject.pointFrequency.forEach((item: PointFrequencyItem) => {
      const propertyName = `point-${item.point}`;
      mappedObject[propertyName] = item.frequency;
    });
  }

  return mappedObject;
}
export default function PointChartPenilaian({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        layout="vertical"
        data={data?.map((item: any) => {
          return mapObject(item);
        })}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis type="number" />
        <YAxis
          dataKey="subcategory"
          dy={35}
          type="category"
          scale="band"
          fontSize={12}
          tick={false}
        />

        <Tooltip />
        <Legend />
        <Bar dataKey="point-5" name="5 Point" barSize={20} fill="violet" />
        <Bar dataKey="point-4" name="4 Point" barSize={20} fill="green" />
        <Bar dataKey="point-3" name="3 Point" barSize={20} fill="#ff7300" />
        <Bar dataKey="point-2" name="2 Point" barSize={20} fill="red" />
        <Bar dataKey="point-2" name="2 Point" barSize={20} fill="blue" />
        <Bar
          dataKey="point-1"
          name="1 Point"
          barSize={20}
          stackId="points"
          fill="#413ea0"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
