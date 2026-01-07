import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12 md:py-16 prose-sm sm:prose-base md:prose-lg dark:prose-invert">
      <h1>Terms of Service</h1>
      <p><strong>Last updated:</strong> 2025-09-24</p>

      <h2 id="contents" className="sr-only">Contents</h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="toc">
          <AccordionTrigger>Contents</AccordionTrigger>
          <AccordionContent>
            <ol>
              <li><a href="#agreement-to-terms">1. Agreement to Terms</a></li>
              <li><a href="#definitions">2. Definitions</a></li>
              <li><a href="#who-we-are">3. Who We Are</a></li>
              <li><a href="#accounts-and-eligibility">4. Accounts and Eligibility</a></li>
              <li><a href="#service-and-availability">5. Service and Availability</a></li>
              <li><a href="#user-content-and-outputs">6. User Content and Outputs</a></li>
              <li><a href="#generated-outputs-and-model-policies">7. Generated Outputs and Model Policies</a></li>
              <li><a href="#acceptable-use">8. Acceptable Use</a></li>
              <li><a href="#fees-subscriptions-credits-and-taxes">9. Fees, Subscriptions, Credits, and Taxes</a></li>
              <li><a href="#trials-promotions-and-betas">10. Free Trials, Promotions, and Beta Features</a></li>
              <li><a href="#fair-use-rate-limiting-and-abuse-prevention">11. Fair Use, Rate Limiting, and Abuse Prevention</a></li>
              <li><a href="#intellectual-property">12. Intellectual Property</a></li>
              <li><a href="#feedback">13. Feedback</a></li>
              <li><a href="#third-party-services">14. Third‑Party Services</a></li>
              <li><a href="#privacy-and-data-protection">15. Privacy and Data Protection (GDPR/UK GDPR)</a></li>
              <li><a href="#disclaimers">16. Disclaimers</a></li>
              <li><a href="#limitation-of-liability">17. Limitation of Liability</a></li>
              <li><a href="#indemnification">18. Indemnification</a></li>
              <li><a href="#term-suspension-and-termination">19. Term, Suspension, and Termination</a></li>
              <li><a href="#governing-law-and-venue">20. Governing Law and Venue</a></li>
              <li><a href="#changes">21. Changes to the Service and Terms</a></li>
              <li><a href="#miscellaneous">22. Miscellaneous</a></li>
              <li><a href="#contact">23. Contact</a></li>
              <li><a href="#important-notice">Important Notice</a></li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 id="agreement-to-terms"><span className="text-sm font-semibold mr-2 text-muted-foreground">1.</span> Agreement to Terms</h2>
      <p>
        These Terms of Service (the “<em><strong>Terms</strong></em>”) govern your access to and use of Food2Photo (the “<em><strong>Service</strong></em>”).
        By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
      </p>

      <h2 id="definitions"><span className="text-sm font-semibold mr-2 text-muted-foreground">2.</span> Definitions</h2>
      <ul>
        <li><em><strong>Service</strong></em>: the Food2Photo application, websites, APIs, and related services.</li>
        <li><em><strong>User</strong></em>: any person or entity that accesses or uses the Service.</li>
        <li><em><strong>User Content</strong></em>: images and other materials you upload or submit to the Service.</li>
        <li><em><strong>Outputs</strong></em>: images or other results generated for you by the Service.</li>
        <li><em><strong>Credits</strong></em>: units used to access generation features or quotas.</li>
        <li><em><strong>Subscription</strong></em>: a paid plan that renews periodically unless cancelled.</li>
      </ul>

      <h2 id="who-we-are"><span className="text-sm font-semibold mr-2 text-muted-foreground">3.</span> Who We Are</h2>
      <p>
        Food2Photo is an online service that enhances your real food photos by composing them into lifelike environments using generative AI.
        Contact: <a href="mailto:support@food2photo.com">support@food2photo.com</a>.
      </p>

      <h2 id="accounts-and-eligibility"><span className="text-sm font-semibold mr-2 text-muted-foreground">4.</span> Accounts and Eligibility</h2>
      <ul>
        <li>You must be at least 16 years old to use the Service. If local law sets a higher age of digital consent, that higher age applies.</li>
        <li>You are responsible for maintaining the confidentiality of your account and for all activity under it.</li>
        <li>We may suspend or terminate accounts that violate these Terms or present risk to the Service or others.</li>
      </ul>

      <h2 id="service-and-availability"><span className="text-sm font-semibold mr-2 text-muted-foreground">5.</span> Service and Availability</h2>
      <p>
        You upload an image of a dish (and optionally a background), choose settings like lens look and aspect ratio, and we generate a new image.
        Results are produced using third‑party AI models through a gateway and may vary between attempts.
      </p>

      <h2 id="user-content-and-outputs"><span className="text-sm font-semibold mr-2 text-muted-foreground">6.</span> User Content and Outputs</h2>
      <ul>
        <li><strong>Ownership:</strong> You retain ownership of the images and other content you upload (“User Content”) and of the outputs we generate for you (“Outputs”).</li>
        <li><strong>License to Operate the Service:</strong> You grant Food2Photo a worldwide, non‑exclusive, royalty‑free license to host, process, transmit, cache, and display your User Content and Outputs solely to provide, maintain, secure, and improve core functionality (e.g., debugging, abuse prevention). We do not sell your images.</li>
        <li><strong>Permissions for Showcasing:</strong> We will not use your User Content or Outputs for marketing without your explicit permission.</li>
        
      </ul>

      <h2 id="generated-outputs-and-model-policies"><span className="text-sm font-semibold mr-2 text-muted-foreground">7.</span> Generated Outputs and Model Policies</h2>
      <ul>
        <li><strong>Nature of Outputs:</strong> Outputs may contain artifacts or inaccuracies. We strive for hyperrealistic results aligned with professional food photography, but do not guarantee any specific outcome or fitness for a particular purpose. You are responsible for reviewing Outputs before use.</li>
        <li><strong>Use Restrictions:</strong> Do not use Outputs in ways that violate law or third‑party rights (e.g., trademarks, copyrights, publicity rights) or the applicable model provider policies. Where outputs are influenced by your uploaded content, you must have the rights and permissions for that content.</li>
        <li><strong>Attribution and Policies:</strong> Some jurisdictions or uses may require disclosure that an image was AI‑generated; you are responsible for any such compliance.</li>
      </ul>

      <h2 id="acceptable-use"><span className="text-sm font-semibold mr-2 text-muted-foreground">8.</span> Acceptable Use</h2>
      <ul>
        <li>Only upload content you own or have rights to use.</li>
        <li>No illegal, harmful, pornographic, exploitative, hateful, or infringing content.</li>
        <li>No depictions of real persons without their consent; no content involving minors.</li>
        <li>No attempts to reverse engineer, scrape, overload, or attack the Service or its providers.</li>
        <li>No use to build, train, or fine‑tune competing models unless we explicitly permit it.</li>
        <li>Comply with all applicable laws and regulations.</li>
      </ul>

      <h2 id="fees-subscriptions-credits-and-taxes"><span className="text-sm font-semibold mr-2 text-muted-foreground">9.</span> Fees, Subscriptions, Credits, and Taxes</h2>
      <ul>
        <li>Plan limits (e.g., number of generations, quality tiers) are described on the <a href="/pricing">Pricing</a> page and may change with notice.</li>
        <li>Subscriptions renew automatically until canceled. Cancellations take effect at the end of the current billing period.</li>
        <li>Payments are processed by payment providers; by paying, you also agree to the applicable provider’s terms. We do not store your full payment card details.</li>
        <li>Unless required by law, fees and credits are non‑refundable. For one‑off credit packs, access is delivered immediately after purchase.</li>
        <li>For EU/UK consumers: by purchasing digital credits for immediate use, you consent to immediate performance and acknowledge loss of the 14‑day withdrawal right once performance begins.</li>
        <li>You are responsible for any applicable taxes and for keeping your billing information accurate.</li>
      </ul>

      <h2 id="trials-promotions-and-betas"><span className="text-sm font-semibold mr-2 text-muted-foreground">10.</span> Free Trials, Promotions, and Beta Features</h2>
      <ul>
        <li><strong>Trials/Promotions:</strong> We may offer time‑limited or feature‑limited trials or promotions. After the trial, charges may apply unless you cancel before the end of the trial.</li>
        <li><strong>Beta Features:</strong> Beta or experimental features are provided “as is,” may change or end at any time, and may be subject to additional terms. They are not guaranteed to be available or stable.</li>
      </ul>

      <h2 id="fair-use-rate-limiting-and-abuse-prevention"><span className="text-sm font-semibold mr-2 text-muted-foreground">11.</span> Fair Use, Rate Limiting, and Abuse Prevention</h2>
      <p>
        To protect the Service, we employ rate limits, idempotency checks, and abuse detection. Attempts to bypass limits or abuse the Service may result in suspension.
      </p>

      <h2 id="intellectual-property"><span className="text-sm font-semibold mr-2 text-muted-foreground">12.</span> Intellectual Property</h2>
      <h2 id="feedback"><span className="text-sm font-semibold mr-2 text-muted-foreground">13.</span> Feedback</h2>
      <p>
        If you provide feedback or suggestions, you grant us a non‑exclusive, perpetual, irrevocable, worldwide, royalty‑free license to use that feedback without restriction or compensation.
      </p>

      <ul>
        <li>The Service (including software, templates, text, graphics, and trademarks) is owned by or licensed to Food2Photo and is protected by law. We grant you a limited, revocable, non‑exclusive, non‑transferable license to use the Service in accordance with these Terms.</li>
        <li>Except as permitted by law, do not copy, modify, distribute, host, sell, or lease any part of the Service.</li>
      </ul>

      <h2 id="third-party-services"><span className="text-sm font-semibold mr-2 text-muted-foreground">14.</span> Third‑Party Services</h2>
      <p>
        We use third‑party providers to operate the Service, including providers for authentication and data services, payments processing, hosting, networking, and AI model/gateway services. Your use of Food2Photo constitutes agreement to applicable third‑party terms as they apply to features you use. Hosting is primarily located in Germany (EU); some processing may occur in other regions depending on service configuration and availability.
      </p>

      <h2 id="privacy-and-data-protection"><span className="text-sm font-semibold mr-2 text-muted-foreground">15.</span> Privacy and Data Protection (GDPR/UK GDPR)</h2>
      <p>
        We process personal data in accordance with our <a href="/privacy">Privacy Policy</a>. For transparency under the GDPR/UK GDPR, the following key points apply:
      </p>
      <ul>
        <li><strong>Controller:</strong> Food2Photo (contact: <a href="mailto:support@food2photo.com">support@food2photo.com</a>).</li>
        <li><strong>Categories:</strong> account identifiers (e.g., email), authentication/session data, usage logs and IP address for security and rate limiting, purchase metadata (via Stripe), images you upload, and Outputs we generate for you.</li>
        <li><strong>Purposes and Legal Bases:</strong> to provide the Service and fulfill our contract with you (Art. 6(1)(b)); to maintain security, prevent abuse, and improve core functionality (legitimate interests, Art. 6(1)(f)); to comply with legal obligations (Art. 6(1)(c)); and, where applicable, with your consent (Art. 6(1)(a)), e.g., for optional communications.</li>
        <li><strong>Processors/Recipients:</strong> service providers such as authentication and data services, payments processing, hosting/networking and content delivery, AI model and gateway services, and analytics, logging, email, and support providers.</li>
        <li><strong>Transfers:</strong> where data is transferred outside your jurisdiction, we rely on appropriate safeguards such as Standard Contractual Clauses or adequacy decisions, as applicable.</li>
        <li><strong>Retention:</strong> account data is retained while your account is active; billing records are retained to meet legal/financial requirements; uploaded images may be retained temporarily for reliability and abuse prevention; logs are retained for a reasonable period for security and troubleshooting.</li>
        <li><strong>Your Rights:</strong> you may request access, rectification, erasure, restriction, portability, and object to processing. Where processing is based on consent, you may withdraw consent at any time without affecting prior processing. To exercise rights, contact <a href="mailto:support@food2photo.com">support@food2photo.com</a>. You have the right to lodge a complaint with a supervisory authority.</li>
        <li><strong>Children:</strong> the Service is not intended for children under 16. Do not create an account or upload personal data of children.</li>
        <li><strong>Security:</strong> we implement appropriate technical and organizational measures to protect personal data, recognizing that no system is perfectly secure.</li>
        <li><strong>DPA:</strong> If you are a business customer requiring a Data Processing Addendum, contact us; we can provide a DPA incorporating the EU SCCs/UK Addendum where appropriate.</li>
      </ul>

      <h2 id="changes"><span className="text-sm font-semibold mr-2 text-muted-foreground">21.</span> Changes to the Service and Terms</h2>
      <p>
        We may modify the Service and these Terms. If we make material changes, we will provide notice (e.g., in‑app notice or email). The changes take effect on the indicated date. Your continued use after the effective date constitutes acceptance.
      </p>

      <h2 id="disclaimers"><span className="text-sm font-semibold mr-2 text-muted-foreground">16.</span> Disclaimers</h2>
      <p>
        The Service and Outputs are provided “as is” and “as available.” To the maximum extent permitted by law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non‑infringement. We do not warrant that the Service will be uninterrupted, error‑free, or that Outputs will meet your requirements.
      </p>

      <h2 id="limitation-of-liability"><span className="text-sm font-semibold mr-2 text-muted-foreground">17.</span> Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Food2Photo will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or business, arising out of or in connection with these Terms or the use of the Service. Our aggregate liability for all claims relating to the Service will not exceed the greater of (a) the amounts paid by you to Food2Photo in the 12 months preceding the claim, or (b) US$50. Consumer rights that cannot be limited by contract remain unaffected.
      </p>

      <h2 id="term-suspension-and-termination"><span className="text-sm font-semibold mr-2 text-muted-foreground">19.</span> Term, Suspension, and Termination</h2>
      <p>
        You may stop using the Service at any time and may cancel a subscription through your account or billing portal. We may suspend or terminate your access for violations of these Terms, risk to the Service, or as required by law. Provisions that by their nature should survive termination (e.g., ownership, disclaimers, limitation of liability) survive.
      </p>

      <h2 id="indemnification"><span className="text-sm font-semibold mr-2 text-muted-foreground">18.</span> Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless Food2Photo from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorney fees) arising out of or in any way connected with your User Content, your use of the Service, or your violation of these Terms or applicable law.
      </p>

      <h2 id="governing-law-and-venue"><span className="text-sm font-semibold mr-2 text-muted-foreground">20.</span> Governing Law and Venue</h2>
      <p>
        These Terms are governed by the laws of Sweden, without regard to conflict‑of‑laws rules. If you are a consumer resident in the EEA or UK, you may benefit from mandatory provisions of the law of your habitual residence, and you may bring proceedings in your local courts. Otherwise, the exclusive venue is the courts located in Stockholm, Sweden.
      </p>

      <h2 id="miscellaneous"><span className="text-sm font-semibold mr-2 text-muted-foreground">22.</span> Miscellaneous</h2>
      <ul>
        <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Food2Photo regarding the Service.</li>
        <li><strong>Severability:</strong> If any provision is held invalid, the remaining provisions remain in full force.</li>
        <li><strong>No Assignment:</strong> You may not assign these Terms without our consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.</li>
        <li><strong>Force Majeure:</strong> We are not responsible for delays or failures due to events beyond our reasonable control.</li>
        
      </ul>

      <h2 id="contact"><span className="text-sm font-semibold mr-2 text-muted-foreground">23.</span> Contact</h2>
      <p>
        Questions? Contact <a href="mailto:support@food2photo.com">support@food2photo.com</a>.
      </p>

      <h3 id="important-notice">Important Notice</h3>
      <p>
        This document is a general legal template adapted to Food2Photo’s functionality and third‑party services. It does not constitute legal advice. Your specific circumstances (e.g., place of establishment, governing law, and consumer protections) may require updates—particularly the governing law/venue and any required local disclosures or EU/UK representative details if applicable.
      </p>
    </div>
  );
}

