import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 prose prose-lg dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> 2025-09-24</p>

      <h2 id="contents" className="sr-only">Contents</h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="toc">
          <AccordionTrigger>Contents</AccordionTrigger>
          <AccordionContent>
            <ol>
              <li><a href="#who-we-are">1. Who We Are</a></li>
              <li><a href="#definitions">2. Definitions</a></li>
              <li><a href="#categories-of-personal-data">3. Categories of Personal Data</a></li>
              <li><a href="#purposes-and-legal-bases">4. Purposes and Legal Bases</a></li>
              <li><a href="#where-we-process-and-store-data">5. Where We Process and Store Data</a></li>
              <li><a href="#processors-and-recipients">6. Processors and Recipients</a></li>
              <li><a href="#retention">7. Retention</a></li>
              <li><a href="#your-rights">8. Your Rights</a></li>
              <li><a href="#children">9. Children</a></li>
              <li><a href="#security">10. Security</a></li>
              <li><a href="#dpa">11. Data Processing Addendum (DPA)</a></li>
              <li><a href="#changes">12. Changes</a></li>
              <li><a href="#contact">13. Contact</a></li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 id="who-we-are"><span className="text-sm font-semibold mr-2 text-muted-foreground">1.</span> Who We Are</h2>
      <p>
        Food2Photo (the “Service”) enhances your real food photos using generative AI. We are the controller for your personal data when you use the Service. Contact: <a href="mailto:support@food2photo.com">support@food2photo.com</a>.
      </p>

      <h2 id="definitions"><span className="text-sm font-semibold mr-2 text-muted-foreground">2.</span> Definitions</h2>
      <ul>
        <li><strong>Controller:</strong> the entity that determines the purposes and means of processing personal data (Food2Photo for this Service).</li>
        <li><strong>Processor:</strong> a service provider processing personal data on our behalf under our instructions.</li>
        <li><strong>Personal data:</strong> any information relating to an identified or identifiable natural person.</li>
        <li><strong>EEA:</strong> the European Economic Area (EU member states, Iceland, Liechtenstein, Norway).</li>
      </ul>

      <h2 id="categories-of-personal-data"><span className="text-sm font-semibold mr-2 text-muted-foreground">3.</span> Categories of Personal Data</h2>
      <ul>
        <li><strong>Account and Authentication:</strong> email address and authentication/session data.</li>
        <li><strong>Content:</strong> images you upload and Outputs we generate for you.</li>
        <li><strong>Billing:</strong> purchase metadata (handled by payments providers), subscription/credit info.</li>
        <li><strong>Technical and Usage:</strong> IP address, device/browser info, logs, and events for reliability, security, and rate limiting.</li>
        <li><strong>Communications:</strong> your messages to support or feedback you provide.</li>
      </ul>

      <h2 id="purposes-and-legal-bases"><span className="text-sm font-semibold mr-2 text-muted-foreground">4.</span> Purposes and Legal Bases (GDPR/UK GDPR)</h2>
      <ul>
        <li><strong>Provide and operate the Service:</strong> perform our contract with you (Art. 6(1)(b)).</li>
        <li><strong>Security, fraud/abuse prevention, and service reliability:</strong> our legitimate interests in safe and reliable operations (Art. 6(1)(f)).</li>
        <li><strong>Payments and accounting:</strong> compliance with legal obligations (Art. 6(1)(c)).</li>
        <li><strong>Product improvement and support communications:</strong> legitimate interests (Art. 6(1)(f)).</li>
        <li><strong>Optional communications (e.g., marketing):</strong> your consent where required (Art. 6(1)(a)), which you may withdraw at any time.</li>
      </ul>

      <h2 id="where-we-process-and-store-data"><span className="text-sm font-semibold mr-2 text-muted-foreground">5.</span> Where We Process and Store Data</h2>
      <p>
        Hosting is primarily located in Germany (EU). Some processing may occur in other regions depending on provider configuration and availability. Where data is transferred outside the EEA/UK, we use appropriate safeguards such as Standard Contractual Clauses or rely on adequacy decisions, as applicable.
      </p>

      <h2 id="processors-and-recipients"><span className="text-sm font-semibold mr-2 text-muted-foreground">6.</span> Processors and Recipients</h2>
      <ul>
        <li><strong>Authentication and data services providers.</strong></li>
        <li><strong>Payments processing providers.</strong></li>
        <li><strong>Hosting, edge/network, and content delivery providers.</strong></li>
        <li><strong>AI model and gateway providers for image generation.</strong></li>
        <li><strong>Analytics, logging, email, and customer support providers.</strong></li>
      </ul>

      <h2 id="retention"><span className="text-sm font-semibold mr-2 text-muted-foreground">7.</span> Retention</h2>
      <ul>
        <li><strong>Account data:</strong> retained while your account is active. If you delete your account, we will delete or anonymize personal data unless retention is required by law.</li>
        <li><strong>Uploads and Outputs:</strong> retained temporarily for operational reliability, abuse prevention, and debugging; we do not sell your images.</li>
        <li><strong>Billing records:</strong> retained for the legally required period for accounting/tax purposes.</li>
        <li><strong>Logs:</strong> retained for a reasonable period for security and troubleshooting.</li>
      </ul>

      <h2 id="your-rights"><span className="text-sm font-semibold mr-2 text-muted-foreground">8.</span> Your Rights</h2>
      <ul>
        <li>Request access to your personal data and receive a copy.</li>
        <li>Request rectification or erasure of your data.</li>
        <li>Request restriction of processing or object to processing.</li>
        <li>Request data portability.</li>
        <li>Withdraw consent at any time, where applicable, without affecting prior processing.</li>
        <li>Lodge a complaint with a supervisory authority in the EEA/UK.</li>
      </ul>

      <h2 id="children"><span className="text-sm font-semibold mr-2 text-muted-foreground">9.</span> Children</h2>
      <p>
        The Service is not intended for children under 16. Do not create an account or upload personal data of children.
      </p>

      <h2 id="security"><span className="text-sm font-semibold mr-2 text-muted-foreground">10.</span> Security</h2>
      <p>
        We implement appropriate technical and organizational measures designed to protect personal data. No system is perfectly secure.
      </p>

      <h2 id="dpa"><span className="text-sm font-semibold mr-2 text-muted-foreground">11.</span> Data Processing Addendum (DPA)</h2>
      <p>
        If you require a Data Processing Addendum (DPA) as a business customer, contact us at <a href="mailto:support@food2photo.com">support@food2photo.com</a>. We can provide a DPA incorporating the EU Standard Contractual Clauses and, where needed, the UK Addendum.
      </p>

      <h2 id="changes"><span className="text-sm font-semibold mr-2 text-muted-foreground">12.</span> Changes</h2>
      <p>
        We may update this policy to reflect changes to our practices or for legal reasons. We will indicate the latest update date above. If changes are material, we will provide additional notice (e.g., in‑app or email).
      </p>

      <h2 id="contact"><span className="text-sm font-semibold mr-2 text-muted-foreground">13.</span> Contact</h2>
      <p>
        Contact <a href="mailto:support@food2photo.com">support@food2photo.com</a> for privacy questions or to exercise your rights.
      </p>
    </div>
  );
}


