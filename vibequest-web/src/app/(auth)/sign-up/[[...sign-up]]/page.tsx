import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-white text-2xl font-bold mb-2">Join VibeQuest!</h1>
        <p className="text-purple-200 mb-8">Start your child&apos;s coding adventure today.</p>
        <SignUp />
      </div>
    </div>
  );
}
