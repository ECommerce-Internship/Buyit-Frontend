// src/pages/admin/AdminCategoriesPage.tsx
import { useState } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { useCategories, useDeleteCategory } from '../../hooks/useCategories';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { CategoryFormModal } from './CategoryFormModal';
import type { CategoryResponse } from '../../types/product';

export function AdminCategoriesPage() {
    const { data: categories = [], isLoading, isError } = useCategories();

    const [creating, setCreating] = useState(false);                       // is the CREATE modal open?
    const [editing, setEditing] = useState<CategoryResponse | null>(null); // which row's EDIT modal
    const [confirm, setConfirm] = useState<CategoryResponse | null>(null); // which row awaits DELETE

    const del = useDeleteCategory({
        onSuccess: () => { toast.success('Category deleted.'); setConfirm(null); },
        onError: (m) => { toast.error(m); setConfirm(null); },  // m = the backend's 409 message
    });

    // Flat list -> build an id->name map so we can print each row's parent name.
    const nameById = new Map(categories.map((c) => [c.id, c.name] as const));

    return (
        <main style={page_}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                    <div>
                        <h1 style={h1}>Categories</h1>
                        <p style={subtitle}>Create, edit, and remove the catalogue&apos;s categories.</p>
                    </div>
                    <button style={primaryBtn} onClick={() => setCreating(true)}>+ Add category</button>
                </div>

                <AdminTabs />

                {/* TABLE */}
                {isLoading ? (
                    <div style={panel}>Loading categories…</div>
                ) : isError ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn’t load categories. Refresh the page.</div>
                ) : categories.length === 0 ? (
                    <div style={panel}>No categories yet. Click “+ Add category” to create the first one.</div>
                ) : (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Name</th>
                                    <th style={th}>Parent</th>
                                    <th style={th}>Subcategories</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((c) => (
                                    <tr key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={{ ...td, fontWeight: 600 }}>{c.name}</td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>
                                            {c.parentCategoryId
                                                ? (nameById.get(c.parentCategoryId) ?? `#${c.parentCategoryId}`)
                                                : '—'}
                                        </td>
                                        <td style={td}>{c.subcategoryCount}</td>
                                        <td style={{ ...td, textAlign: 'right' }}>
                                            <button style={smallBtn} onClick={() => setEditing(c)}>Edit</button>{' '}
                                            <button
                                                style={{ ...smallBtn, color: '#ff9db0', borderColor: 'rgba(224,85,106,0.5)' }}
                                                onClick={() => setConfirm(c)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE modal */}
            {creating && <CategoryFormModal category={null} onClose={() => setCreating(false)} />}

            {/* EDIT modal */}
            {editing && <CategoryFormModal category={editing} onClose={() => setEditing(null)} />}

            {/* DELETE confirm dialog */}
            {confirm && (
                <div onClick={() => setConfirm(null)} style={overlay}>
                    <div onClick={(e) => e.stopPropagation()} style={confirmCard}>
                        <h2 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
                            Delete “{confirm.name}”?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '0 0 20px' }}>
                            This permanently removes the category. If any products are still linked to it,
                            the delete is blocked and you&apos;ll see the reason.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setConfirm(null)} disabled={del.isPending} style={ghostBtn}>Cancel</button>
                            <button onClick={() => del.mutate(confirm.id)} disabled={del.isPending} style={dangerBtn}>
                                {del.isPending ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

// ---- inline styles (copied from AdminOrdersPage so all admin tabs look identical) ----
const page_: CSSProperties = { minHeight: '100vh', background: '#0a0a12', color: '#fff', padding: '40px 24px' };
const h1: CSSProperties = { fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' };
const subtitle: CSSProperties = { margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' };
const panel: CSSProperties = {
    padding: 18, borderRadius: 16, background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)', marginBottom: 18,
};
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
const smallBtn: CSSProperties = {
    padding: '6px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9, cursor: 'pointer',
};
const primaryBtn: CSSProperties = {
    padding: '10px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff', border: 'none',
    borderRadius: 11, cursor: 'pointer', background: 'linear-gradient(120deg,#8b5cf6,#6366f1)',
};
const overlay: CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8vh 16px', zIndex: 1000,
};
const confirmCard: CSSProperties = {
    width: '100%', maxWidth: 420, background: '#14141f', color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24,
};
const ghostBtn: CSSProperties = {
    padding: '9px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, cursor: 'pointer',
};
const dangerBtn: CSSProperties = {
    padding: '9px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff',
    background: '#e0556a', border: '1px solid #e0556a', borderRadius: 10, cursor: 'pointer',
};
