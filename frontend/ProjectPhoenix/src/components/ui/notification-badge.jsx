import { cn } from "@/lib/utils";

const NotificationBadge = ({ 
  count, 
  variant = "default", 
  size = "default", 
  className,
  children,
  ...props 
}) => {
  const variants = {
    default: "bg-red-500 text-white",
    success: "bg-green-500 text-white", 
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
    secondary: "bg-gray-500 text-white"
  };

  const sizes = {
    sm: "h-4 w-4 text-xs",
    default: "h-5 w-5 text-xs",
    lg: "h-6 w-6 text-sm"
  };

  if (!count || count === 0) {
    return children;
  }

  return (
    <div className="relative inline-block">
      {children}
      <span
        className={cn(
          "absolute -top-1 -right-1 rounded-full flex items-center justify-center font-medium",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {count > 99 ? "99+" : count}
      </span>
    </div>
  );
};

export default NotificationBadge;
