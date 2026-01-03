"use client";

import { CardWrapper } from "./card-wrapper";
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
import { HRRegisterSchema } from "@/lib";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Loader2, Mail, Upload, User, Phone, Building2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Register } from "@/actions/auth/signup";
import Image from "next/image";
import { X } from "lucide-react";

export function RegisterForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(HRRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
      phoneNumber: "",
      companyLogo: "",
    },
  });

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const uploadToastId = toast.loading("Uploading logo...");
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload/logo", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          toast.error("Failed to upload logo", { id: uploadToastId });
          return;
        }
        const data = await response.json();
        form.setValue("companyLogo", data.secure_url);
        toast.success("Logo uploaded successfully!", { id: uploadToastId });
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Error uploading logo", { id: uploadToastId });
      }
    }
  };

  const onSubmit = (values: z.infer<typeof HRRegisterSchema>) => {
    const toastId = toast.loading("Registering...");
    startTransition(() => {
      Register(values)
        .then((data: { success?: string; error?: string }) => {
          if (data.error) {
            toast.error(data.error, { closeButton: true, id: toastId });
          } else {
            toast.success(data.success, { closeButton: true, id: toastId });
            form.reset();
            setLogoPreview(null);
          }
        })
        .catch(() => {
          toast.error("Something went wrong!", { closeButton: true, id: toastId });
        });
    });
  };

// Function to remove the logo and reset the field
  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLogoPreview(null);
    form.setValue("companyLogo", "");
  };

  // Styles using specific hex #CFCBC8
  const mainColor = "text-[#CFCBC8]";
  const borderColor = "border-[#CFCBC8]/30";
  const focusRing = "focus-visible:ring-[#CFCBC8] focus-visible:border-[#CFCBC8]";
  // Inputs need to be slightly lighter than pure black to be visible
  const inputBg = "bg-zinc-900/50"; 
  const inputStyles = `${inputBg} ${borderColor} ${mainColor} placeholder:text-[#CFCBC8]/40 ${focusRing} transition-all duration-300`;

  return (
    <CardWrapper
      headerLabel="Create an Account"
      headerdescription="Register with your Google account"
      backButtonHref="/auth/login"
      backButtonLable="Already have an account?"
      isDisabled={isPending}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 -mb-6">
          
          {/* Company Name */}
          <FormField
            control={form.control}
            name="companyName"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={mainColor}>Company Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building2 className={`absolute left-3 top-2.5 h-4 w-4 text-[#CFCBC8]/50`} />
                    <Input
                      placeholder="Acme Corp"
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

          {/* Company Logo */}
          <FormField
            control={form.control}
            name="companyLogo"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={mainColor}>Company Logo</FormLabel>
                <FormControl>
                  {/* UPDATED LOGIC: Toggle between Upload Box and Preview */}
                  <div className="w-full">
                    {!logoPreview ? (
                      // 1. Upload Box (Visible only when no image)
                      <label
                        htmlFor="logo-upload"
                        className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed ${borderColor} rounded-xl cursor-pointer hover:bg-[#CFCBC8]/5 hover:border-[#CFCBC8] transition-all duration-300 group`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-6 h-6 text-[#CFCBC8] mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-[#CFCBC8]">
                            Click to upload logo
                          </p>
                        </div>
                        <input
                          id="logo-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoChange}
                          disabled={isPending}
                        />
                      </label>
                    ) : (
                      // 2. Preview Box (Visible only when image exists)
                      <div className={`relative w-full h-28 ${inputBg} rounded-xl border ${borderColor} flex items-center justify-center overflow-hidden group`}>
                         <div className="relative w-full h-full p-4">
                            <Image
                              src={logoPreview}
                              alt="Logo Preview"
                              fill
                              className="object-contain"
                            />
                         </div>
                         
                         {/* Overlay with Remove Button */}
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={handleRemoveLogo}
                              className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-200 p-2 rounded-full transition-all transform hover:scale-110"
                              type="button"
                              title="Remove logo"
                            >
                                <X className="w-5 h-5" />
                            </button>
                         </div>

                         {/* Status Badge */}
                         <div className="absolute top-2 right-2 opacity-100 group-hover:opacity-0 transition-opacity">
                            <span className="text-[10px] bg-[#CFCBC8] text-black px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                UPLOADED
                            </span>
                         </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Name */}
             <FormField
                control={form.control}
                name="name"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={mainColor}>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className={`absolute left-3 top-2.5 h-4 w-4 text-[#CFCBC8]/50`} />
                        <Input
                          placeholder="John Doe"
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

              {/* Phone */}
              <FormField
                control={form.control}
                name="phoneNumber"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={mainColor}>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className={`absolute left-3 top-2.5 h-4 w-4 text-[#CFCBC8]/50`} />
                        <Input
                          placeholder="+7861950230"
                          {...field}
                          disabled={isPending}
                          type="tel"
                          className={`${inputStyles} pl-10`}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={mainColor}>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-2.5 h-4 w-4 text-[#CFCBC8]/50`} />
                    <Input
                      placeholder="name@company.com"
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

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={mainColor}>Password</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                      type={isPasswordVisible ? "text" : "password"}
                      className={`${inputStyles} pr-10`}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CFCBC8]/70 hover:text-[#CFCBC8] transition-colors p-1"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
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
              </FormItem>
            )}
          />

          <Button
            disabled={isPending}
            type="submit"
            className="w-full py-6 text-base font-bold shadow-lg hover:shadow-[#CFCBC8]/20 transition-all mt-2 bg-[#CFCBC8] text-black hover:bg-[#CFCBC8]/90"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Mail className="mr-2 h-5 w-5" />
            )}
            Create Account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}