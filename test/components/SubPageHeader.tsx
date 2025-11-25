import { motion } from "motion/react";

interface SubPageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
}

export function SubPageHeader({ title, subtitle, description, imageUrl }: SubPageHeaderProps) {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      {imageUrl && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${imageUrl})`,
              opacity: 0.12
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-950/75 to-slate-900/85" />
        </>
      )}

      {/* Subtle Dot Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '48px 48px'
      }} />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50" />
      
      <div className="relative max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {subtitle && (
            <div 
              className="inline-block px-6 py-2.5 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-base uppercase tracking-wider rounded-full mb-8"
              style={{ fontWeight: 600 }}
            >
              {subtitle}
            </div>
          )}
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6 max-w-4xl"
            style={{ fontWeight: 600, letterSpacing: '-0.03em' }}
          >
            {title}
          </h1>
          {description && (
            <p 
              className="text-xl sm:text-2xl text-slate-300 max-w-3xl leading-relaxed"
              style={{ fontWeight: 400 }}
            >
              {description}
            </p>
          )}
        </motion.div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </div>
  );
}
