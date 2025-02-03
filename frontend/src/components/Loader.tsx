import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary';
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const baseColorClasses = {
    primary: 'bg-purple-300'
  };

  return (
    <div className={`flex items-center gap-3`}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${baseColorClasses[color]} rounded-full animate-[bounce_0.8s_cubic-bezier(0.28,0.84,0.42,1)_infinite]`}
          style={{
            animationDelay: `${i * 0.2}s`,
            transform: 'translateY(0)',
            animationDirection: 'alternate'
          }}
        />
      ))}
    </div>
  );
};

export default Loader;