const Checkbox = ({ label, checked, onChange, name }) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
      />
      <label className="text-sm text-gray-600 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;