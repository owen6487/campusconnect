import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apis';
import useAuth from '../Hooks/useAuth';
import usePageMeta from '../Hooks/usePageMeta';
import { LuCloudUpload, LuCamera, LuX } from 'react-icons/lu';

const CATEGORIES = ['electronics', 'clothing', 'books', 'furniture', 'beauty', 'sports', 'toys', 'housing', 'services', 'bikes', 'others'];
const MIN_IMAGES = 4;
const MAX_IMAGES = 8;

export default function SellPage() {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();
    const [step, setStep] = useState(0); // 0 = title, 1 = photos, 2 = details
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [images, setImages] = useState([]);
    const [form, setForm] = useState({
        title: '', description: '', price: '', category: '',
        campus: '', branch: '', phoneNumber: '',
    });
    const [campuses, setCampuses] = useState([]);
    const [branches, setBranches] = useState([]);
    const cameraInput = useRef(null);
    const galleryInput = useRef(null);
    const imagesRef = useRef(images);
    imagesRef.current = images;

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [loading, isAuthenticated, navigate]);

    useEffect(() => {
        api.get('/api/campuses/all').then((r) => setCampuses(r.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        let isMounted = true;
        api.get('/api/users/profile')
            .then(({ data }) => {
                if (!isMounted) return;
                const profile = data.profile ?? data.existingUser ?? {};
                if (profile.phoneNumber) {
                    setForm((f) => ({ ...f, phoneNumber: f.phoneNumber || profile.phoneNumber }));
                }
            })
            .catch(() => {
                // Ignore profile fetch errors here; the user can still enter a number manually.
            });

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    useEffect(() => {
        setForm((f) => ({ ...f, branch: '' }));
        setBranches([]);
        if (!form.campus) return;
        api.get(`/api/branches/all/${form.campus}`).then((r) => setBranches(r.data)).catch(console.error);
    }, [form.campus]);

    useEffect(() => {
        return () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    }, []);

    usePageMeta({ title: 'Sell an item', noindex: true });

    if (loading) {
        return <div className="max-w-xl mx-auto px-4 py-8 text-sm text-gray-500">Checking your session...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    // ── images ──
    const addImages = (fileList) => {
        const files = Array.from(fileList);
        if (!files.length) return;
        setImages((prev) => {
            const next = [...prev, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))];
            return next.slice(0, MAX_IMAGES); // cap at 8
        });
    };

    const removeImage = (index) => {
        setImages((prev) => {
            URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    };

    // ── step validation ──
    const canNext = () => {
        if (step === 0) return form.title.trim().length >= 3;
        if (step === 1) return images.length >= MIN_IMAGES;
        return true;
    };

    const next = () => { setError(''); canNext() ? setStep(step + 1) : setError(
        step === 0 ? 'Give your item a title (at least 3 characters).' :
        `Please add at least ${MIN_IMAGES} photos (you have ${images.length}).`
    ); };

    // ── submit ──
    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('name', form.title.trim());
            fd.append('description', form.description.trim());
            fd.append('price', form.price);
            fd.append('category', form.category);
            fd.append('campus', form.campus);
            if (form.branch) fd.append('branch', form.branch);
            fd.append('phoneNumber', form.phoneNumber.trim());
            fd.append('whatsAppLink', `https://wa.me/${form.phoneNumber.replace(/\D/g, '')}`);
            images.forEach((img) => fd.append('images', img.file));

            const res = await api.post('/api/products/create', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            navigate(`/product/${res.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = 'mt-1 w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700';

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
                {['Title', 'Photos', 'Details'].map((label, i) => (
                    <div key={label} className="flex items-center gap-2 flex-1">
                        <div className={`w-7 h-7 rounded-full text-sm flex items-center justify-center font-medium
                            ${i < step ? 'bg-blue-700 text-white' : i === step ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {i < step ? '✓' : i + 1}
                        </div>
                        <span className={`text-sm ${i === step ? 'font-medium text-gray-900' : 'text-gray-500'}`}>{label}</span>
                        {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
                    </div>
                ))}
            </div>

            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            {/* ── STEP 0: TITLE ── */}
            {step === 0 && (
                <div>
                    <h1 className="text-xl font-bold mb-1">What are you selling?</h1>
                    <p className="text-sm text-gray-500 mb-4">Be specific — buyers search by name.</p>
                    <input
                        autoFocus
                        value={form.title}
                        onChange={set('title')}
                        placeholder="e.g. iPhone 13, 128GB — barely used"
                        className={inputCls}
                        maxLength={100}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/100</p>
                </div>
            )}

            {/* ── STEP 1: PHOTOS ── */}
            {step === 1 && (
                <div>
                    <h1 className="text-xl font-bold mb-1">Add photos</h1>
                    <p className="text-sm text-gray-500 mb-4">
                        Minimum {MIN_IMAGES}, up to {MAX_IMAGES}. Clear photos sell faster.
                    </p>

                    {/* Hidden inputs: one opens camera, one opens gallery */}
                    <input ref={cameraInput} type="file" accept="image/*" capture="environment"
                        className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} />
                    <input ref={galleryInput} type="file" accept="image/*" multiple
                        className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} />

                    <div className="flex gap-3 mb-4">
                        <button type="button" onClick={() => cameraInput.current?.click()}
                            className="flex-1 border-2 border-dashed rounded-xl py-6 text-sm text-gray-600 hover:border-blue-700 hover:text-blue-700 flex flex-col items-center gap-1">
                            <LuCamera className="w-6 h-6" /> Take photo
                        </button>
                        <button type="button" onClick={() => galleryInput.current?.click()}
                            className="flex-1 border-2 border-dashed rounded-xl py-6 text-sm text-gray-600 hover:border-blue-700 hover:text-blue-700 flex flex-col items-center gap-1">
                            <LuCloudUpload className="w-6 h-6" /> Upload from gallery
                        </button>
                    </div>

                    {/* Preview grid with ✕ remove */}
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((img, i) => (
                            <div key={img.url} className="relative">
                                <img src={img.url} alt={`photo ${i + 1}`} className="w-full h-28 object-cover rounded-lg" />
                                <button type="button" onClick={() => removeImage(i)} aria-label="Remove photo"
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full text-xs flex items-center justify-center shadow">
                                    <LuX className="w-4 h-4" />
                                </button>
                                {i === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>}
                            </div>
                        ))}
                    </div>

                    <p className={`text-sm mt-3 ${images.length < MIN_IMAGES ? 'text-orange-600' : 'text-green-600'}`}>
                        {images.length}/{MIN_IMAGES} minimum {images.length >= MIN_IMAGES && '— looks good! ✓'}
                    </p>
                </div>
            )}

            {/* ── STEP 2: DETAILS ── */}
            {step === 2 && (
                <div className="space-y-4">
                    <h1 className="text-xl font-bold mb-1">Final details</h1>

                    <label className="block text-xs text-gray-500">Description
                        <textarea value={form.description} onChange={set('description')} rows={3}
                            placeholder="Condition, how old, why you're selling..."
                            className={inputCls} />
                    </label>

                    <label className="block text-xs text-gray-500">Price (KSh)
                        <input type="number" min="0" value={form.price} onChange={set('price')} className={inputCls} />
                    </label>

                    <label className="block text-xs text-gray-500">Category
                        <select value={form.category} onChange={set('category')} className={inputCls}>
                            <option value="">Select a category</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>

                    <label className="block text-xs text-gray-500">Campus
                        <select value={form.campus} onChange={set('campus')} className={inputCls}>
                            <option value="">Select your campus</option>
                            {campuses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </label>

                    <label className="block text-xs text-gray-500">Branch (optional)
                        <select value={form.branch} onChange={set('branch')}
                            disabled={!form.campus || branches.length === 0} className={`${inputCls} disabled:bg-gray-100`}>
                            <option value="">Select a branch</option>
                            {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </label>

                    <label className="block text-xs text-gray-500">Phone / WhatsApp number
                        <input type="tel" value={form.phoneNumber} onChange={set('phoneNumber')}
                            placeholder="e.g. 0712345678" className={inputCls} />
                        <p className="text-xs text-gray-400 mt-1">
                            We prefilled your saved profile number if you added one. You can change it here before posting.
                        </p>
                    </label>
                </div>
            )}

            {/* ── NAVIGATION ── */}
            <div className="flex gap-3 mt-8">
                {step > 0 && (
                    <button type="button" onClick={() => setStep(step - 1)}
                        className="flex-1 border rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Back
                    </button>
                )}
                {step < 2 ? (
                    <button type="button" onClick={next}
                        className="flex-1 bg-orange-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-600">
                        Continue
                    </button>
                ) : (
                    <button type="button" onClick={handleSubmit} disabled={submitting}
                        className="flex-1 bg-orange-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                        {submitting ? 'Posting...' : 'Post listing — free'}
                    </button>
                )}
            </div>
        </div>
    );
}
