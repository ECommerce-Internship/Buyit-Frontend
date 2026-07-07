// src/pages/admin/ProductFormModal.tsx
import { useState, useRef, useEffect } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useCategories } from '../../hooks/useCategories';
import {
    useCreateProduct,
    useUpdateProduct,
    useUploadProductImage,
    useGenerateContent,
} from '../../hooks/useProductMutations';
import type { ProductResponse, ProductContentSuggestion } from '../../types/product';
import type { Store } from '../../types/store';

interface Props {
    product: ProductResponse | null; // null = create, a product = edit
    stores: Store[];                 // which stores the caller may assign this product to
    onClose: () => void;
}

export function ProductFormModal({ product, stores, onClose }: Props) {
    const isEdit = product !== null;
    const { data: categories = [] } = useCategories();

    // --- form fields (pre-filled in edit mode) ---
    const [name, setName] = useState(product?.name ?? '');
    const [sku, setSku] = useState(product?.sku ?? '');
    const [price, setPrice] = useState(product ? String(product.price) : '');
    const [categoryId, setCategoryId] = useState<number>(product?.categoryId ?? 0);
    const [description, setDescription] = useState(product?.description ?? '');
    const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? '');
    const [metaDescription, setMetaDescription] = useState(product?.metaDescription ?? '');
    const [features, setFeatures] = useState<string[]>(product?.features ?? []);
    const [initialStock, setInitialStock] = useState('0');   // create-only
    const [storeId, setStoreId] = useState<number>(0);       // create-only; 0 = "not chosen yet"

    // The image file the admin staged but hasn't uploaded yet (create mode uploads AFTER save).
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // --- Generate Content (AI) state ---
    const [specs, setSpecs] = useState('');
    const [suggestion, setSuggestion] = useState<ProductContentSuggestion | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerContentRef = useRef<HTMLDivElement>(null);

    // Every time new AI content lands (first generate or a regenerate), snap the drawer's
    // scroll back to the top instead of leaving it wherever the browser last put it.
    useEffect(() => {
        if (suggestion && drawerContentRef.current) {
            drawerContentRef.current.scrollTop = 0;
        }
    }, [suggestion]);

    // --- mutations ---
    const uploadImg = useUploadProductImage({
        onError: (m) => toast.error(`Saved, but image upload failed: ${m}`),
    });

    const create = useCreateProduct({
        onSuccess: async (created) => {
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

    // No longer auto-applies — it just hands the suggestion to the drawer for review.
    const gen = useGenerateContent({
        onSuccess: (s) => {
            setSuggestion(s);
            setDrawerOpen(true);
        },
        onError: (m) => toast.error(m),
    });

    const previewUrl = pendingFile ? URL.createObjectURL(pendingFile) : product?.imageUrl ?? null;
    const saving = create.isPending || update.isPending || uploadImg.isPending;

    function chooseFile(file: File | undefined | null) {
        if (!file) return;
        const ok = ['image/jpeg', 'image/png'].includes(file.type);
        if (!ok) return toast.error('Only JPG or PNG images are allowed.');
        if (file.size > 5 * 1024 * 1024) return toast.error('Image must be 5 MB or smaller.');
        setPendingFile(file);
        if (isEdit) uploadImg.mutate({ id: product!.id, file });
    }

    function onGenerate() {
        if (!product) return;
        if (!specs.trim()) return toast.error('Please add a few specs/notes for the AI first.');
        gen.mutate({ id: product.id, specs: specs.trim() });
    }

    // Applies the suggestion to the form. Features are folded into the description text since
    // there's no separate `features` column on the product — nothing from the AI is discarded,
    // it just lands as a bullet list under the main paragraph.
    function useThisContent() {
        if (!suggestion) return;
        setDescription(suggestion.description);
        setFeatures(suggestion.features);
        setSeoTitle(suggestion.seoTitle);
        setMetaDescription(suggestion.metaDescription);
        setDrawerOpen(false);
        setSuggestion(null);
        toast.success('Content applied — review and Save to keep it.');
    }

    // Closing without saving discards silently: no toast, no confirmation, just gone.
    function closeDrawer() {
        setDrawerOpen(false);
        setSuggestion(null);
    }

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        const priceNum = Number(price);

        if (!name.trim()) return toast.error('Name is required.');
        if (!isEdit && !sku.trim()) return toast.error('SKU is required.');
        if (!Number.isFinite(priceNum) || priceNum <= 0) return toast.error('Price must be greater than 0.');
        if (!categoryId) return toast.error('Please choose a category.');

        const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);

        if (isEdit) {
            update.mutate({
                id: product!.id,
                body: {
                    name: name.trim(),
                    description: description.trim(),
                    price: priceNum,
                    categoryId,
                    seoTitle: seoTitle.trim() || null,
                    metaDescription: metaDescription.trim() || null,
                    features: cleanFeatures.length ? cleanFeatures : null,
                },
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
                seoTitle: seoTitle.trim() || null,
                metaDescription: metaDescription.trim() || null,
                features: cleanFeatures.length ? cleanFeatures : null,
            });
        }
    }

    return (
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
                    <Field label="Key features (one per line, optional)">
                        <textarea value={features.join('\n')} onChange={(e) => setFeatures(e.target.value.split('\n'))}
                            rows={4} style={{ ...input, resize: 'vertical' }} />
                    </Field>
                    <Field label="SEO title (optional)">
                        <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} style={input} />
                    </Field>
                    <Field label="Meta description (optional)">
                        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                            rows={2} style={{ ...input, resize: 'vertical' }} />
                    </Field>
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
                    {isEdit && (
                        <div style={{
                            padding: 14, borderRadius: 14,
                            background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)',
                        }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#c4b5fd', marginBottom: 10 }}>
                                ✨ Generate Content (AI)
                            </div>
                            <Field label="Specs / notes for the AI">
                                <textarea value={specs} onChange={(e) => setSpecs(e.target.value)}
                                    rows={3} placeholder="e.g. material, dimensions, key selling points…"
                                    style={{ ...input, resize: 'vertical' }} />
                            </Field>
                            <button type="button" onClick={onGenerate} disabled={gen.isPending}
                                style={{
                                    marginTop: 10, padding: '9px 16px', fontFamily: 'inherit', fontSize: 13.5,
                                    fontWeight: 700, color: '#fff', border: 'none', borderRadius: 10,
                                    cursor: gen.isPending ? 'wait' : 'pointer',
                                    background: 'linear-gradient(120deg,#8b5cf6,#6d28d9)',
                                    opacity: gen.isPending ? 0.85 : 1,
                                }}>
                                {gen.isPending ? 'Generating with AI…' : 'Generate'}
                            </button>
                        </div>
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

            {/* SIDE DRAWER — closing it (X or backdrop click) discards silently. */}
            {drawerOpen && suggestion && (
                <div onClick={(e) => { e.stopPropagation(); closeDrawer(); }} style={drawerOverlay}>
                    <div onClick={(e) => e.stopPropagation()} style={drawerPanel}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <h3 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>
                                ✨ AI-generated content
                            </h3>
                            <button onClick={closeDrawer} style={iconBtn} aria-label="Close preview">✕</button>
                        </div>
                        <p style={{ margin: '0 0 18px', fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                            AI-generated content should be reviewed before saving.
                        </p>

                        <div ref={drawerContentRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <ContentSection label="Description" text={suggestion.description} />
                            <ContentSection
                                label="Key features"
                                text={suggestion.features.join(', ')}
                                render={() => (
                                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                                        {suggestion.features.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                )}
                            />
                            <ContentSection label="SEO title" text={suggestion.seoTitle} />
                            <ContentSection label="Meta description" text={suggestion.metaDescription} />
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                            <button type="button" onClick={onGenerate} disabled={gen.isPending}
                                style={{
                                    flex: 1, padding: 11, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
                                    color: '#c4b5fd', background: 'rgba(139,92,246,0.12)',
                                    border: '1px solid rgba(139,92,246,0.4)', borderRadius: 10,
                                    cursor: gen.isPending ? 'wait' : 'pointer',
                                }}>
                                {gen.isPending ? 'Regenerating…' : 'Regenerate'}
                            </button>
                            <button type="button" onClick={useThisContent} disabled={gen.isPending}
                                style={{
                                    flex: 1, padding: 11, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                                    color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
                                    background: 'linear-gradient(120deg,#8b5cf6,#6366f1)',
                                }}>
                                Use This Content
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: CSSProperties }) {
    return (
        <div style={style}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>{label}</label>
            {children}
        </div>
    );
}

function ContentSection({
    label,
    text,
    render,
}: {
    label: string;
    text: string;
    render?: () => React.ReactNode;
}) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'rgba(255,255,255,0.5)' }}>
                    {label}
                </span>
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>
                    {text.length} characters
                </span>
            </div>
            {render ? render() : (
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap' }}>
                    {text}
                </p>
            )}
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
const drawerOverlay: CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'flex-end', zIndex: 1100,
};
const drawerPanel: CSSProperties = {
    width: '100%', maxWidth: 420, height: '100vh', background: '#17172a', color: '#fff',
    borderLeft: '1px solid rgba(255,255,255,0.1)', padding: 22,
    display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
};
const input: CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5, fontFamily: 'inherit',
    color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 12, outline: 'none',
};
const iconBtn: CSSProperties = {
    background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer',
};