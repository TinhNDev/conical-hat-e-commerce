export const PageSkeleton = () => {
  return (
    <div className="space-y-8 pb-10 animate-pulse">
      <div className="rounded-[2rem] border border-stone-200 bg-stone-100 px-6 py-10">
        <div className="h-3 w-28 rounded-full bg-stone-200" />
        <div className="mt-5 h-12 w-full max-w-2xl rounded-full bg-stone-200" />
        <div className="mt-4 h-4 w-full max-w-xl rounded-full bg-stone-200" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white"
          >
            <div className="h-64 bg-stone-100" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-20 rounded-full bg-stone-200" />
              <div className="h-8 w-3/4 rounded-full bg-stone-200" />
              <div className="h-4 w-full rounded-full bg-stone-200" />
              <div className="h-4 w-5/6 rounded-full bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
