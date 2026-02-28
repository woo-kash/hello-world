import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--vq-bg)' }}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div style={{ width: 80, height: 80, borderRadius: 18, overflow: 'hidden' }}>
            <Image src="/logo.png" width={80} height={80} alt="VibeQuest" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--vq-text)' }}>Join VibeQuest!</h1>
        <p className="mb-8" style={{ color: 'var(--vq-muted)' }}>Start your child&apos;s coding adventure today.</p>
        <SignUp />
      </div>
    </div>
  );
}
