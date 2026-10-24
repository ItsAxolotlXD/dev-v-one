import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, CheckCircle2, FileText } from 'lucide-react';
import { NewsArticle } from '../types';
import { exportArticleToDocx } from '../utils/docxExport';
import { useSettings } from '../hooks/useSettings';
import { SpinningRing } from './SpinningRing';

interface NewsSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle;
}

export const NewsSummaryModal: React.FC<NewsSummaryModalProps> = ({
  isOpen,
  onClose,
  article
}) => {
  const { settings } = useSettings();
  const shouldAnimate = !settings.reduceAllMotion && settings.animateModals;
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 3-second summary generation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsLoading(true);
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } else {
      setIsLoading(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, article.id]);

  // Generate structured summary bullet points from article content or explicit summary
  const bulletPoints = article.summary?.points && article.summary.points.length > 0
    ? article.summary.points
    : article.content.slice(0, 3).map((p) => {
        const firstSentence = p.split(/[.!?]/)[0];
        return firstSentence.length > 20 ? firstSentence + '.' : p;
      });

  const leadText = article.summary?.lead || article.excerpt;

  const handleCopySummary = () => {
    const pointsFormatted = bulletPoints.map((b) => `- ${b}`).join('\n');
    const conclusionText = article.summary?.conclusion ? `\n\n${article.summary.conclusion}` : '';
    const summaryText = `[ARTICLE SUMMARY - ${article.title}]\n\n• ${leadText}\n\nKey Highlights:\n${pointsFormatted}${conclusionText}\n\nSource: Sparkle (Dev) News (${article.publishedAt})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      await exportArticleToDocx(article);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="news-summary-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* Backdrop with zero blur */}
          <motion.div
            id="news-summary-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* Windows 10 Blue Dialog Box */}
          <motion.div
            id="news-summary-dialog"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.98,
              transition: {
                duration: 0.15,
                ease: 'easeOut'
              }
            }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[520px] bg-[#0078d4] text-white rounded-none shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-[#005a9e] overflow-hidden"
          >
            {/* Top thin caption */}
            <div className="px-6 py-2.5 bg-[#0063b1] text-xs font-normal text-white/90 select-none">
              Articles & News
            </div>

            {/* Header & Body Area */}
            <div className="p-6 pt-5 pb-4">
              <h2 className="text-2xl sm:text-[26px] font-normal text-white tracking-tight leading-snug">
                Article Summary
              </h2>

              {/* Loading State */}
              {isLoading ? (
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-3 my-2">
                  <div className="flex items-center justify-center py-2">
                    <SpinningRing size={48} strokeWidth={4} color="#ffffff" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-normal text-white">
                      Processing article...
                    </h3>
                    <p className="text-xs text-white/80 max-w-[300px]">
                      Extracting key insights and highlights
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                      {article.category}
                    </span>
                    <h3 className="text-base font-normal text-white mt-0.5 leading-snug">
                      {article.title}
                    </h3>
                  </div>

                  {/* Core takeaway */}
                  <div className="p-3 bg-black/15 border border-white/20">
                    <p className="text-[13px] font-normal text-white/95 leading-relaxed">
                      "{leadText}"
                    </p>
                  </div>

                  {/* Bullet points */}
                  <div>
                    <h4 className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wide">
                      Key Highlights:
                    </h4>
                    <div className="space-y-1.5">
                      {bulletPoints.map((bp, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-black/15 border border-white/15 text-[13px] text-white flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-none bg-white/20 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="leading-relaxed font-normal">{bp}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {article.summary?.conclusion && (
                    <div className="p-3 bg-black/15 border border-white/15 text-[13px] text-white/95 leading-relaxed font-normal">
                      {article.summary.conclusion}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-white/70 pt-2 border-t border-white/15">
                    <span>Category: <strong className="text-white">{article.category}</strong></span>
                    <span>Published: {article.publishedAt}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#0078d4] px-6 py-4 pt-2 flex items-center justify-end gap-3">
              {!isLoading && (
                <>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="fluent-btn-primary min-w-[85px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    disabled={exporting}
                    className="fluent-btn-secondary min-w-[85px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{exporting ? 'Exporting...' : 'Export'}</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="fluent-btn-secondary min-w-[85px] px-6 py-1.5 border-2 border-white bg-transparent hover:bg-white hover:text-[#0078d4] active:bg-white/90 text-white text-sm font-medium rounded-none transition-colors cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
