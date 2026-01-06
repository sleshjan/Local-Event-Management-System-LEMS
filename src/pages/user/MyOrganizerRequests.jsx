import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import { Menu, X, Loader2, PlusCircle, ArrowLeft, Send } from "lucide-react";
import { organizerService } from "../../services/organizerService";
import { userService } from "../../services/userService";

const MyOrganizerRequests = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [myRequests, setMyRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusState, setStatusState] = useState({
        canSubmit: false,
        message: "",
        buttonText: "New Request",
        isApproved: false
    });
    const [userProfile, setUserProfile] = useState(null);
    const [isStatusExpanded, setIsStatusExpanded] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            const profile = await userService.getProfile();
            setUserProfile(profile.data || profile);

            const response = await organizerService.getMyRequests();

            let requests = [];
            if (Array.isArray(response)) {
                requests = response;
            } else if (response && Array.isArray(response.data)) {
                requests = response.data;
            } else if (response?.data && Array.isArray(response.data.data)) {
                requests = response.data.data;
            }

            // EXPLICIT SORT: Ensure Newest Request is First [0]
            requests.sort((a, b) => {
                const dateA = new Date(a.created_at || a.updated_at || a.requested_at || a.date || 0);
                const dateB = new Date(b.created_at || b.updated_at || b.requested_at || b.date || 0);
                return dateB - dateA; // Descending order
            });

            setMyRequests(requests);

            // Determine Status State
            if (requests.length === 0) {
                setStatusState({
                    canSubmit: true,
                    message: "You haven't submitted a request yet.",
                    buttonText: "New Request",
                    isApproved: false
                });
            } else {
                const lastRequest = requests[0]; // Assuming sorted by newest first
                const status = lastRequest.status.toLowerCase();

                if (status === 'approved') {
                    setStatusState({
                        canSubmit: false,
                        message: "Cannot send another request, already approved.",
                        buttonText: "Approved",
                        isApproved: true
                    });
                } else if (status === 'pending') {
                    setStatusState({
                        canSubmit: false,
                        message: "Request pending, cannot send now.",
                        buttonText: "Pending",
                        isApproved: false
                    });
                } else if (status === 'rejected') {
                    setStatusState({
                        canSubmit: true,
                        message: "Your last request was rejected. Want to send a new one?",
                        buttonText: "Resend Request",
                        isApproved: false
                    });
                }
            }

        } catch (err) {
            console.error("Failed to fetch organizer history", err);
            if (err.status === 403 && err.data?.error?.toLowerCase().includes('phone')) {
                setStatusState({
                    canSubmit: true,
                    message: "Profile incomplete. Please update details.",
                    buttonText: "New Request",
                    isApproved: false
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <div className="hidden lg:block">
                <Sidebar userInterests={userProfile?.interests || []} />
            </div>

            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="relative w-64 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                        <Sidebar userInterests={userProfile?.interests || []} />
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-[-48px] p-2 bg-white rounded-xl shadow-lg"
                        >
                            <X className="w-6 h-6 text-gray-900" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Become an Organizer</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 hidden sm:flex items-center gap-2 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto space-y-5">

                        {/* Collapsible Status Panel */}
                        {myRequests.length > 0 && (
                            <div className={`bg-white rounded-3xl border border-gray-200 shadow-sm transition-all duration-300 overflow-hidden ${isStatusExpanded ? 'p-5' : 'p-4 hover:bg-gray-50 cursor-pointer'}`}
                                onClick={() => !isStatusExpanded && setIsStatusExpanded(true)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-lg font-bold text-gray-900">
                                                {statusState.isApproved ? "You are an Organizer" : "Application Status"}
                                            </h2>
                                            {!isStatusExpanded && (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusState.buttonText === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        statusState.buttonText === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-gray-50 text-gray-600 border-gray-200'
                                                    }`}>
                                                    {statusState.buttonText}
                                                </span>
                                            )}
                                        </div>

                                        <div className={`transition-all duration-300 ${isStatusExpanded ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                                            <p className="text-gray-500 text-sm mb-4">
                                                {statusState.message}
                                            </p>

                                            {statusState.canSubmit && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate('/become-organizer'); }}
                                                    className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    {statusState.buttonText}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsStatusExpanded(!isStatusExpanded); }}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                    >
                                        {isStatusExpanded ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm">
                                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Loading requests...</p>
                            </div>
                        ) : myRequests.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center">
                                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <PlusCircle className="w-10 h-10 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Start your journey</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-8">
                                    {statusState.message}
                                </p>
                                <button
                                    onClick={() => navigate('/become-organizer')}
                                    className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold shadow-md hover:bg-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {statusState.buttonText}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* List Title */}
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-bold text-gray-900">History</h3>
                                </div>

                                <div className="grid gap-6">
                                    {myRequests.map((req, index) => (
                                        <div
                                            key={req.id || index}
                                            className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:border-purple-200 transition-colors"
                                        >
                                            <div className="p-6 sm:p-8">
                                                {/* Header with Numbering */}
                                                <div className="mb-6 border-b border-gray-100 pb-4">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        Request #{myRequests.length - index}
                                                    </h3>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                                    {/* Reason */}
                                                    <div className="lg:col-span-2">
                                                        <label className="text-sm font-bold text-gray-500 mb-2 block">
                                                            Reason
                                                        </label>
                                                        <div
                                                            className="text-gray-800 text-sm leading-relaxed 
                                                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
                                                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
                                                            [&_li]:my-1
                                                            [&_h1]:text-lg [&_h1]:font-bold [&_h1]:my-2
                                                            [&_h2]:text-base [&_h2]:font-bold [&_h2]:my-2
                                                            [&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-1
                                                            [&_p]:my-2
                                                            [&_strong]:font-bold [&_em]:italic"
                                                            dangerouslySetInnerHTML={{ __html: req.reason || "No reason provided" }}
                                                        />
                                                    </div>

                                                    {/* Status */}
                                                    <div className="flex flex-col justify-start lg:items-center">
                                                        <div className="w-full lg:w-auto text-left lg:text-center">
                                                            <label className="text-sm font-bold text-gray-500 mb-2 block">
                                                                Status
                                                            </label>
                                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold capitalize border ${req.status.toLowerCase() === 'approved'
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : req.status.toLowerCase() === 'rejected'
                                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                                }`}>
                                                                {req.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Date */}
                                                    <div className="flex flex-col justify-start lg:items-end">
                                                        <div className="w-full lg:w-auto text-left lg:text-right">
                                                            <label className="text-sm font-bold text-gray-500 mb-2 block">
                                                                Date
                                                            </label>
                                                            <p className="text-gray-900 font-medium text-sm">
                                                                {(req.created_at || req.updated_at || req.requested_at || req.date) ? new Date(req.created_at || req.updated_at || req.requested_at || req.date).toLocaleString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    hour12: true,
                                                                    timeZone: 'UTC'
                                                                }) : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Rejection Feedback */}
                                                {req.rejection_reason && (
                                                    <div className="mt-8 pt-6 border-t border-gray-100 bg-red-50/50 -mx-6 -mb-6 p-6 sm:-mx-8 sm:-mb-8 sm:p-8">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                                <span className="text-red-600 font-bold text-xs">!</span>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-bold text-red-500 mb-1 block">
                                                                    Feedback
                                                                </label>
                                                                <p className="text-red-700 text-sm font-medium italic">
                                                                    "{req.rejection_reason}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyOrganizerRequests;
