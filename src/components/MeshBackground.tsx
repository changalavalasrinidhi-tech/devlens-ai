export function MeshBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-[#05070B]" />
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-blob" />
      <div
        className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[130px] animate-blob"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute bottom-[-5%] left-[30%] w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[140px] animate-blob"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="absolute top-[50%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] animate-blob"
        style={{ animationDelay: '1s' }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05070B]" />
      <div className="absolute inset-0 noise-overlay opacity-[0.015] mix-blend-overlay" />
    </div>
  );
}
