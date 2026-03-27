import { redirect } from 'next/navigation';

/**
 * /signup — Disabled.
 *
 * EntitleFlow uses managed account provisioning: Jene deploys the initial
 * admin account for each client organization. Self-service signup is not
 * available. Visitors are redirected to the walkthrough request form.
 */
export default function SignupPage() {
  redirect('/walkthrough');
}
