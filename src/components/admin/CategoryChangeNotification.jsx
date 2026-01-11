import { AlertTriangle, Sparkles, X } from 'lucide-react';

const CategoryChangeNotification = ({
    isOpen,
    onClose,
    onUpdateRelations,
    categoryName,
    action = 'created'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 ring-4 ring-amber-100">
                        <Sparkles className="w-8 h-8 text-amber-600" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Category {action === 'created' ? 'Created' : 'Updated'} Successfully!
                    </h3>

                    {/* Category Name Badge */}
                    <div className="mb-4 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-sm font-semibold text-indigo-700">{categoryName}</p>
                    </div>

                    {/* Message */}
                    <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <div className="flex gap-2 items-start">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                                <p className="text-sm font-semibold text-amber-900 mb-1">
                                    Update Category Relations
                                </p>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    To ensure accurate event recommendations, please update the category relatedness scores
                                    to reflect how this category relates to others.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Remind Me Later
                        </button>
                        <button
                            onClick={() => {
                                onUpdateRelations();
                                onClose();
                            }}
                            className="flex-1 px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Update Relations Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryChangeNotification;
