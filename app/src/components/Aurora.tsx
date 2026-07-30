export default function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="aurora-a absolute -top-[30%] left-[5%] h-[70vh] w-[70vw] rounded-full opacity-100 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(38 84% 60% / 0.22), transparent)",
        }}
      />
      <div
        className="aurora-b absolute top-[35%] -right-[15%] h-[60vh] w-[55vw] rounded-full opacity-100 blur-[130px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(200 40% 72% / 0.16), transparent)",
        }}
      />
      <div
        className="aurora-a absolute bottom-[-20%] left-[15%] h-[55vh] w-[60vw] rounded-full opacity-100 blur-[140px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(30 70% 62% / 0.14), transparent)",
          animationDelay: "-12s",
        }}
      />
    </div>
  );
}
