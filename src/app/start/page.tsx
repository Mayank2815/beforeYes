import { PartnerAForm } from '@/components/forms/PartnerAForm'
import Link from 'next/link'

export const metadata = {
  title: 'Begin Assessment — BeforeYes',
}

export default function StartPage() {
  return (
    <main className="min-h-screen bg-brand-paper py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="font-heading text-xl text-brand-gold tracking-widest block mb-12">
          BeforeYes
        </Link>
        <h1 className="font-heading text-3xl text-brand-ink mb-3">Your Profile</h1>
        <p className="font-body text-sm text-brand-muted mb-10">
          Complete your profile first. You&apos;ll share a private link for your partner after.
        </p>
        <PartnerAForm />
        <p className="mt-8 font-body text-xs text-brand-muted text-center">
          Your data is session-based and deleted after 72 hours. No account required.
        </p>
      </div>
    </main>
  )
}
