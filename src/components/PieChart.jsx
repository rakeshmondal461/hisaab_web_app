import React, { useState } from 'react';

const CATEGORY_COLORS = [
  '#477CFF', // Rent / Blue
  '#FF7E67', // Food / Coral
  '#FFDE4C', // Utilities / Yellow
  '#C455FF', // Leisure / Violet
  '#4CAF82', // Green
  '#FF9F43', // Orange
  '#A29BFE', // Purple-blue
];

export default function PieChart({ data, symbol }) {
  const [touched, setTouched] = useState(-1);
  if (!data || data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;

  const sizeWidth = 320, sizeHeight = 240;
  const cx = 160, cy = 120, R = 75;
  let currentAngle = -Math.PI / 2;
  const isSingle = data.length === 1 || data.some(d => d.value === total);

  const slices = data.map((d, i) => {
    const pct = ((d.value / total) * 100).toFixed(0);
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    currentAngle += angle;
    const endAngle = currentAngle;
    const midAngle = startAngle + angle / 2;

    // Wedge path for solid pie chart
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    
    // Wedge path syntax: Move to center, line to start, arc to end, close (line to center)
    const path = `M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} Z`;

    // Percentage placement inside slice (58% of radius)
    const pctR = R * 0.58;
    const pctX = cx + pctR * Math.cos(midAngle);
    const pctY = cy + pctR * Math.sin(midAngle);

    // Label placement outside slice (1.25 times radius)
    const labelR = R * 1.25;
    const labelX = cx + labelR * Math.cos(midAngle);
    const labelY = cy + labelR * Math.sin(midAngle);

    // Label text anchor alignment
    let textAnchor = 'middle';
    if (Math.cos(midAngle) > 0.15) textAnchor = 'start';
    else if (Math.cos(midAngle) < -0.15) textAnchor = 'end';

    return {
      ...d,
      path,
      pct,
      pctX,
      pctY,
      labelX,
      labelY,
      textAnchor,
      midAngle,
      isSingle: d.value === total || isSingle
    };
  });

  return (
    <div className="pie-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '8px 0' }}>
      <svg
        viewBox={`0 0 ${sizeWidth} ${sizeHeight}`}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: `${sizeWidth}px`,
          overflow: 'visible',
        }}
      >
        {slices.map((s, i) => {
          const color = s.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          const isHovered = touched === i;
          const transformStyle = {
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'all 0.25s ease-out',
            cursor: 'pointer'
          };

          if (s.isSingle) {
            return (
              <g key={s.key}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={R}
                  fill={color}
                  style={transformStyle}
                  onMouseEnter={() => setTouched(i)}
                  onMouseLeave={() => setTouched(-1)}
                  onClick={() => setTouched(touched === i ? -1 : i)}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                  }}
                >
                  100%
                </text>
                <text
                  x={cx}
                  y={cy - R - 15}
                  textAnchor="middle"
                  fill="var(--text)"
                  style={{
                    fontFamily: 'inherit',
                    fontWeight: '600',
                    fontSize: '14px',
                    pointerEvents: 'none'
                  }}
                >
                  {s.label}
                </text>
              </g>
            );
          }

          return (
            <g key={s.key}>
              {/* Slice path */}
              <path
                d={s.path}
                fill={color}
                style={transformStyle}
                onMouseEnter={() => setTouched(i)}
                onMouseLeave={() => setTouched(-1)}
                onClick={() => setTouched(touched === i ? -1 : i)}
              />

              {/* Percentage inside slice (drawn only if slice size permits, i.e. > 3%) */}
              {Number(s.pct) >= 4 && (
                <text
                  x={s.pctX}
                  y={s.pctY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  style={{
                    fontFamily: 'inherit',
                    fontSize: isHovered ? '15px' : '13px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    transition: 'font-size 0.2s'
                  }}
                >
                  {s.pct}%
                </text>
              )}

              {/* Category label outside slice */}
              <text
                x={s.labelX}
                y={s.labelY}
                textAnchor={s.textAnchor}
                dominantBaseline="middle"
                fill="var(--text)"
                style={{
                  fontFamily: 'inherit',
                  fontSize: isHovered ? '13px' : '12px',
                  fontWeight: isHovered ? 'bold' : 'normal',
                  pointerEvents: 'none',
                  transition: 'all 0.2s'
                }}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
