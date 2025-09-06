"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "../../lib/api"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { LoadingSpinner } from "../ui/loading-spinner"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface User {
  id: string
  name: string
  username: string
  emailId: string
  role: string
  phoneNo: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  mode: "create" | "edit"
}

const createUserSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  role: Yup.string().required("Role is required"),
  phoneNo: Yup.string()
    .matches(/^[+]?[\d\s\-()]{10,}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  emailId: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().when("mode", {
    is: "create",
    then: (schema) =>
      schema
        .min(8, "Password must be at least 8 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])/,
          "Password must contain uppercase, lowercase, number and special character(@$!%*?&)",
        )
        .required("Password is required"),
    otherwise: (schema) =>
      schema
        .min(8, "Password must be at least 8 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])/,
          "Password must contain uppercase, lowercase, number, and special character(@$!%*?&)",
        ),
  }),
})

export function UserModal({ isOpen, onClose, user, mode }: UserModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)

  const initialValues = {
    name: user?.name || "",
    role: user?.role || "",
    phoneNo: user?.phoneNo || "",
    emailId: user?.emailId || "",
    password: "",
    mode,
  }

  const createMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({
        title: "Success",
        description: t('addUser.userCreatedSuccessfully'),
        className: "bg-success text-white [&_button]:text-white"
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || t('addUser.failedToCreateUser'),
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({
        title: "Success",
        description: t('addUser.userUpdatedSuccessfully'),
        className: "bg-success text-white [&_button]:text-white"
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || t('addUser.failedToUpdateUser'),
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (values: any) => {
    const { mode: _, ...submitData } = values

    // Add username field based on phoneNo for create
    if (mode === "create") {
      submitData.username = submitData.phoneNo
    }

    // Remove password if it's empty for edit mode
    if (mode === "edit" && !submitData.password) {
      delete submitData.password
    }

    if (mode === "create") {
      createMutation.mutate(submitData)
    } else if (user) {
      updateMutation.mutate({ id: user.id, data: submitData })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === "create" ? t('addUser.modal.createUserTitle') : t('addUser.modal.editUserTitle')}
          </DialogTitle>
        </DialogHeader>

        <Formik initialValues={initialValues} validationSchema={createUserSchema} onSubmit={handleSubmit}>
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                    {t('addUser.modal.userInputName')}
                  </Label>
                  <Field
                    as={Input}
                    id="name"
                    name="name"
                    placeholder={t('addUser.modal.enterFullname')}
                    className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                      errors.name && touched.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && touched.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">
                    {t('addUser.modal.userRole')}
                  </Label>
                  <Select value={values.role} onValueChange={(value) => setFieldValue("role", value)}>
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                        errors.role && touched.role ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder={t('addUser.modal.selectRole')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="Admin" className="text-gray-900 dark:text-gray-100">
                        Admin
                      </SelectItem>
                      <SelectItem value="Executive" className="text-gray-900 dark:text-gray-100">
                        Executive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && touched.role && <p className="text-sm text-red-500">{errors.role}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNo" className="text-gray-700 dark:text-gray-300">
                    {t('addUser.modal.userPhoneNumber')}
                  </Label>
                  <Field
                    as={Input}
                    id="phoneNo"
                    name="phoneNo"
                    placeholder={t('addUser.modal.enterPhomeNumber')}
                    className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                      errors.phoneNo && touched.phoneNo ? "border-red-500" : ""
                    }`}
                  />
                  {errors.phoneNo && touched.phoneNo && <p className="text-sm text-red-500">{errors.phoneNo}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="emailId" className="text-gray-700 dark:text-gray-300">
                    {t('addUser.modal.userEmail')}
                  </Label>
                  <Field
                    as={Input}
                    id="emailId"
                    name="emailId"
                    type="email"
                    placeholder={t('addUser.modal.enterEmailAddress')}
                    className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                      errors.emailId && touched.emailId ? "border-red-500" : ""
                    }`}
                  />
                  {errors.emailId && touched.emailId && <p className="text-sm text-red-500">{errors.emailId}</p>}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  {t('addUser.modal.password')} {mode === "create" ? "*" : t('addUser.modal.LeaveBlankToKeepCurrent')}
                </Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "create" ? t('addUser.modal.enterPassword') : t('addUser.modal.enterNewPassword')}
                    className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 pr-10 ${
                      errors.password && touched.password ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 dark:text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && touched.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('addUser.modal.passwordErrorText1')}
                  </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-brand-primary hover:bg-brand-dark text-white"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : mode === "create" ? t('addUser.createUserButton') : t('addUser.updateUserButton')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
