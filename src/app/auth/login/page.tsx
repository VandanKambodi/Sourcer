import { LoginForm } from "@/components/auth/login-form"

const page = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black animate-in slide-in-from-bottom-[100%] duration-700 ease-in-out fade-in-0">
        <LoginForm />
    </div>
  )
}

export default page