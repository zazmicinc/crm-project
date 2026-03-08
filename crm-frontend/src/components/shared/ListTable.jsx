import { useState } from 'react';

export function ListTable({
    title, breadcrumb, columns, rows,
    newButtonLabel, onNew, onRowClick,
    totalCount, currentPage, totalPages, onPageChange,
    headerExtra
}) {
    const [selected, setSelected] = useState(new Set());
    const [hoveredId, setHoveredId] = useState(null);

    const allSelected = selected.size === rows.length && rows.length > 0;

    const toggleAll = () => {
        setSelected(allSelected ? new Set() : new Set(rows.map(r => r.id)));
    };

    const toggleOne = (id) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const gridTemplate = `40px ${columns.map(c => c.width || '1fr').join(' ')} 40px`;

    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * rows.length + 1;
    const endItem = (currentPage - 1) * rows.length + rows.length;

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase', marginBottom: 6 }}>
                        {breadcrumb}
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0a0a0a', margin: 0, letterSpacing: '-0.02em' }}>
                        {title}
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {headerExtra}
                    <button
                        onClick={onNew}
                        style={{
                            background: '#e8192c', color: '#fff', border: 'none',
                            borderRadius: 8, padding: '10px 20px', fontSize: 13,
                            fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em'
                        }}
                    >
                        {newButtonLabel}
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>

                {/* Header Row */}
                <div style={{
                    display: 'grid', gridTemplateColumns: gridTemplate,
                    background: '#fafafa', borderBottom: '1px solid #e8e8e8',
                    padding: '0 20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0' }}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            style={{ cursor: 'pointer', accentColor: '#e8192c' }}
                        />
                    </div>
                    {columns.map(col => (
                        <div key={col.key} style={{
                            padding: '14px 12px', fontSize: 11, fontWeight: 700,
                            color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase'
                        }}>
                            {col.label}
                        </div>
                    ))}
                    <div />
                </div>

                {/* Data Rows */}
                {rows.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>
                        No records found.
                    </div>
                ) : rows.map((row, idx) => {
                    const isHovered = hoveredId === row.id;
                    const isSelected = selected.has(row.id);
                    return (
                        <div
                            key={row.id}
                            onMouseEnter={() => setHoveredId(row.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => onRowClick(row)}
                            style={{
                                display: 'grid', gridTemplateColumns: gridTemplate,
                                alignItems: 'center', padding: '0 20px',
                                borderBottom: idx < rows.length - 1 ? '1px solid #f0f0f0' : 'none',
                                background: isSelected ? '#fff8f8' : isHovered ? '#fafafa' : '#fff',
                                transition: 'background 0.15s ease',
                                cursor: 'pointer'
                            }}
                        >
                            {/* Checkbox */}
                            <div
                                style={{ padding: '18px 0', display: 'flex', alignItems: 'center' }}
                                onClick={e => { e.stopPropagation(); toggleOne(row.id); }}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleOne(row.id)}
                                    style={{ cursor: 'pointer', accentColor: '#e8192c' }}
                                />
                            </div>

                            {/* Data Cells */}
                            {columns.map(col => (
                                <div key={col.key} style={{ padding: '18px 12px' }}>
                                    {col.render(row)}
                                </div>
                            ))}

                            {/* Arrow */}
                            <div style={{ padding: '18px 12px', display: 'flex', justifyContent: 'center' }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 6,
                                    border: '1px solid #e8e8e8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: isHovered ? '#e8192c' : '#ccc',
                                    background: isHovered ? '#fff0f1' : 'transparent',
                                    transition: 'all 0.15s', fontSize: 14
                                }}>
                                    →
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer / Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span style={{ fontSize: 12, color: '#aaa' }}>
                    {totalCount === 0
                        ? 'No records'
                        : `Showing ${startItem}–${Math.min(endItem, totalCount)} of ${totalCount}`}
                    {selected.size > 0 ? ` · ${selected.size} selected` : ''}
                </span>
                {totalPages > 1 && (
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                width: 30, height: 30, borderRadius: 6, border: '1px solid #e8e8e8',
                                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: currentPage === 1 ? 'default' : 'pointer', color: '#999',
                                opacity: currentPage === 1 ? 0.4 : 1, fontSize: 16
                            }}
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                style={{
                                    width: 30, height: 30, borderRadius: 6,
                                    border: p === currentPage ? 'none' : '1px solid #e8e8e8',
                                    background: p === currentPage ? '#e8192c' : '#fff',
                                    color: p === currentPage ? '#fff' : '#666',
                                    fontWeight: p === currentPage ? 700 : 400,
                                    fontSize: 13, cursor: 'pointer'
                                }}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                width: 30, height: 30, borderRadius: 6, border: '1px solid #e8e8e8',
                                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: currentPage === totalPages ? 'default' : 'pointer', color: '#999',
                                opacity: currentPage === totalPages ? 0.4 : 1, fontSize: 16
                            }}
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
