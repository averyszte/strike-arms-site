export function AboutStatsSection() {
  const stats = [
    { value: "4.7 star", label: "Google Rating" },
    { value: "90+", label: "Reviews" },
    { value: "Dublin", label: "Specialist Store" },
    { value: "Beginner to Advanced", label: "Advice Available" },
  ];

  return (
    <section className="bg-card border-y border-border">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left: Text + Stats */}
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center">
          <span className="inline-block text-accent text-xs font-bold tracking-[0.2em] uppercase mb-6">
            About Strike Arms
          </span>
          <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed mb-12">
            Strike Arms is Dublin's dedicated airsoft specialist. We stock and advise on rifles, pistols, BBs, gas, tactical gear, and accessories - everything you need to get out on the field with the right setup.
          </p>

          <div className="grid grid-cols-2 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col border-t border-border pt-4">
                <span className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </span>
                <span className="text-sm font-semibold text-muted-foreground tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Image */}
        <div className="relative min-h-[400px] lg:min-h-[600px] border-t lg:border-t-0 lg:border-l border-border bg-background">
          <img
            src="/images/about-store.png"
            alt="Strike Arms Store Interior"
            className="absolute inset-0 w-full h-full object-cover grayscale-[0.3]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent lg:bg-gradient-to-r" />
        </div>

      </div>
    </section>
  );
}
