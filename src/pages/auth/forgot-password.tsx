"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../../hooks/use-toast"
import { LoadingSpinner } from "../../components/ui/loading-spinner"
import { Mail, ArrowLeft, Shield, Lock } from "lucide-react"
import { authApi } from "../../lib/api"
// import { UserProfileDropdown } from "../../components/user-profile-dropdown"
// import { DateRangePicker } from "../../components/date-range-picker"
// import { CustomerDropdown } from "../../components/customer-dropdown"
// import { ReportTypeSelection } from "../../components/report-type-selection"
// import { ExcelDownload } from "../../components/excel-download"

const emailSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
})

const otpSchema = Yup.object().shape({
  otp: Yup.string().length(6, "OTP must be 6 digits").required("OTP is required"),
})

const passwordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])/, "Password must contain uppercase, lowercase, number and special character(@$!%*?&)")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
})

type Step = "email" | "otp" | "password" | "success"

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const { toast } = useToast()

  const handleEmailSubmit = async (values: { email: string }) => {
    setIsLoading(true)
    try {
      await authApi.forgotPassword(values.email)
      setEmail(values.email)
      setCurrentStep("otp")
      toast({
        title: "OTP Sent!",
        description: "Please check your email for the verification code",
        className: "bg-success/10 border-success text-success-foreground",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (values: { otp: string }) => {
    setIsLoading(true)
    try {
      await authApi.verifyOtp({ email, otp: values.otp })
      setOtp(values.otp)
      setCurrentStep("password")
      toast({
        title: "OTP Verified!",
        description: "Please set your new password",
        className: "bg-success/10 border-success text-success-foreground",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (values: { newPassword: string }) => {
    setIsLoading(true)
    try {
      await authApi.setNewPassword({ email, otp, newPassword: values.newPassword })
      setCurrentStep("success")
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been updated successfully",
        className: "bg-success/10 border-success text-success-foreground",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return (
          <>
            <CardHeader className="space-y-1 text-center pb-8">
              <div className="flex justify-center mb-2">
                <img src="../../../KFT-logo.png" alt= "KFT management systems logo" className="w-20 mx-auto"/>
              </div>
              <CardTitle className="text-3xl font-bold text-brand-dark">Forgot Password?</CardTitle>
              <CardDescription className="text-brand-dark/70 text-base">
                Enter your email address and we'll send you an OTP to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Formik initialValues={{ email: "" }} validationSchema={emailSchema} onSubmit={handleEmailSubmit}>
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
                        className={`h-12 border-2 transition-all duration-200 focus:border-brand-primary ${
                          errors.email && touched.email
                            ? "border-error"
                            : "border-gray-custom hover:border-brand-secondary"
                        }`}
                      />
                      {errors.email && touched.email && (
                        <p className="text-sm text-error font-medium" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </>
        )

      case "otp":
        return (
          <>
            <CardHeader className="space-y-1 text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg">
                  <Shield className="h-10 w-10 text-white" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-brand-dark">Verify OTP</CardTitle>
              <CardDescription className="text-brand-dark/70 text-base">
                Enter the 6-digit code sent to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Formik initialValues={{ otp: "" }} validationSchema={otpSchema} onSubmit={handleOtpSubmit}>
                {({ errors, touched }) => (
                  <Form className="space-y-5" noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-brand-dark font-medium">
                        Verification Code
                      </Label>
                      <Field
                        as={Input}
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className={`h-12 border-2 transition-all duration-200 focus:border-brand-primary text-center text-lg tracking-widest ${
                          errors.otp && touched.otp ? "border-error" : "border-gray-custom hover:border-brand-secondary"
                        }`}
                      />
                      {errors.otp && touched.otp && (
                        <p className="text-sm text-error font-medium" role="alert">
                          {errors.otp}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5" aria-hidden="true" />
                          Verify OTP
                        </>
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </>
        )

      case "password":
        return (
          <>
            <CardHeader className="space-y-1 text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg">
                  <Lock className="h-10 w-10 text-white" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-brand-dark">Set New Password</CardTitle>
              <CardDescription className="text-brand-dark/70 text-base">
                Create a strong password for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Formik
                initialValues={{ newPassword: "", confirmPassword: "" }}
                validationSchema={passwordSchema}
                onSubmit={handlePasswordSubmit}
              >
                {({ errors, touched }) => (
                  <Form className="space-y-5" noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-brand-dark font-medium">
                        New Password
                      </Label>
                      <Field
                        as={Input}
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        className={`h-12 border-2 transition-all duration-200 focus:border-brand-primary ${
                          errors.newPassword && touched.newPassword
                            ? "border-error"
                            : "border-gray-custom hover:border-brand-secondary"
                        }`}
                      />
                      {errors.newPassword && touched.newPassword && (
                        <p className="text-sm text-error font-medium" role="alert">
                          {errors.newPassword}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-brand-dark font-medium">
                        Confirm Password
                      </Label>
                      <Field
                        as={Input}
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        className={`h-12 border-2 transition-all duration-200 focus:border-brand-primary ${
                          errors.confirmPassword && touched.confirmPassword
                            ? "border-error"
                            : "border-gray-custom hover:border-brand-secondary"
                        }`}
                      />
                      {errors.confirmPassword && touched.confirmPassword && (
                        <p className="text-sm text-error font-medium" role="alert">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" aria-hidden="true" />
                          Reset Password
                        </>
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </>
        )

      case "success":
        return (
          <>
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-success to-success/80 rounded-2xl shadow-lg">
                  <Shield className="h-10 w-10 text-white" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-brand-dark">Password Reset Successful!</CardTitle>
              <CardDescription className="text-brand-dark/70">
                Your password has been updated successfully. You can now login with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 rounded-md"
              >
                Go to Login
              </Link>
            </CardContent>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        {/* <UserProfileDropdown /> */}
        {renderStepContent()}
        {currentStep !== "success" && (
          <CardContent className="text-center pt-0">
            <Link
              to="/login"
              className="inline-flex items-center text-brand-primary hover:text-brand-secondary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </CardContent>
        )}
        {currentStep === "success" && (
          <CardContent className="space-y-4">
            {/* <DateRangePicker />
            <CustomerDropdown />
            <ReportTypeSelection />
            <ExcelDownload /> */}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
