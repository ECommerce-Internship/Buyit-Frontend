// src/pages/admin/CategoryFormModal.tsx
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useCategories, useCreateCategory, useUpdateCategory } from '../../hooks/useCategories';
import type { CategoryResponse } from '../../types/product';

// Keep this in sync with the backend validator. After §6 the backend allows 150; if you skipped
// §6, set this to 100 so the UI never lets the user exceed what the backend accepts.
const NAME_MAX = 150;

interface Props {
    category: CategoryResponse | null; // null = create, a category = edit
    onClose: () => void;
}

export function CategoryFormModal({ category, onClose }: Props) {
    const isEdit = category !== null;
    const { data: categories = [] } = useCategories();

    // --- form fields (pre-filled in edit mode) ---
    const [name, setName] = useState(category?.name ?? '');
    const [description, setDescription] = useState(category?.description ?? '');
    const [parentId, setParentId] = useState<number>(category?.parentCategoryId ?? 0); // 0 = none

    const create = useCreateCategory({
        onSuccess: () => { toast.success('Category created.'); onClose(); },
        onError: (m) => toast.error(m),
    });
    const update = useUpdateCategory({
        onSuccess: () => { toast.success('Category updated.'); onClose(); },
        onError: (m) => toast.error(m),
    });

    const saving = create.isPending || update.isPending;

    // Parent options: only TOP-LEVEL categories, and never the category we're editing.
    const parentOptions = categories.filter(
        (c) => c.parentCategoryId === null && c.id !== category?.id,
    );

    function onSubmit(e: FormEvent) {
        e.preventDefault(); // stop the browser's default "reload the page on form submit"
        const trimmed = name.trim();
        if (!trimmed) return toast.error('Name is required.');
        if (trimmed.length > NAME_MAX) return toast.error(`Name cannot exceed ${NAME_MAX} characters.`);

        const body = {
            name: trimmed,
            description: description.trim() || null, // empty string -> null
            parentCategoryId: parentId || null,      // 0 -> null (no parent)
        };

        if (isEdit) update.mutate({ id: category!.id, body });
        else create.mutate(body);
    }

    return (
        // OVERLAY: clicking it closes the modal. stopPropagation on the card prevents that.
        <div onClick={onClose} style={overlay}>
            <div onClick={(e) => e.stopPropagation()} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, margin: 0 }}>
                        {isEdit ? 'Edit category' : 'Add category'}
                    </h2>
                    <button onClick={onClose} style={iconBtn} aria-label="Close">✕</button>
                </div>

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* NAME (required) */}
                    <div>
                        <label style={lbl}>Name</label>
                        <input value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} style={input} />
                        <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                            {name.length}/{NAME_MAX}
                        </div>
                    </div>

                    {/* PARENT (optional) */}
                    <div>
                        <label style={lbl}>Parent category (optional)</label>
                        <select value={parentId} onChange={(e) => setParentId(Number(e.target.value))} style={input}>
                            <option value={0}>None (top-level)</option>
                            {parentOptions.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* DESCRIPTION (optional) */}
                    <div>
                        <label style={lbl}>Description (optional)</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                            rows={3} style={{ ...input, resize: 'vertical' }} />
                    </div>

                    <button type="submit" disabled={saving}
                        style={{
                            marginTop: 4, padding: 12, fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
                            color: '#fff', border: 'none', borderRadius: 12,
                            cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.8 : 1,
                            background: 'linear-gradient(120deg,#8b5cf6,#6366f1)',
                        }}>
                        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ---- inline styles (copied from ProductFormModal so the look matches) ----
const overlay: CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '6vh 16px', zIndex: 1000, overflowY: 'auto',
};
const card: CSSProperties = {
    width: '100%', maxWidth: 480, background: '#14141f', color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24,
};
const input: CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5, fontFamily: 'inherit',
    color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 12, outline: 'none',
};
const lbl: CSSProperties = { display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.72)' };
const iconBtn: CSSProperties = {
    background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer',
};
