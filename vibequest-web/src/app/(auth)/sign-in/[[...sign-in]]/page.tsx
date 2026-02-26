import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--vq-bg)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--vq-text)' }}>Welcome back to VibeQuest!</h1>
        <SignIn />
      </div>
    </div>
  );
}
