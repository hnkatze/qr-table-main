import { redirect } from 'next/navigation';

/** /platform has no page of its own — send admins to the commerces overview. */
export default function PlatformIndexPage() {
  redirect('/platform/commerces');
}
