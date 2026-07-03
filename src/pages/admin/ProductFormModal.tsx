// src/pages/admin/ProductFormModal.tsx
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useCategories } from '../../hooks/useCategories';
import { useAdminStores } from '../../hooks/useAdminStores';
import {
    useCreateProduct,
    useUpdateProduct,
    useUploadProductImage,
    useGenerateContent,
} from '../../hooks/useProductMutations';
import type { ProductResponse } from '../../types/product';

interface Props {
    product: ProductResponse | null; // null = create, a product = edit
    onClose: () => void;
}

export function ProductFormModal({ product, onClose }: Props) {
    const isEdit = product !== null;
    const { data: categories = [] } = useCategories();
    const { data: stores = [] } = useAdminStores();

    // --- form fields (pre-filled in edit mode) ---
    const [name, setName] = useState(product?.name ?? '');
    const [sku, setSku] = useState(product?.sku ?? '');
    const [price, setPrice] = useState(product ? String(product.price) : '');
    const [categoryId, setCategoryId] = useState<number>(product?.categoryId ?? 0);
    const [description, setDescription] = useState(product?.description ?? '');
    const [initialStock, setInitialStock] = useState('0');   // create-only
    const [storeId, setStoreId] = useState<number>(0);       // create-only; 0 = "not chosen yet"

    // The image file the admin staged but hasn't uploaded yet (create mode uploads AFTER save).
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // --- mutations ---
    const uploadImg = useUploadProductImage({
        onError: (m) => toast.error(`Saved, but image upload failed: ${m}`),
    });

    const create = useCreateProduct({
        onSuccess: async (created) => {
            // If an image was staged during create, upload it now that we have an id.
            if (pendingFile) await uploadImg.mutateAsync({ id: created.id, file: pendingFile });
            toast.success('Product created.');
            onClose();
        },
        onError: (m) => toast.error(m),
    });

    const update = useUpdateProduct({
        onSuccess: () => { toast.success('Product updated.'); onClose(); },
        onError: (m) => toast.error(m),
    });

    const gen = useGenerateContent({
        onSuccess: (s) => { setDescription(s.description); toast.success('Description drafted — review and Save to keep it.'); },
        onError: (m) => toast.error(m),
    });

    // A live preview URL for the staged file (or the product's existing image in edit mode).
    const previewUrl = pendingFile ? URL.createObjectURL(pendingFile) : product?.imageUrl ?? null;
    const saving = create.isPending || update.isPending || uploadImg.isPending;

    function chooseFile(file: File | undefined | null) {
        if (!file) return;
        const ok = ['image/jpeg', 'image/png'].includes(file.type);
        if (!ok) return toast.error('Only JPG or PNG images are allowed.');
        if (file.size > 5 * 1024 * 1024) return toast.error('Image must be 5 MB or smaller.');
        setPendingFile(file);
        // In EDIT mode we already have an id, so upload right away.
        if (isEdit) uploadImg.mutate({ id: product!.id, file });
    }

    function onGenerate() {
        if (!product) return;
        // The backend reads the product's name+category itself; we send the free-text "specs".
        const specs = description.trim() || name.trim();
        gen.mutate({ id: product.id, specs });
    }

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        const priceNum = Number(price);

        // --- local validation (matches the backend's FluentValidation rules) ---
        if (!name.trim()) return toast.error('Name is required.');
        if (!isEdit && !sku.trim()) return toast.error('SKU is required.');
        if (!Number.isFinite(priceNum) || priceNum <= 0) return toast.error('Price must be greater than 0.');
        if (!categoryId) return toast.error('Please choose a category.');

        if (isEdit) {
            update.mutate({
                id: product!.id,
                body: { name: name.trim(), description: description.trim(), price: priceNum, categoryId },
            });
        } else {
            if (!storeId) return toast.error('Please choose a store.');
            create.mutate({
                name: name.trim(),
                description: description.trim(),
                sku: sku.trim(),
                price: priceNum,
                categoryId,
                storeId,
                initialStock: Number(initialStock) || 0,
            });
        }
    }

    return (
        // OVERLAY: clicking it closes the modal. stopPropagation on the card prevents that.
        <div onClick={onClose} style={overlay}>
            <div onClick={(e) => e.stopPropagation()} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, margin: 0 }}>
                        {isEdit ? 'Edit product' : 'Add product'}
                    </h2>
                    <button onClick={onClose} style={iconBtn} aria-label="Close">✕</button>
                </div>

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field label="Name">
                        <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
                    </Field>

                    <Field label={isEdit ? 'SKU (cannot be changed)' : 'SKU'}>
                        <input value={sku} onChange={(e) => setSku(e.target.value)} disabled={isEdit}
                            style={{ ...input, opacity: isEdit ? 0.6 : 1 }} />
                    </Field>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <Field label="Price (USD)" style={{ flex: 1 }}>
                            <input value={price} onChange={(e) => setPrice(e.target.value)}
                                inputMode="decimal" placeholder="0.00" style={input} />
                        </Field>
                        <Field label="Category" style={{ flex: 1 }}>
                            <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} style={input}>
                                <option value={0} disabled>Choose…</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Create-only fields (see §5.3) */}
                    {!isEdit && (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Field label="Initial stock" style={{ flex: 1 }}>
                                <input value={initialStock} onChange={(e) => setInitialStock(e.target.value)}
                                    inputMode="numeric" style={input} />
                            </Field>
                            <Field label="Store" style={{ flex: 1 }}>
                                <select value={storeId} onChange={(e) => setStoreId(Number(e.target.value))} style={input}>
                                    <option value={0} disabled>Choose a store…</option>
                                    {stores.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.status})
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    )}

                    <Field label="Description">
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                            rows={4} style={{ ...input, resize: 'vertical' }} />
                    </Field>

                    {/* IMAGE UPLOAD */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>
                            Product image
                        </label>
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files?.[0]); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                                border: '1px dashed rgba(255,255,255,0.22)', borderRadius: 12,
                                background: 'rgba(255,255,255,0.03)',
                            }}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="preview"
                                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }} />
                            ) : (
                                <div style={{ width: 64, height: 64, borderRadius: 10, background: 'rgba(255,255,255,0.08)' }} />
                            )}
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                                Drag an image here, or{' '}
                                <label style={{ color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline' }}>
                                    browse
                                    <input type="file" accept="image/jpeg,image/png" style={{ display: 'none' }}
                                        onChange={(e) => chooseFile(e.target.files?.[0])} />
                                </label>
                                <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                    JPG or PNG, max 5 MB.
                                    {!isEdit && ' Uploads automatically right after you save the product.'}
                                    {uploadImg.isPending && ' Uploading…'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GENERATE CONTENT — edit mode only (needs an existing product id, Admin-only API) */}
                    {isEdit && (
                        <button type="button" onClick={onGenerate} disabled={gen.isPending}
                            style={{
                                alignSelf: 'flex-start', padding: '8px 14px', fontFamily: 'inherit', fontSize: 13.5,
                                fontWeight: 600, color: '#c4b5fd', background: 'rgba(139,92,246,0.12)',
                                border: '1px solid rgba(139,92,246,0.4)', borderRadius: 10,
                                cursor: gen.isPending ? 'wait' : 'pointer',
                            }}>
                            {gen.isPending ? 'Generating…' : '✨ Generate content (AI)'}
                        </button>
                    )}

                    <button type="submit" disabled={saving}
                        style={{
                            marginTop: 4, padding: 12, fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
                            color: '#fff', border: 'none', borderRadius: 12,
                            cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.8 : 1,
                            background: 'linear-gradient(120deg,#8b5cf6,#6366f1)',
                        }}>
                        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// A tiny label+field wrapper to avoid repeating markup.
function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: CSSProperties }) {
    return (
        <div style={style}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>{label}</label>
            {children}
        </div>
    );
}

const overlay: CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '6vh 16px', zIndex: 1000, overflowY: 'auto',
};
const card: CSSProperties = {
    width: '100%', maxWidth: 560, background: '#14141f', color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24,
};
const input: CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5, fontFamily: 'inherit',
    color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 12, outline: 'none',
};
const iconBtn: CSSProperties = {
    background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer',
};
