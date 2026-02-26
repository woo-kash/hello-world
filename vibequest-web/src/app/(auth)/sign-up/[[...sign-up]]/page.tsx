import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--vq-bg)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--vq-text)' }}>Join VibeQuest!</h1>
        <p className="mb-8" style={{ color: 'var(--vq-muted)' }}>Start your child&apos;s coding adventure today.</p>
        <SignUp />
      </div>
    </div>
  );
}
