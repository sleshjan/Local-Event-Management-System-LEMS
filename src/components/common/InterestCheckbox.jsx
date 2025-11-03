const InterestCheckbox = ({ label, checked, onChange, name, icon: Icon }) => {
  return (
    <label className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all group">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
      />
      {Icon && (
        <Icon className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors shrink-0" />
      )}
      <span className="text-gray-700 text-sm select-none flex-1">{label}</span>
    </label>
  );
};

export default InterestCheckbox;