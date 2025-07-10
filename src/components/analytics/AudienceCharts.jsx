import React from 'react';
import StudioPanel from '../StudioPanel';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import { cn } from '@/lib/utils';
import AnimatedIcon from '../AnimatedIcon';

const GENDER_COLORS = { male: '#3b82f6', female: '#ec4899', other: '#a855f7' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-sm text-purple-600">{`${payload[0].name}: ${payload[0].value.toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
        {payload.gender}
      </text>
       <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#64748b" className="font-semibold text-xl">
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export default function AudienceCharts({ genderData, countryData, platform }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const hasGenderData = genderData && genderData.length > 0;
  const hasCountryData = countryData && countryData.length > 0;

  if (!hasGenderData && !hasCountryData) {
      return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {hasGenderData && (
        <StudioPanel className="p-6 lg:col-span-2 min-h-[300px]">
           <h3 className="text-lg font-semibold text-slate-900 mb-4">Audience Gender</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      dataKey="percentage"
                      onMouseEnter={onPieEnter}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.gender.toLowerCase()] || GENDER_COLORS.other} />
                      ))}
                    </Pie>
                  </PieChart>
              </ResponsiveContainer>
        </StudioPanel>
      )}
      {hasCountryData && (
        <StudioPanel className={cn(
            "p-6 min-h-[300px]",
            hasGenderData ? "lg:col-span-3" : "lg:col-span-5"
        )}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Countries</h3>
            <ResponsiveContainer width="100%" height={300}>
               <RechartsBarChart data={countryData} layout="vertical" margin={{ left: 25 }}>
                   <XAxis type="number" hide />
                   <YAxis 
                     type="category" 
                     dataKey="country" 
                     stroke="#94a3b8" 
                     fontSize={12} 
                     tickLine={false} 
                     axisLine={false}
                     width={80}
                   />
                   <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(238, 235, 255, 0.5)' }} />
                   <Bar dataKey="percentage" name="Audience %" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
               </RechartsBarChart>
            </ResponsiveContainer>
        </StudioPanel>
      )}
    </div>
  );
}