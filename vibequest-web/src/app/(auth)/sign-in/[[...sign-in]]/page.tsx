import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h1 className="text-white text-2xl font-bold mb-8">Welcome back to VibeQuest!</h1>
        <SignIn />
      </div>
    </div>
  );
}
