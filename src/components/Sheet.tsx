import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Bottom sheet / modal. */
export function Sheet({ open, children, onClose, label }: { open: boolean; children: ReactNode; onClose?: () => void; label: string }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 mx-auto flex max-w-md flex-col justify-end" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="safe-b relative rounded-t-3xl p-5" style={{ background: 'var(--card)' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
