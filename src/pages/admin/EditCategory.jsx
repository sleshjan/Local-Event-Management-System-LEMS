import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowLeft, Save, Loader2 } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { categoryService } from '../../services/categoryService';
import { parseApiError } from '../../services/api';
import RichTextEditor from '../../components/common/RichTextEditor';
import CategoryChangeNotification from '../../components/admin/CategoryChangeNotification';

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [updatedCategoryName, setUpdatedCategoryName] = useState('');

    useEffect(() => {
        loadCategory();
    }, [id]);

    const loadCategory = async () => {
        try {
            setLoading(true);
            setError('');

            // We use the full list as a primary source because direct GET /category/{id} 
            // often returns 405 on this backend.
            const listResponse = await categoryService.getCategories();

            const categoryData = listResponse.data || listResponse;
            const categoriesList = Array.isArray(categoryData.data) ? categoryData.data :
                Array.isArray(categoryData) ? categoryData : [];

            const found = categoriesList.find(c => String(c.id) === String(id));

            if (found) {
                setFormData({
                    name: found.name || '',
                    description: found.description || ''
                });
            } else {
                throw new Error("Category not found.");
            }
        } catch (err) {
            setError("Failed to load category details: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const response = await categoryService.updateCategory(id, formData);
            setSuccess("Category updated successfully!");
            setUpdatedCategoryName(formData.name);

            // Show notification after a short delay
            setTimeout(() => {
                setShowNotification(true);
            }, 500);
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateRelations = () => {
        navigate('/admin/categories', { state: { openRelationsModal: true } });
    };

    const handleCloseNotification = () => {
        setShowNotification(false);
        // Navigate back after closing notification
        setTimeout(() => {
            navigate('/admin/categories');
        }, 300);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <AdminSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-xl">
                        <div className="p-4 flex justify-end border-b border-gray-200">
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <AdminSidebar />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => navigate('/admin/categories')}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 lg:flex items-center gap-2 hidden"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="text-sm font-medium">Back to List</span>
                            </button>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Edit Category
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                <p className="text-gray-500 mt-4">Loading category details...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm">
                                        {success}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                            placeholder="e.g. Art and Design"
                                        />
                                    </div>

                                    <div>
                                        <RichTextEditor
                                            label="Description"
                                            value={formData.description}
                                            onChange={(content) => setFormData({ ...formData, description: content })}
                                            placeholder="Enter category description..."
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Saving Changes...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5" />
                                                    Update Category
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Change Notification */}
            <CategoryChangeNotification
                isOpen={showNotification}
                onClose={handleCloseNotification}
                onUpdateRelations={handleUpdateRelations}
                categoryName={updatedCategoryName}
                action="updated"
            />
        </div>
    );
};

export default EditCategory;
