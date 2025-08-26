import { useEffect, useRef } from 'react';

export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Guardar el elemento que tenía el focus antes de abrir el modal
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Función para encontrar elementos focusable
    const getFocusableElements = () => {
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(focusableElements || []) as HTMLElement[];
    };

    // Función para manejar el tab
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Función para enfocar el primer elemento
    const focusFirstElement = () => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // Buscar un input visible primero
        const firstInput = focusableElements.find(el => 
          el.tagName === 'INPUT' && 
          !el.hasAttribute('disabled') && 
          !el.hasAttribute('hidden') &&
          el.getAttribute('type') !== 'hidden'
        );
        
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 50);
        } else {
          setTimeout(() => focusableElements[0].focus(), 50);
        }
      }
    };

    // Agregar event listeners
    document.addEventListener('keydown', handleTabKey);

    // Enfocar el primer elemento después de un breve retraso
    setTimeout(focusFirstElement, 100);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      
      // Restaurar el focus al elemento anterior cuando se cierra el modal
      if (previouslyFocusedElement.current) {
        setTimeout(() => {
          previouslyFocusedElement.current?.focus();
        }, 0);
      }
    };
  }, [active]);

  return containerRef;
}