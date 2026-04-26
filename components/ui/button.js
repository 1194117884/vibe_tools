export function Button({ children, onClick, variant = 'primary', size = 'default', className = '', ...props }) {
  const sizeClasses = {
    default: 'px-[15px] py-2 text-control font-medium',
    sm: 'px-3 py-1.5 text-micro font-medium',
    lg: 'px-5 py-2.5 text-body font-medium',
  };

  const variants = {
    primary:
      'bg-primary text-primaryText hover:bg-primaryHover focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] transition-transform',
    dark:
      'bg-secondary text-secondaryText hover:bg-secondaryHover focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] transition-transform',
    outline:
      'border border-border text-text bg-transparent hover:bg-surfaceHover focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] transition-transform',
    ghost:
      'text-primary hover:bg-surfaceHover focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none active:scale-[0.97] transition-transform',
  };

  return (
    <button
      className={`rounded inline-flex items-center justify-center gap-1.5 transition-colors duration-150 ${sizeClasses[size]} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
