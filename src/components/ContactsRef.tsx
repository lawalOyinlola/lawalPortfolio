import ContactButtons from "./ui/ContactButtons";

function ContactsRef() {
  return (
    <div className="sticky top-0 h-screen bg-background flex-center">
      <div className="wrapper max-w-screen w-full min-h-screen pt-4.5 flex flex-col gap-19">
        <div className="relative mt-2 grow w-full flex justify-end items-end overflow-hidden tv-static">
          <div className="tv-static-overlay" />
          <h2 className="contact-title">
            <span className="inline-block bg-background px-2 py-1">
              LET&apos;S EXECUTE
            </span>
            <br />
            <span className="inline-block bg-background px-2 py-1">
              YOUR NEXT PROJECT
            </span>
          </h2>
        </div>

        <div className="mt-auto w-full flex justify-end pb-4">
          <ContactButtons />
        </div>
      </div>
    </div>
  );
}

export default ContactsRef;
