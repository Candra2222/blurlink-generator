export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <span className="relative flex h-12 w-12">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-400 border-r-violet-400" />
        <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-violet-400 border-l-blue-400 [animation-direction:reverse] [animation-duration:0.8s]" />
      </span>
      <p className="animate-pulse text-sm text-gray-500">Memuat…</p>
    </div>
  );
}
