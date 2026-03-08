export function LoadingPulse({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-gold animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="font-body text-sm text-brand-muted">{text}</p>
    </div>
  )
}
