import Partners from "./Partners";

export default function Clients() {
  return (
    <section className="flex-center relative z-1">
      <div className="wrapper max-w-screen flex-col flex-center gap-13.5 overflow-hidden bg-background px-0">
        <p>Proud to have worked with...</p>

        <div className="group relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-2 sm:w-30 w-8 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-2 sm:w-30 w-8 bg-linear-to-l from-background to-transparent" />

          <Partners />
        </div>
      </div>
    </section>
  );
}
