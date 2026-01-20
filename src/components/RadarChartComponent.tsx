import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { CultureScores } from '../types';
import { CULTURE_COLORS } from '../data/ocaiQuestions';
import './RadarChartComponent.css';

interface Props {
  currentScores: CultureScores;
  preferredScores: CultureScores;
  title?: string;
}

export default function RadarChartComponent({ currentScores, preferredScores, title }: Props) {
  const data = [
    {
      dimension: 'Hợp tác (Clan)',
      current: currentScores.clan,
      preferred: preferredScores.clan,
      fullMark: 100
    },
    {
      dimension: 'Sáng tạo (Adhocracy)',
      current: currentScores.adhocracy,
      preferred: preferredScores.adhocracy,
      fullMark: 100
    },
    {
      dimension: 'Cạnh tranh (Market)',
      current: currentScores.market,
      preferred: preferredScores.market,
      fullMark: 100
    },
    {
      dimension: 'Kiểm soát (Hierarchy)',
      current: currentScores.hierarchy,
      preferred: preferredScores.hierarchy,
      fullMark: 100
    }
  ];

  return (
    <div className="radar-chart-container">
      {title && <h3 className="radar-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid 
            stroke="rgba(255,255,255,0.2)" 
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="dimension" 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            stroke="rgba(255,255,255,0.3)"
          />
          <PolarRadiusAxis 
            angle={45} 
            domain={[0, 50]} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            stroke="rgba(255,255,255,0.1)"
          />
          <Radar
            name="Hiện tại"
            dataKey="current"
            stroke={CULTURE_COLORS.clan}
            fill={CULTURE_COLORS.clan}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Mong muốn"
            dataKey="preferred"
            stroke={CULTURE_COLORS.adhocracy}
            fill={CULTURE_COLORS.adhocracy}
            fillOpacity={0.3}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="radar-legend">
        <div className="legend-item">
          <span className="legend-dot current"></span>
          <span>Văn hóa hiện tại</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot preferred"></span>
          <span>Văn hóa mong muốn</span>
        </div>
      </div>
    </div>
  );
}
