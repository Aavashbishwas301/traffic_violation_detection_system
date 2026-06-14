import React from 'react';

const BentoCard = ({ children, className = '', title, subtitle, icon: Icon, span = 'col-span-1' }) => {
  return (
    <div className={`bento-card p-8 group ${span} ${className}`}>
      <div className="flex flex-col h-full">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-bento-surface flex items-center justify-center mb-6 group-hover:bg-bento-accent/10 transition-colors duration-500">
            <Icon className="text-bento-muted group-hover:text-bento-accent transition-colors duration-500" size={24} />
          </div>
        )}
        
        {title && <h3 className="text-xl font-black mb-1 leading-tight">{title}</h3>}
        {subtitle && <p className="text-sm font-bold text-bento-muted uppercase tracking-widest mb-6">{subtitle}</p>}
        
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BentoCard;
