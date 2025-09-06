"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useToast } from "../../hooks/use-toast"
import { authApi } from "../../lib/api"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { Lock, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/use-auth"
import { useTranslation } from "react-i18next"

const changePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])/, "Password must contain uppercase, lowercase, number and special character(@$!%*?&)")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
})

export function ChangePasswordSection() {
  const { t } = useTranslation();
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast({
        title: "Success",
        description: t('changePassword.passwordChangeSuccessfullyMessage'),
        duration: 3000,
        className: "bg-success text-white [&_button]:text-white",
      })
      // Redirect to login after success
      setTimeout(() => {
        localStorage.clear()
        logout()
        navigate("/login")
      }, 2000)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || t('changePassword.failedToChangePassword'),
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const handlePasswordChange = (values: any, { resetForm, setFieldError }: any) => {
    // Check if new password is different from old password
    if (values.oldPassword === values.newPassword) {
      setFieldError("newPassword", "New password must be different from current password")
      toast({
        title: "Error",
        description: t('changePassword.NewPasswordMustBeDifferentFromCurrentPassword'),
        variant: "destructive",
      })
      return
    }

    // Only send oldPassword and newPassword to API
    const payload = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    }
    changePasswordMutation.mutate(payload, {
      onSuccess: () => {
        resetForm()
      },
      onError: (error: any) => {
        // Handle server-side validation errors
        if (error.response?.data?.message?.includes("current password")) {
          setFieldError("oldPassword", "Current password is incorrect")
        }
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t('changePassword.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={changePasswordSchema}
          onSubmit={handlePasswordChange}
        >
          {({ errors, touched}) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">
                  {t('changePassword.inputCurrentPassword')}
                </Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="oldPassword"
                    name="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    placeholder={t('changePassword.enterCurrentPassword')}
                    className={`pr-10 ${errors.oldPassword && touched.oldPassword ? "border-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.oldPassword && touched.oldPassword && (
                  <p className="text-sm text-red-500">{errors.oldPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  {t('changePassword.inputNewPassword')}
                </Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t('changePassword.enterNewPassword')}
                    className={`pr-10 ${errors.newPassword && touched.newPassword ? "border-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.newPassword && touched.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword}</p>
                )}
                <p className="text-xs text-gray-500">
                  {t('changePassword.passworderrorText')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('changePassword.inputConfirmNewPassword')}
                </Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('changePassword.confirmNewPassowrd')}
                    className={`pr-10 ${
                      errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" disabled={changePasswordMutation.isPending} className="w-full bg-brand-primary hover:bg-brand-dark text-white">
                {changePasswordMutation.isPending ? t('changePassword.Changingtext') : t('changePassword.title')}
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  )
}
