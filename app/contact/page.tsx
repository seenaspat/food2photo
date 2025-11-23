export default function ContactPage() {
  return (
    <div className="mx-auto w-full lg:min-h-[70vh] max-w-3xl px-4 py-16">
      <h1 className="font-medium text-3xl mb-4">Contact</h1>
      <p className="text-muted-foreground mb-6">
        Need help or have a question about Food2Photo? Reach out and we’ll get back to you.
      </p>
      <div className="grid gap-2 text-sm">
        <p>
          Email: <a className="underline" href="mailto:support@food2photo.com">support@food2photo.com</a>
        </p>
      </div>
    </div>
  );
}


