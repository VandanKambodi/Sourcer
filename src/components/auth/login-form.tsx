"use client";

import { CardWrapper } from "./card-wrapper";
import { Signin } from "@/actions/auth/login";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SigninSchema } from "@/lib";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT, ROLE_REDIRECTS } from "@/routes";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const searchparams = useSearchParams();
  const callbackUrl = searchparams.get("callbackUrl");
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SigninSchema>) => {
    const toastId = toast.loading("Logging in...");

    startTransition(async () => {
      try {
        const data = await Signin(values, callbackUrl);

        if (data?.error) {
          toast.error(data.error, { id: toastId, closeButton: true });
          return;
        }

        await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        toast.success("Logged in!", { id: toastId, closeButton: true });

        if (data?.needsPasswordChange) {
          router.push(`/auth/change-password?userId=${data.userId}`);
          return;
        }

        if (data?.userRole) {
          const redirectPath =
            ROLE_REDIRECTS[data.userRole] ?? DEFAULT_LOGIN_REDIRECT;

          router.push(redirectPath);
          return;
        }

        router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT);
      } catch (err: any) {
        toast.error(`Something went wrong: ${err?.message || ""}`, {
          id: toastId,
          closeButton: true,
        });
      }
    });
  };

  // --- STYLES (Matching RegisterForm) ---
  const gradientText = "bg-gradient-to-r from-[#CFCBC8] to-[#9E9B98] bg-clip-text text-transparent font-bold";
  const borderColor = "border-[#CFCBC8]/30";
  const focusRing = "focus-visible:ring-[#CFCBC8] focus-visible:border-[#CFCBC8]";
  const inputBg = "bg-zinc-900/50"; 
  const inputStyles = `${inputBg} ${borderColor} text-[#CFCBC8] placeholder:text-[#CFCBC8]/40 ${focusRing} transition-all duration-300`;
  const iconColor = "text-[#CFCBC8]/50";

  return (
    <CardWrapper
      headerLabel="Welcome back"
      headerdescription="Login with your Google account"
      backButtonHref="/auth/signup"
      backButtonLable="Don't have an account?"
      isDisabled={isPending}
    >
      <Form {...form}>
        {/* Added -mb-6 to reduce space between button and footer link */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 -mb-6">
          
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={gradientText}>Email</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className={`absolute left-3 top-2.5 h-4 w-4 ${iconColor} group-hover:text-[#CFCBC8] transition-colors`} />
                    <Input
                      placeholder="xyz@gmail.com"
                      {...field}
                      disabled={isPending}
                      className={`${inputStyles} pl-10`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={gradientText}>Password</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className={`absolute left-3 top-2.5 h-4 w-4 ${iconColor} group-hover:text-[#CFCBC8] transition-colors`} />
                    <Input
                      placeholder="Enter your Password"
                      {...field}
                      disabled={isPending}
                      type={isPasswordVisible ? "text" : "password"}
                      className={`${inputStyles} pl-10 pr-10`}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CFCBC8]/50 hover:text-[#CFCBC8] transition-colors p-1"
                      onClick={() => {
                        setIsPasswordVisible(!isPasswordVisible);
                      }}
                      type="button"
                    >
                      {isPasswordVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
                
                {/* Forgot Password Link - Styled to match theme */}
                <Button
                  disabled={isPending}
                  className="mt-[1px] h-0 px-0 pt-2 font-normal text-[13px] flex justify-start text-[#CFCBC8]/80 hover:text-[#CFCBC8]"
                  variant="link"
                  size={"sm"}
                  asChild
                >
                  <Link href="#" className="text-start">
                    Forget password?
                  </Link>
                </Button>
              </FormItem>
            )}
          />

          {/* Submit Button - Gradient Style */}
          <Button
            disabled={isPending}
            type="submit"
            className="w-full py-6 text-base font-bold shadow-lg mt-2 text-black
            bg-gradient-to-r from-[#CFCBC8] via-[#E6E2DF] to-[#9E9B98]
            hover:bg-gradient-to-br hover:from-[#E6E2DF] hover:via-[#CFCBC8] hover:to-[#B0ADA9]
            transition-all duration-500 bg-[length:200%_auto] hover:bg-right"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Mail className="mr-2 h-5 w-5" />
            )}
            Login with Mail
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}