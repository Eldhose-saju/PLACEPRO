// =============================================================================
// StatsCard — Dashboard Stat Card (Material-inspired, matches design.html)
// Uses inline styles to avoid Tailwind dynamic class purging issues
// =============================================================================

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string; // Material symbol name
  color?: 'blue' | 'purple' | 'amber' | 'emerald' | 'sky' | 'red' | 'indigo';
  badge?: string;
}

const colorMap: Record<string, { bg: string; text: string }> = {
  blue:    { bg: '#eff6ff', text: '#2563eb' },
  purple:  { bg: '#f5f3ff', text: '#7c3aed' },
  amber:   { bg: '#fffbeb', text: '#d97706' },
  emerald: { bg: '#ecfdf5', text: '#059669' },
  sky:     { bg: '#f0f9ff', text: '#0284c7' },
  red:     { bg: '#fff1f2', text: '#e11d48' },
  indigo:  { bg: '#eef2ff', text: '#4f46e5' },
};

export default function StatsCard({ title, value, icon, color = 'blue', badge }: StatsCardProps) {
  const { bg, text } = colorMap[color] || colorMap.blue;

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        {/* Icon */}
        <div style={{
          padding: '10px',
          borderRadius: '8px',
          background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: text }}>{icon}</span>
        </div>

        {/* Badge */}
        {badge && (
          <span style={{
            fontSize: '11px', fontWeight: '700', color: '#16a34a',
            background: '#dcfce7', padding: '2px 8px', borderRadius: '9999px',
          }}>
            {badge}
          </span>
        )}
      </div>

      <p style={{
        color: '#434655',
        fontSize: '10px', fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px',
      }}>
        {title}
      </p>
      <p style={{
        fontSize: '30px', fontWeight: '800', color: '#131b2e',
        fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.1,
      }}>
        {value}
      </p>
    </div>
  );
}
