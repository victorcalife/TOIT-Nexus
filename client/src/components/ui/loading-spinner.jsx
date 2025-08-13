import { Loader2 } from 'lucide-react';

) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin" size={size} />
    </div>
  );
}

export default LoadingSpinner;
