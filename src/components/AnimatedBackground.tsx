// One calm ambient wash. No mouse tracking, no grid overlay, no glow orbs —
// those read as generated decoration. Static markup, zero client JS.
export default function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 40rem at 50% -10%, rgba(124, 58, 237, 0.16), transparent 70%)',
        }}
      />
    </div>
  );
}
