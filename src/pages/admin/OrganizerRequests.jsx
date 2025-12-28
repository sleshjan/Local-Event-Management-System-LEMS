import { useState, useEffect } from 'react';
import { Menu, X, Eye, Check, XCircle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { organizerService } from '../../services/organizerService';

const OrganizerRequests = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await organizerService.getAllRequests();
      console.log("Organizer Requests API Response:", response);
      // API returns: { message: "...", data: { current_page: 1, data: [...], ... } }
      // So requests are in response.data.data
      let data = [];
      if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }
      setRequests(data);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await organizerService.rejectRequest(id, reason);
      loadRequests();
      if (selectedRequest && selectedRequest.id === id) {
        closeModal();
      }
    } catch (error) {
      alert(error.message || "Failed to reject request");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this request?")) return;

    try {
      await organizerService.approveRequest(id);
      loadRequests();
      if (selectedRequest && selectedRequest.id === id) {
        closeModal();
      }
    } catch (error) {
      alert(error.message || "Failed to approve request");
    }
  }

  const openModal = (request) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
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
          <div className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col">
            <div className="p-4 flex justify-end border-b border-gray-200">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Organizer Requests
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">User Name</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          Loading requests...
                        </td>
                      </tr>
                    ) : requests.length > 0 ? (
                      requests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">#{request.id}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {request.user?.name || request.user?.username || 'N/A'}
                          </td>
                          <td className="px-6 py-4">{request.user?.phone || 'N/A'}</td>
                          <td className="px-6 py-4">{request.user?.email || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800" // Blue for pending
                                }`}
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Action Buttons handling */}
                              {request.status === 'pending' || request.status === 'Pending' ? (
                                <>
                                  <button
                                    onClick={() => handleApprove(request.id)}
                                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                                    title="Approve"
                                  >
                                    <Check className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(request.id)}
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </>
                              ) : null}

                              <button
                                onClick={() => openModal(request)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal - Improved styling for 'Card on Top' feel */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          {/* Main Card */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all scale-100 overflow-hidden border border-gray-100">

            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                <p className="text-sm text-gray-500 mt-0.5">Review organizer application</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* Status Banner */}
              <div className={`p-4 rounded-xl flex items-center gap-3 ${selectedRequest.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                  selectedRequest.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                    'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                <div className={`w-2 h-2 rounded-full ${selectedRequest.status === 'approved' ? 'bg-green-500' :
                    selectedRequest.status === 'rejected' ? 'bg-red-500' :
                      'bg-blue-500'
                  }`} />
                <span className="font-semibold capitalize">{selectedRequest.status}</span>
                <span className="text-xs opacity-75 ml-auto">ID: #{selectedRequest.id}</span>
              </div>

              {/* Organization Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Organization Details</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                  <div className="grid grid-cols-1 gap-1">
                    <span className="text-xs text-gray-500">Organization Name</span>
                    <span className="font-semibold text-gray-900 text-lg">{selectedRequest.name || 'N/A'}</span>
                  </div>
                  {selectedRequest.additional_information && (
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <span className="text-xs text-gray-500 block mb-1">Additional Info</span>
                      <p className="text-sm text-gray-700">{selectedRequest.additional_information}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Applicant Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Applicant Information</h4>
                <div className="bg-white border border-gray-200 rounded-xl p-0 overflow-hidden divide-y divide-gray-100">
                  <div className="px-4 py-3 flex justify-between items-center bg-gray-50/50">
                    <span className="text-sm text-gray-500">Full Name</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRequest.user?.name || selectedRequest.user?.username || 'N/A'}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Email Address</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRequest.user?.email || 'N/A'}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Phone Number</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRequest.user?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Submission Reason</h4>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600 leading-relaxed italic">
                  "{selectedRequest.reason || "No reason provided."}"
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-10 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all shadow-sm hover:shadow"
              >
                Close
              </button>

              {(selectedRequest.status === 'pending' || selectedRequest.status === 'Pending') && (
                <>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    className="px-5 py-2.5 text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-semibold text-sm transition-all shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-100 flex items-center gap-2"
                  >
                    Accept Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerRequests;