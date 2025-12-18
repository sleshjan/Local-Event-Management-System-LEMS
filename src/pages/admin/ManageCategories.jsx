import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { categoryService } from '../../services/categoryService';

const ManageCategories = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCategories(currentPage);
  }, [currentPage]);

  const loadCategories = async (page = 1) => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories({
        per_page: 10,
        page: page
      });

      if (response && response.data) {
        const categoryData = response.data;
        setCategories(categoryData.data || []);
        setTotalCount(categoryData.total || 0);
        setLastPage(categoryData.last_page || 1);
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-category/${id}`);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
    setError('');
    setSuccess('');
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);
      setError('');
      await categoryService.deleteCategory(categoryToDelete.id);

      setSuccess(`Category "${categoryToDelete.name}" deleted successfully.`);
      setShowDeleteModal(false);
      setCategoryToDelete(null);

      // Refresh the list
      await loadCategories();

      // Clear success message after 3000ms
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError("Failed to delete category. Please try again.");
    } finally {
      setDeleting(false);
    }
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Manage Categories
              </h1>
            </div>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
              onClick={() => navigate('/admin/add-category')}
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

            {/* Notifications */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm animate-in fade-in slide-in-from-top-4 duration-300">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm animate-in fade-in slide-in-from-top-4 duration-300">
                {success}
              </div>
            )}

            {/* Stats Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Categories</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
              </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Slug</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p>Loading categories...</p>
                          </div>
                        </td>
                      </tr>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-gray-500">#{category.id}</td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900">{category.name}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs bg-gray-50/50 rounded inline-block my-2 mx-6 px-2 py-1">
                            {category.slug}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-4">
                              <button
                                onClick={() => handleEdit(category.id)}
                                className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Category"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(category)}
                                className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Category"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Menu className="w-12 h-12 text-gray-200" />
                            <p>No categories found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination UI */}
              {categories.length > 0 && lastPage > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * 10 + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * 10, totalCount)}</span> of <span className="font-semibold text-gray-900">{totalCount}</span> categories
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>

                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(lastPage)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          disabled={loading}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                              : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                      disabled={currentPage === lastPage || loading}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => !deleting && setShowDeleteModal(false)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category?</h3>
                <p className="text-gray-500 mb-8">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">"{categoryToDelete?.name}"</span>?
                  This action cannot be undone and may affect events in this category.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    disabled={deleting}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleting}
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
