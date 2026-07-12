const VARIANTS = {
  gold: 'btn btn-gold',
  ghost: 'btn btn-ghost',
  danger: 'btn btn-danger',
};

export default function Button({
  children,
  variant = 'ghost',
  icon: Icon,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button type={type} className={`${VARIANTS[variant] || VARIANTS.ghost} ${className}`} {...rest}>
      {Icon && <Icon size={16} strokeWidth={1.75} />}
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, className = '', title, ...rest }) {
  return (
    <button type="button" className={`btn-icon ${className}`} title={title} {...rest}>
      <Icon size={17} strokeWidth={1.75} />
    </button>
  );
}
