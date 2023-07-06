import { SignIn } from './components/SignIn';

export default function SignInPage() {
  return (
    <div className="absolute inset-0 top-20">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
        <SignIn />
      </div>
    </div>
  );
}
