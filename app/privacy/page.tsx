export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <h2>What We Collect</h2>
      <ul>
        <li>Account details (email and authentication metadata).</li>
        <li>Uploaded images for processing, and generated outputs.</li>
        <li>Usage data (e.g., feature usage, errors, performance).</li>
      </ul>

      <h2>How We Use Data</h2>
      <ul>
        <li>Provide and operate Food2Photo features.</li>
        <li>Improve quality, reliability, and safety of the service.</li>
        <li>Communicate about updates and respond to support requests.</li>
      </ul>

      <h2>Image Processing & Retention</h2>
      <p>
        Images are processed to generate results. We may temporarily retain
        uploads and outputs for operational reliability, abuse prevention, and
        debugging. We do not sell your images.
      </p>

      <h2>Third‑Party Services</h2>
      <p>
        We use trusted third‑party providers for hosting, storage, analytics,
        and image generation. These providers process data on our behalf and are
        bound by their own terms and security practices.
      </p>

      <h2>Data Security</h2>
      <p>
        We apply reasonable technical and organizational measures to protect
        data. No system is perfectly secure; use the service accordingly.
      </p>

      <h2>Your Choices</h2>
      <ul>
        <li>Delete your account or request data deletion by contacting support.</li>
        <li>Opt out of non‑essential communications.</li>
      </ul>

      <h2>Children</h2>
      <p>
        Food2Photo is not directed to children under 13. Do not use the service
        if you are under the minimum age in your jurisdiction.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Contact <a href="mailto:support@food2photo.app">support@food2photo.app</a>.
      </p>
    </div>
  );
}


