const Button = ({ text, onClick, type = "button", fullWidth = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${fullWidth ? 'w-full' : 'px-6'} bg-purple-600 text-white font-medium py-3 rounded-xl hover:bg-purple-700 transition-colors duration-200`}
    >
      {text}
    </button>
  );
};

export default Button;