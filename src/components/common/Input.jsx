const Input = ({ label, type = "text", placeholder, value, onChange, onBlur, name }) => {
  return (
    <div className="w-full">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
      />
    </div>
  );
};

export default Input; 