export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 prose dark:prose-invert">
      <h1>Terms & Conditions</h1>
      <p>Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <h2>1. Overview</h2>
      <p>
        Food2Photo is a web application that enhances your real food photos by
        composing them into lifelike environments using generative AI. You upload
        an image of a dish (and optionally a background), choose settings like
        lens look and aspect ratio, and we generate a new image.
      </p>

      <h2>2. Acceptable Use</h2>
      <ul>
        <li>Only upload content you own or have rights to use.</li>
        <li>No illegal, harmful, pornographic, or infringing content.</li>
        <li>No attempts to reverse engineer, scrape, or attack the service.</li>
      </ul>

      <h2>3. Your Content</h2>
      <p>
        You retain ownership of the images you upload and the results we generate
        for you. By using the service, you grant Food2Photo a license to process
        your content for the purpose of providing the service and improving core
        functionality (e.g., debugging and quality assurance). We do not sell
        your images.
      </p>

      <h2>4. Generated Outputs</h2>
      <p>
        Generated images may contain artifacts or inaccuracies. We strive for
        hyperrealistic results aligned with professional food photography, but we
        do not guarantee fitness for any specific purpose. You are responsible
        for reviewing and using outputs appropriately.
      </p>

      <h2>5. Plans, Billing, and Limits</h2>
      <p>
        Plan limits (e.g., number of generations, quality tiers) are described on
        the Pricing page and may change with notice. Subscriptions renew
        automatically until canceled. Cancellations take effect at the end of the
        current billing period. Fees are non‑refundable except where required by
        law.
      </p>

      <h2>6. Privacy</h2>
      <p>
        We store minimal account and session data to operate the app. Uploaded
        images are processed to deliver results and may be retained temporarily
        for reliability and abuse prevention. See our Privacy section (or contact
        us) for details.
      </p>

      <h2>7. Third‑Party Services</h2>
      <p>
        We use third‑party providers (e.g., image processing, hosting, payments).
        Your use of Food2Photo constitutes agreement to their terms as applicable.
      </p>

      <h2>8. Prohibited Commercial Uses</h2>
      <p>
        Unless explicitly permitted, you may not resell access, provide the
        service as a hosted white‑label, or use it to train competing models.
      </p>

      <h2>9. Disclaimers and Limitation of Liability</h2>
      <p>
        The service is provided “as is” without warranties. To the maximum extent
        permitted by law, we are not liable for lost profits, data, or indirect
        damages arising from your use of the service.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend or terminate access for violations or risk to the service.
        You may stop using the service at any time.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions? Contact <a href="mailto:support@food2photo.app">support@food2photo.app</a>.
      </p>
    </div>
  );
}


