const STATUS_CONFIG = {
    new:       { bg: '#f5f5f5', color: '#555',    dot: '#999'    },
    contacted: { bg: '#fff0f0', color: '#c0392b', dot: '#e74c3c' },
    qualified: { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
    active:    { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
    inactive:  { bg: '#f5f5f5', color: '#888',    dot: '#bbb'    },
    open:      { bg: '#fff8f0', color: '#b25600', dot: '#e67e22' },
    won:       { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
    lost:      { bg: '#f5f5f5', color: '#888',    dot: '#bbb'    },
    prospect:  { bg: '#f0f4ff', color: '#1a3f9f', dot: '#3b5de7' },
    customer:  { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
    converted: { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
    dead:      { bg: '#f5f5f5', color: '#888',    dot: '#bbb'    },
};

export function StatusBadge({ status }) {
    if (!status) return null;
    const key = status.toLowerCase();
    const cfg = STATUS_CONFIG[key] ?? STATUS_CONFIG.new;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: cfg.bg, color: cfg.color,
            padding: '4px 10px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
            whiteSpace: 'nowrap'
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
            {status}
        </span>
    );
}
