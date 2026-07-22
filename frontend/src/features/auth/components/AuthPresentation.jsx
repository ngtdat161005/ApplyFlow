import { useEffect, useRef } from 'react';

const SAMPLE_APPLICATIONS = [
  {
    company: 'Canva',
    role: 'Frontend engineering internship',
    nextStep: 'Interview today',
  },
  {
    company: 'Atlassian',
    role: 'Graduate software engineer',
    nextStep: 'Follow up Friday',
  },
  {
    company: 'Airwallex',
    role: 'Product engineering placement',
    nextStep: 'Application submitted',
  },
];

export function AuthPresentation({ children, titleId, variant }) {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointerQuery = window.matchMedia('(pointer: coarse), (hover: none)');

    if (reducedMotionQuery.matches || coarsePointerQuery.matches) {
      page.style.setProperty('--auth-parallax-x', '0px');
      page.style.setProperty('--auth-parallax-y', '0px');
      return undefined;
    }

    let animationFrameId = null;
    let pendingX = 0;
    let pendingY = 0;

    function commitParallaxPosition() {
      page.style.setProperty('--auth-parallax-x', `${pendingX}px`);
      page.style.setProperty('--auth-parallax-y', `${pendingY}px`);
      animationFrameId = null;
    }

    function scheduleParallaxPosition(x, y) {
      pendingX = x;
      pendingY = y;

      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(commitParallaxPosition);
      }
    }

    function handlePointerMove(event) {
      if (event.pointerType === 'touch') {
        return;
      }

      const horizontalProgress = event.clientX / window.innerWidth - 0.5;
      const verticalProgress = event.clientY / window.innerHeight - 0.5;

      scheduleParallaxPosition(horizontalProgress * 16, verticalProgress * 16);
    }

    function handlePointerLeave() {
      scheduleParallaxPosition(0, 0);
    }

    page.addEventListener('pointermove', handlePointerMove);
    page.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      page.removeEventListener('pointermove', handlePointerMove);
      page.removeEventListener('pointerleave', handlePointerLeave);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <main
      className={`auth-page auth-presentation-page auth-presentation-page--${variant}`}
      ref={pageRef}
    >
      <div className="auth-presentation-shell">
        <section
          className="auth-panel auth-presentation-form"
          aria-labelledby={titleId}
        >
          {children}
        </section>

        <aside className="auth-preview" aria-hidden="true">
          <div className="auth-preview-copy">
            <p className="auth-preview-brand">ApplyFlow</p>
            <h2>Keep the next step in sight.</h2>
            <p>
              A calm workspace for applications, interviews, and the follow-ups that
              move your search forward.
            </p>
          </div>

          <div className="auth-preview-frame">
            <header className="auth-preview-header">
              <div>
                <p className="auth-preview-title">Application plan</p>
                <p className="auth-preview-sample">Sample data</p>
              </div>
              <p className="auth-preview-period">This week</p>
            </header>

            <div className="auth-preview-list">
              {SAMPLE_APPLICATIONS.map((application) => (
                <article className="auth-preview-item" key={application.company}>
                  <span className="auth-preview-marker" />
                  <div>
                    <h3>{application.company}</h3>
                    <p>{application.role}</p>
                  </div>
                  <p className="auth-preview-next-step">{application.nextStep}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
