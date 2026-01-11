import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Edit2, Trash2, Plus, Loader2, Link2, Copy, Save, Sparkles } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';

const ManageCategories = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 10;

  // Relations state
  const [showRelationsModal, setShowRelationsModal] = useState(false);
  const [relationPrompt, setRelationPrompt] = useState("");
  const [fetchingPrompt, setFetchingPrompt] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // Fetch all categories (using high per_page to ensure we get them all for client-side pagination)
      const response = await categoryService.getCategories({
        per_page: 1000,
        page: 1
      });

      if (response) {
        let categoryData = [];
        // Handle various response formats
        if (Array.isArray(response)) {
          categoryData = response;
        } else if (response.data && Array.isArray(response.data)) {
          categoryData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          categoryData = response.data.data;
        }

        setCategories(categoryData);
      }
    } catch (err) {
      showToast("Failed to load categories. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handle state-based modal opening from navigation
  const location = useLocation();
  useEffect(() => {
    if (location.state?.openRelationsModal) {
      setShowRelationsModal(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Pagination Logic (Copied from Manage Users)
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-category/${id}`);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);
      await categoryService.deleteCategory(categoryToDelete.id);

      showToast(`Category "${categoryToDelete.name}" deleted successfully.`, "success");
      setShowDeleteModal(false);
      setCategoryToDelete(null);

      // Refresh the list
      await loadCategories();
    } catch (err) {
      showToast("Failed to delete category. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleFetchPrompt = async () => {
    try {
      setFetchingPrompt(true);
      const response = await categoryService.getRelationPrompt();
      const promptText = response.data || response.message || JSON.stringify(response, null, 2);
      setRelationPrompt(promptText);
      showToast("Prompt fetched successfully. Use an AI to calculate scores.", "success");
    } catch (err) {
      showToast("Failed to fetch relation prompt.", "error");
    } finally {
      setFetchingPrompt(false);
    }
  };

  const copyPromptToClipboard = () => {
    if (!relationPrompt) return;
    navigator.clipboard.writeText(relationPrompt);
    showToast("AI Prompt copied to clipboard!", "success");
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
            <div className="flex items-center gap-2">
              <button
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium border border-indigo-200"
                onClick={() => setShowRelationsModal(true)}
              >
                <Link2 className="w-4 h-4" />
                Manage Relations
              </button>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
                onClick={() => navigate('/admin/add-category')}
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

            {/* Stats Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Categories</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-2xl">
                <Plus className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            {/* Categories Table Wrapper */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            <p className="font-medium">Loading categories...</p>
                          </div>
                        </td>
                      </tr>
                    ) : currentCategories.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                          No categories found. Click "Add Category" to create one.
                        </td>
                      </tr>
                    ) : (
                      currentCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {category.slug}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(category.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(category)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {categories.length > 0 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstCategory + 1}</span> to <span className="font-medium">{Math.min(indexOfLastCategory, categories.length)}</span> of <span className="font-medium">{categories.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          Previous
                        </button>
                        <button
                          disabled
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          Page {currentPage} of {totalPages || 1}
                        </button>
                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages || totalPages === 0}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                  {/* Mobile Pagination */}
                  <div className="flex items-center justify-between sm:hidden w-full">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
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

        {/* Relations Management Modal */}
        {showRelationsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => !fetchingPrompt && setShowRelationsModal(false)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Category Relatedness Prompt</h3>
                </div>
                <button
                  onClick={() => setShowRelationsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-sm text-amber-800 flex gap-3">
                  <div className="shrink-0 p-1 bg-amber-100 rounded-lg h-fit">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="leading-relaxed">
                    Generate this prompt to get the latest category relationship matrix requirements.
                    Paste the generated text into an AI model (like ChatGPT or Gemini) to obtain the JSON data,
                    then use that data to manually update the relations via the POST API.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">Generated Prompt</h4>
                    <button
                      onClick={handleFetchPrompt}
                      disabled={fetchingPrompt}
                      className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium flex items-center gap-1"
                    >
                      {fetchingPrompt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      {relationPrompt ? "Regenerate" : "Generate Prompt"}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 h-[350px] overflow-y-auto relative font-mono text-xs">
                    {relationPrompt ? (
                      <>
                        <pre className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {relationPrompt}
                        </pre>
                        <button
                          onClick={copyPromptToClipboard}
                          className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md border border-gray-100 hover:bg-gray-50 text-indigo-600 group transition-all"
                          title="Copy to Clipboard"
                        >
                          <Copy className="w-4 h-4 group-hover:scale-110" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 opacity-60">
                        <Sparkles className="w-12 h-12 mb-3" />
                        <p className="max-w-[200px]">Click the button above to generate your AI prompt.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setShowRelationsModal(false)}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Close
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
