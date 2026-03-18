import Partners from "../Partners";

export default function Clients() {
  return (
    <div id="clients" className="relative z-1 bg-background">
      <div className="wrapper flex-col flex-center gap-13.5 overflow-hidden px-0 max-w-screen">
        <div className="flex flex-col self-start px-4.5 gap-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Trusted by
          </p>
          <h2 className="header">Clients &amp; partners</h2>
        </div>

        <div className="group relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-2 sm:w-30 w-8 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-2 sm:w-30 w-8 bg-linear-to-l from-background to-transparent" />
          <Partners />
        </div>

        {/* Quote strip */}
        <blockquote className="text-center max-w-3xl mt-20">
          <p className=" text-sm md:text-base italic leading-loose">
            &ldquo;LAWAL delivers work that is not just functional, but
            thoughtfully architected interfaces you feel before you understand
            why.&rdquo;
          </p>
          <cite className="not-italic text-xs text-muted-foreground mt-3 block uppercase tracking-widest">
            — Client feedback, 2024
          </cite>
        </blockquote>
      </div>
    </div>
  );
}
