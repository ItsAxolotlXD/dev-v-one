/**
 * Windows 10 / Fluent Design System: Reveal Highlight Effect
 * Simulates real-time cursor proximity illumination (Border Reveal & Surface Reveal)
 * on action buttons inside modal dialogs.
 */

let isInitialized = false;

export function initDialogRevealEffect(): () => void {
  if (typeof window === 'undefined' || isInitialized) {
    return () => {};
  }

  isInitialized = true;
  const PROXIMITY_RADIUS = 140; // Pixels around button that trigger border illumination
  let rafId: number | null = null;
  let lastEvent: PointerEvent | null = null;

  const updateButtons = () => {
    rafId = null;
    if (!lastEvent) return;

    const e = lastEvent;
    // Check if any modal dialog or popup with buttons is active on screen
    const dialogs = document.querySelectorAll<HTMLElement>(
      '.fluent-modal-dialog, [role="dialog"], #new-folder-dialog, #example-content-dialog, #welcome-modal-dialog, #under-construction-modal-dialog, #discord-welcome-dialog, #developer-mode-modal-dialog, #custom-stream-dialog, #help-modal-dialog, #news-summary-dialog, #add-stream-dialog, #unsaved-settings-modal-dialog'
    );

    if (!dialogs.length) return;

    dialogs.forEach((dialog) => {
      // Find all buttons inside this dialog / footer
      const buttons = dialog.querySelectorAll<HTMLElement>(
        '.fluent-modal-footer button, button.fluent-btn-primary, button.fluent-btn-secondary, button[class*="fluent-btn"], button[type="submit"], button[type="button"]'
      );

      if (!buttons.length) return;

      buttons.forEach((btn) => {
        // Exclude icon-only close/utility buttons if desired, focus on modal action buttons
        const rect = btn.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Position relative to button top-left
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Clamped distance from pointer to closest point on button boundary
        const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
        const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= PROXIMITY_RADIUS) {
          // Border illumination intensity increases smoothly as cursor approaches
          const borderIntensity = Math.pow(1 - dist / PROXIMITY_RADIUS, 1.2);
          // Surface illumination is strongest when hovering directly over the button
          const isInside = dist === 0;
          const surfaceIntensity = isInside ? 1 : 0;

          btn.style.setProperty('--reveal-x', `${Math.round(x)}px`);
          btn.style.setProperty('--reveal-y', `${Math.round(y)}px`);
          btn.style.setProperty('--reveal-border-opacity', borderIntensity.toFixed(3));
          btn.style.setProperty('--reveal-surface-opacity', surfaceIntensity.toString());
        } else {
          // Far from button, reset reveal opacity if previously set
          if (btn.style.getPropertyValue('--reveal-border-opacity') !== '0') {
            btn.style.setProperty('--reveal-border-opacity', '0');
            btn.style.setProperty('--reveal-surface-opacity', '0');
          }
        }
      });
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    lastEvent = e;
    if (rafId === null) {
      rafId = requestAnimationFrame(updateButtons);
    }
  };

  const handlePointerLeave = () => {
    // When pointer leaves the window, reset all active buttons
    const activeButtons = document.querySelectorAll<HTMLElement>('[style*="--reveal-border-opacity"]');
    activeButtons.forEach((btn) => {
      btn.style.setProperty('--reveal-border-opacity', '0');
      btn.style.setProperty('--reveal-surface-opacity', '0');
    });
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

  return () => {
    isInitialized = false;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerleave', handlePointerLeave);
  };
}
