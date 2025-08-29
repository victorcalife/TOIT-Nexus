import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ className = '', size = 24 }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin" size={size} />
    </div>
  );
};

export { LoadingSpinner };
export default LoadingSpinner;