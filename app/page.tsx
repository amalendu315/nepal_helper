"use client";
import { useContext, useState } from "react";
import VoucherForm from "@/components/voucherForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import AuthContext from "@/context/AuthContext";
import Sidebar from "@/components/sidebar";

export default function Home() {
  const {isAuthenticated, setIsAuthenticated} = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const defaultLoginCreds = {
    username:"Admin",
    password:"Admin"
  }

  const handleLogin = (
    username:string,
    password:string,
  ) => {
    setIsLoading(true);
    if (username === defaultLoginCreds.username && password === defaultLoginCreds.password) {
      setIsAuthenticated(true);
      setShowLoginForm(false);
      toast.success("Logged In")
      setIsLoading(false);
    } else {
      toast.error("Invalid Credentials");
      setIsLoading(false);
    }
  };

  if (showLoginForm) {
    return (
      <div className="flex flex-col items-center justify-center h-[88vh] gap-16 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-auto overflow-x-auto h-auto">
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-8">
              <Input
                type="text"
                placeholder="Username"
                onChange={(e) => setUserName(e.target.value)}
                className="h-12 border-none bg-transparent"
              />
              <Input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassWord(e.target.value)}
                className="h-12 border-none"
              />
              <Button
                type="submit"
                variant={"outline"}
                onClick={() => handleLogin(userName, passWord)}
                disabled={isLoading}
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[100vh] p-4 gap-16 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />
      <div className="w-full ml-64 flex-grow overflow-x-auto h-full">
        {isAuthenticated && <VoucherForm />}
      </div>
    </div>
  );
}
