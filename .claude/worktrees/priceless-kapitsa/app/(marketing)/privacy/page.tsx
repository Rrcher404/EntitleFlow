import { buildMetadata } from "@/lib/site-config";
import { siteConfig } from "@/lib/site-config";
import { SectionShell } from "@/components/site/section-shell";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How EntitleFlow NC collects, uses, and protects personal information submitted through our marketing site.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <SectionShell className="py-16">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Effective date: March 16, 2026
          </p>
        </div>

        <div className="space-y-8 text-base leading-7 text-slate-700">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-slate-950">
              Who we are
            </h2>
            <p>
              EntitleFlow NC (&ldquo;EntitleFlow,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us&rdquo;) provides development approval operations
              software for North Carolina architecture and civil firms. This
              privacy policy covers information collected through our public
              marketing site at{" "}
              <span className="font-medium text-slate-900">
                {siteConfig.siteUrl}
              </span>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-slate-950">
              Information we collect
            </h2>
            <p>
              When you submit a walkthrough request or join our early-access
              list, we collect the information you provide in the form,
              including your name, work email address, company name, company
              type, jurisdiction information, and any optional notes.
            </p>
            <p>
              We also collect basic analytics data through Vercel Analytics,
              which may include page views, referrer information, and general
              device or browser metadata. This data is aggregated and does not
              include personally identifiable information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-slate-950">
              How we use your information
            </h2>
            <p>We use the information you provide to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Respond to your walkthrough request or early-access sign-up
              </li>
              <li>
                Schedule and prepare for founder-led walkthrough sessions
              </li>
              <li>
                Send launch updates, guide releases, and pilot availability
                notices
              </li>
              <li>Improve the site experience and product direction</li>
            </ul>
            <p>
              We do not sell, rent, or share your personal information with
              third parties for their marketing purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-slate-950">
              Data storage and security
            </h2>
            <p>
              Form submissions are stored securely in a Supabase-hosted
              PostgreSQL database. Access to this data is restricted to
              EntitleFlow team members. We use server-side API routes to handle
              form submissions and do not expose database credentials to the
              browser.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-slate-950">
              Third-party services
            </h2>
            <p>This site uses the following third-party services:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <span className="font-medium text-slate-900">
                  Vercel
                </span>{" "}
                — hosting and aggregated analytics
              </li>
              <li>
                <span className="font-medium text-slate-900">
                  Supabase
                </span>{" "}
                — secure lead storage
              </li>
              <li>
                <span className="font-medium text-slate-900">
                  Calendly
                </span>{" "}
                — walkthrough scheduling (when you choose to book)
              </li>
            </ul>
            <p>
              Each service has its own privacy policy governing how they handle
              data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-slate-950">
              Your rights
            </h2>
            <p>
              You may request access to, correction of, or deletion of your
              personal information at any time by contacting us at{" "}
              <a
                className="font-medium text-slate-900 underline underline-offset-4"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-slate-950">
              Changes to this policy
            </h2>
            <p>
              We may update this policy as our practices evolve. Material
              changes will be noted on this page with an updated effective date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-slate-950">
              Contact
            </h2>
            <p>
              If you have questions about this privacy policy or your data,
              email us at{" "}
              <a
                className="font-medium text-slate-900 underline underline-offset-4"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </SectionShell>
  );
}
