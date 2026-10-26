/**
 * TimerBar.jsx
 * CSS-animated shrinking timer bar.
 * Remount via key={questionIndex} to restart animation.
 */
export default function TimerBar({ duration = 20, onExpire }) {
  return (
    <div
      style={{ height: '100%', borderRadius: 'inherit', overflow: 'hidden' }}
    >
      <div
        className="timer-bar"
        style={{ animationDuration: `${duration}s` }}
        onAnimationEnd={onExpire}
      />
    </div>
  );
}
