"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../../hooks/use-toast"
import { useAuth } from "../../hooks/use-auth"
import { LoadingSpinner } from "../../components/ui/loading-spinner"
import { Eye, EyeOff, LogIn } from "lucide-react"

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      await login(values.email, values.password)
      toast({
        title: "Welcome !",
        description: "You have successfully logged in to KFT Management System",
        className: "bg-success text-white [&_button]:text-white",
      })
      navigate("/dashboard")
    } catch (error: any) {
      console.error("Login failed:", error)
      toast({
        title: "Authentication Failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-secondary/20 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" aria-hidden="true"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-2">
            <img src="../../../KFT-logo.png" alt= "KFT management systems logo" className="w-20 mx-auto"/>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Welcome
          </CardTitle>
          <CardDescription className="text-brand-dark/70 text-base">
            Sign in to your KFT Management System
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-brand-dark font-medium">
                    Email Address
                  </Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    aria-describedby={errors.email && touched.email ? "email-error" : undefined}
                    className={`h-12 border-2 transition-all duration-200 focus:border-brand-primary ${
                      errors.email && touched.email ? "border-error" : "border-gray-custom hover:border-brand-secondary"
                    }`}
                  />
                  {errors.email && touched.email && (
                    <p id="email-error" className="text-sm text-error font-medium" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-brand-dark font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-describedby={errors.password && touched.password ? "password-error" : undefined}
                      className={`h-12 pr-12 border-2 transition-all duration-200 focus:border-brand-primary ${
                        errors.password && touched.password
                          ? "border-error"
                          : "border-gray-custom hover:border-brand-secondary"
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-brand-dark/60 hover:text-brand-primary"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  {errors.password && touched.password && (
                    <p id="password-error" className="text-sm text-error font-medium" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* <div className="flex items-center justify-between">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-primary hover:text-brand-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded"
                  >
                    Forgot your password?
                  </Link>
                </div> */}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                  disabled={isLoading}
                  aria-describedby={isLoading ? "loading-description" : undefined}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      <span id="loading-description">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                      Sign In
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
